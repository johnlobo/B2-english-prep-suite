import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { DEFAULT_B2_DATA } from '../data/b2Data';
import { ModuleData, Question } from '../types';

const CONTENT_COLLECTION = 'content';
const CONTENT_META_DOC = 'content_meta';

function moduleDocId(index: number): string {
  return `module_${index}`;
}

/** Parsed rows coming back from POST /api/sheets/sync */
export interface SyncedQuestionRow {
  moduleIndex: number;
  dayIndex?: number;
  question: string;
  options: { a: string; b: string; c: string; d: string };
  correctOption: 'a' | 'b' | 'c' | 'd';
  explanation: string;
}

export interface SyncedTheoryRow {
  moduleIndex: number;
  dayIndex: number;
  cheatSheetLines: string[];
}

/** Reads all module docs from Firestore. Returns null if the collection hasn't been seeded yet. */
export async function fetchModulesFromFirestore(): Promise<ModuleData[] | null> {
  const snap = await getDocs(collection(db, CONTENT_COLLECTION));
  if (snap.empty) return null;
  const modules = snap.docs.map((d) => d.data() as ModuleData);
  modules.sort((a, b) => a.index - b.index);
  return modules;
}

/** One-time seed from the bundled static bank. Requires admin write access (see firestore.rules). */
export async function seedDefaultContent(): Promise<ModuleData[]> {
  await Promise.all(
    DEFAULT_B2_DATA.map((mod) => setDoc(doc(db, CONTENT_COLLECTION, moduleDocId(mod.index)), mod))
  );
  return DEFAULT_B2_DATA;
}

/**
 * Returns a complete, index-0..N module array, repairing any gaps against the bundled defaults.
 * Gaps can happen because the initial seed fires all module writes in parallel (Promise.all) —
 * if one write fails, the others still commit, silently leaving a module missing forever unless
 * something notices and re-writes just that one.
 *
 * When `canWrite` is true (the caller is admin), missing modules are persisted back to Firestore
 * so the gap is fixed for everyone. Non-admins still get a complete array to render (falling back
 * to the bundled copy for whatever's missing), they just can't repair Firestore itself.
 */
export async function getCompleteModules(canWrite: boolean): Promise<ModuleData[]> {
  const fetched = await fetchModulesFromFirestore();

  if (!fetched) {
    if (canWrite) return seedDefaultContent();
    return DEFAULT_B2_DATA;
  }

  const presentIndexes = new Set(fetched.map((m) => m.index));
  const missing = DEFAULT_B2_DATA.filter((mod) => !presentIndexes.has(mod.index));
  if (missing.length === 0) return fetched;

  console.warn(
    `Content collection is missing module(s) [${missing.map((m) => m.index).join(', ')}] — ` +
    (canWrite ? 're-seeding them now.' : 'using the bundled copy for this session.')
  );

  if (canWrite) {
    await Promise.all(
      missing.map((mod) => setDoc(doc(db, CONTENT_COLLECTION, moduleDocId(mod.index)), mod))
    );
  }

  return [...fetched, ...missing].sort((a, b) => a.index - b.index);
}

/** Admin "restore defaults" action: overwrites Firestore content with the bundled static bank. */
export async function resetContentToDefaults(): Promise<ModuleData[]> {
  const modules = await seedDefaultContent();
  await setDoc(doc(db, 'system', CONTENT_META_DOC), {
    lastSyncedAt: null,
    lastSyncedBy: null,
    sheetUrl: null,
  });
  return modules;
}

interface ContentMeta {
  lastSyncedAt: string | null;
  lastSyncedBy: string | null;
  sheetUrl: string | null;
}

export async function fetchContentMeta(): Promise<ContentMeta> {
  const snap = await getDoc(doc(db, 'system', CONTENT_META_DOC));
  if (!snap.exists()) return { lastSyncedAt: null, lastSyncedBy: null, sheetUrl: null };
  const data = snap.data();
  return {
    lastSyncedAt: data.lastSyncedAt ?? null,
    lastSyncedBy: data.lastSyncedBy ?? null,
    sheetUrl: data.sheetUrl ?? null,
  };
}

// Collapses internal whitespace too (not just leading/trailing), since copy-pasting question
// banks into Sheets/Excel commonly introduces double spaces or stray newlines that would
// otherwise make an identical question look "new" and get imported as a duplicate.
function normalizeQuestionText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function questionAlreadyExists(existing: Question[], incoming: SyncedQuestionRow): boolean {
  const incomingNormalized = normalizeQuestionText(incoming.question);
  return existing.some((q) => normalizeQuestionText(q.question) === incomingNormalized);
}

/**
 * Merges questions/theory rows parsed from a Sheets sync directly into the Firestore module docs,
 * so the update is immediately visible to every signed-in student (not just the device that synced).
 */
export async function mergeSyncedContentIntoFirestore(
  questions: SyncedQuestionRow[],
  theories: SyncedTheoryRow[],
  sheetUrl: string,
  syncedByEmail: string | null
): Promise<{ modules: ModuleData[]; questionsAdded: number; theoryLinesAdded: number }> {
  // true: this function is only reachable from the admin-only Sheets sync UI, so writes are allowed.
  const current = await getCompleteModules(true);
  // Deep clone so we don't mutate cached references while building the write.
  const modules: ModuleData[] = JSON.parse(JSON.stringify(current));

  let questionsAdded = 0;
  let theoryLinesAdded = 0;
  const touchedModuleIndexes = new Set<number>();

  for (const q of questions) {
    const targetModule = modules.find((m) => m.index === q.moduleIndex);
    if (!targetModule) continue;

    const newQuestion: Question = {
      id: `sheet_${q.moduleIndex}_${q.dayIndex ?? 'exam'}_${targetModule.days.reduce((n, d) => n + d.practiceQuestions.length, 0) + targetModule.controlExam.length}_${Date.now()}`,
      moduleIndex: q.moduleIndex,
      // Firestore's setDoc() rejects any explicit `undefined` field value, so control-exam
      // questions (no Day column in the sheet) must omit dayIndex entirely rather than set it
      // to undefined — matching how the bundled DEFAULT_B2_DATA control-exam questions do it.
      ...(q.dayIndex !== undefined ? { dayIndex: q.dayIndex } : {}),
      question: q.question,
      options: q.options,
      correctOption: q.correctOption,
      explanation: q.explanation,
    };

    if (q.dayIndex !== undefined && targetModule.days[q.dayIndex]) {
      const targetDay = targetModule.days[q.dayIndex];
      if (!questionAlreadyExists(targetDay.practiceQuestions, q)) {
        targetDay.practiceQuestions.push(newQuestion);
        questionsAdded++;
        touchedModuleIndexes.add(q.moduleIndex);
      }
    } else if (!questionAlreadyExists(targetModule.controlExam, q)) {
      targetModule.controlExam.push(newQuestion);
      questionsAdded++;
      touchedModuleIndexes.add(q.moduleIndex);
    }
  }

  for (const t of theories) {
    const targetModule = modules.find((m) => m.index === t.moduleIndex);
    const targetDay = targetModule?.days[t.dayIndex];
    if (!targetDay) continue;

    for (const line of t.cheatSheetLines) {
      if (!targetDay.cheatSheet.includes(line)) {
        targetDay.cheatSheet.push(line);
        theoryLinesAdded++;
        touchedModuleIndexes.add(t.moduleIndex);
      }
    }
  }

  await Promise.all(
    Array.from(touchedModuleIndexes).map((idx) => {
      const mod = modules.find((m) => m.index === idx)!;
      return setDoc(doc(db, CONTENT_COLLECTION, moduleDocId(idx)), mod);
    })
  );

  await setDoc(doc(db, 'system', CONTENT_META_DOC), {
    lastSyncedAt: new Date().toISOString(),
    lastSyncedBy: syncedByEmail,
    sheetUrl,
  });

  return { modules, questionsAdded, theoryLinesAdded };
}
