import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserProgress } from '../types';

export const ADMIN_BOOTSTRAP_EMAIL = 'admin@b2mastery.es';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  mustChangePassword?: boolean;
  createdAt?: string;
}

function defaultUserData(uid: string, email: string): SessionUser {
  const isAdminEmail = email === ADMIN_BOOTSTRAP_EMAIL;
  return {
    id: uid,
    name: isAdminEmail ? 'Administrador' : 'Estudiante',
    email,
    role: isAdminEmail ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
  };
}

function defaultProgressData(uid: string): UserProgress {
  return { userId: uid, completedTheory: [], practiceAttempts: {}, examAttempts: [] };
}

export async function isAdminSetupComplete(): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'system', 'setup'));
    return snap.exists() ? !!snap.data().adminSetupComplete : false;
  } catch {
    return false;
  }
}

/**
 * Loads (creating on first login) the Firestore `users/{uid}` doc, then auto-repairs the admin
 * role/name and the bootstrap-admin `mustChangePassword` flag so a session restored from a stale
 * doc (or from a promotion via the Users panel) stays consistent. Falls back to `fallbackCache`
 * (e.g. a cached localStorage copy) if Firestore is unreachable.
 *
 * `precomputedSetupComplete` lets a caller that already fetched `system/setup` (e.g. Auth.tsx,
 * which checks it on mount to render the bootstrap-credentials banner) skip a redundant read.
 */
export async function loadUserProfile(
  uid: string,
  email: string,
  fallbackCache: SessionUser | null,
  precomputedSetupComplete?: boolean
): Promise<SessionUser> {
  const userRef = doc(db, 'users', uid);
  let userData: SessionUser;

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      userData = snap.data() as SessionUser;
    } else {
      userData = defaultUserData(uid, email);
      await setDoc(userRef, userData);
    }
  } catch (err) {
    console.warn('Firestore user fetch failed, falling back to cached user state:', err);
    userData = fallbackCache ?? defaultUserData(uid, email);
  }

  const isAdminEmail = email === ADMIN_BOOTSTRAP_EMAIL;
  let needsUpdate = false;

  if (isAdminEmail && userData.role !== 'admin') {
    userData.role = 'admin';
    needsUpdate = true;
  }
  if (isAdminEmail && userData.name === 'Estudiante') {
    userData.name = 'Administrador';
    needsUpdate = true;
  }
  if (isAdminEmail && userData.mustChangePassword !== false) {
    const setupComplete = precomputedSetupComplete ?? (await isAdminSetupComplete());
    if (!setupComplete) {
      userData.mustChangePassword = true;
      needsUpdate = true;
    }
  }

  if (needsUpdate) {
    try {
      await setDoc(userRef, userData, { merge: true });
    } catch (err) {
      console.warn('Failed to auto-repair user profile on Firebase (might be rules):', err);
    }
  }

  return userData;
}

/** Loads (creating on first login) the Firestore `progress/{uid}` doc, with the same cache fallback. */
export async function loadUserProgress(
  uid: string,
  fallbackCache: UserProgress | null
): Promise<UserProgress> {
  const progressRef = doc(db, 'progress', uid);
  try {
    const snap = await getDoc(progressRef);
    if (snap.exists()) return snap.data() as UserProgress;
    const fresh = defaultProgressData(uid);
    await setDoc(progressRef, fresh);
    return fresh;
  } catch (err) {
    console.warn('Firestore progress fetch failed, falling back to cached progress state:', err);
    return fallbackCache ?? defaultProgressData(uid);
  }
}
