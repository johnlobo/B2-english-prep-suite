import React, { useState, useEffect } from 'react';
import { BookOpen, Award, FileText, CheckCircle, HelpCircle, GraduationCap, ArrowRight, Download, Sparkles, AlertCircle, Play, RefreshCw, Edit3, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { authedFetchWithRetry } from '../lib/fetchWithRetry';
import { ModuleData, Question, UserProgress } from '../types';

interface ModuleSectionProps {
  modules: ModuleData[];
  selectedModuleIndex: number;
  onSelectModule: (index: number) => void;
  progress: UserProgress;
  onUpdateProgress: (progress: any) => void;
  onLoadPodcastEpisode: (episode: any) => void;
}

export default function ModuleSection({
  modules,
  selectedModuleIndex,
  onSelectModule,
  progress,
  onUpdateProgress,
  onLoadPodcastEpisode
}: ModuleSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'theory' | 'practice' | 'resources' | 'exam'>('theory');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Practice state
  const [practiceAnswers, setPracticeAnswers] = useState<{ [qId: string]: string }>({});
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);
  const [aiExplanations, setAiExplanations] = useState<{ [qId: string]: { loading: boolean; text?: string } }>({});

  // Exam state
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examAnswers, setExamAnswers] = useState<{ [qId: string]: string }>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(0);

  const EXAM_QUESTION_COUNT = 10;
  const examStorageKey = (modIndex: number) => `b2_module_exam_inprogress_M${modIndex}`;

  // Pool a control exam attempt samples from: every practice question across the module's days
  // plus its curated control-exam set. Sampling from the wider pool (not just the fixed 10-question
  // controlExam array) is what makes a fresh attempt actually differ from the last one.
  const buildModuleExamPool = (mod: ModuleData): Question[] => {
    const pool: Question[] = [];
    mod.days.forEach((day) => pool.push(...day.practiceQuestions));
    pool.push(...mod.controlExam);
    return pool;
  };

  const sampleQuestions = (pool: Question[], count: number): Question[] => {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Restore an in-progress attempt (same question set + answers) whenever the selected module
  // changes, so it survives switching tabs/modules and reloading. If there's nothing to resume,
  // sample a brand-new random set — this only happens on a genuinely new attempt (submit or
  // "Reintentar" both clear the saved state), so retaking the exam never repeats the same set.
  useEffect(() => {
    const mod = modules[selectedModuleIndex];
    if (!mod) return;
    const pool = buildModuleExamPool(mod);

    const saved = localStorage.getItem(examStorageKey(selectedModuleIndex));
    if (saved) {
      try {
        const data: { questionIds: string[]; answers: { [qId: string]: string } } = JSON.parse(saved);
        const restored = data.questionIds
          .map((id) => pool.find((q) => q.id === id))
          .filter((q): q is Question => !!q);
        if (restored.length === data.questionIds.length && restored.length > 0) {
          setExamQuestions(restored);
          setExamAnswers(data.answers || {});
          setExamSubmitted(false);
          setExamScore(0);
          return;
        }
      } catch {
        // fall through to discard the unreadable saved state and start a fresh attempt
      }
      localStorage.removeItem(examStorageKey(selectedModuleIndex));
    }

    setExamQuestions(sampleQuestions(pool, Math.min(EXAM_QUESTION_COUNT, pool.length)));
    setExamAnswers({});
    setExamSubmitted(false);
    setExamScore(0);
  }, [selectedModuleIndex, modules]);

  // Persist in-progress answers (and the sampled question set) on every change; clear once
  // there's nothing left to save.
  useEffect(() => {
    if (examSubmitted) return;
    if (Object.keys(examAnswers).length === 0) {
      localStorage.removeItem(examStorageKey(selectedModuleIndex));
    } else {
      const data = { questionIds: examQuestions.map((q) => q.id), answers: examAnswers };
      localStorage.setItem(examStorageKey(selectedModuleIndex), JSON.stringify(data));
    }
  }, [examAnswers, examSubmitted, selectedModuleIndex, examQuestions]);

  // Study Notes state
  const [noteText, setNoteText] = useState('');
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    let active = true;
    const fetchNote = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setNoteText('');
        return;
      }
      setIsLoadingNote(true);
      setSaveStatus('idle');
      const docId = `${userId}_M${selectedModuleIndex}`;
      const noteRef = doc(db, 'notes', docId);
      try {
        const snap = await getDoc(noteRef);
        if (active) {
          if (snap.exists()) {
            setNoteText(snap.data().content || '');
          } else {
            setNoteText('');
          }
        }
      } catch (err) {
        console.warn("Failed to fetch study notes from Firestore:", err);
        // Fall back to local storage
        const localNote = localStorage.getItem(`note_M${selectedModuleIndex}`);
        if (localNote && active) {
          setNoteText(localNote);
        }
      } finally {
        if (active) setIsLoadingNote(false);
      }
    };

    fetchNote();

    return () => {
      active = false;
    };
  }, [selectedModuleIndex, auth.currentUser?.uid]);

  const handleSaveNote = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setIsSavingNote(true);
    setSaveStatus('saving');
    const docId = `${userId}_M${selectedModuleIndex}`;
    const noteRef = doc(db, 'notes', docId);

    const payload = {
      userId,
      moduleId: `M${selectedModuleIndex}`,
      content: noteText,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(noteRef, payload, { merge: true });
      setSaveStatus('saved');
      // Cache locally
      localStorage.setItem(`note_M${selectedModuleIndex}`, noteText);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error("Failed to save study note to Firestore:", err);
      setSaveStatus('error');
      // Cache locally as fallback
      localStorage.setItem(`note_M${selectedModuleIndex}`, noteText);
    } finally {
      setIsSavingNote(false);
    }
  };

  const currentModule = modules[selectedModuleIndex];
  if (!currentModule) return null;

  const currentDay = currentModule.days[selectedDayIndex];

  // Theory Completion
  const theoryKey = `M${selectedModuleIndex}-D${selectedDayIndex}`;
  const isTheoryCompleted = progress.completedTheory.includes(theoryKey);

  const handleMarkTheoryRead = () => {
    let completed = [...progress.completedTheory];
    if (!completed.includes(theoryKey)) {
      completed.push(theoryKey);
    } else {
      completed = completed.filter(t => t !== theoryKey);
    }
    onUpdateProgress({ completedTheory: completed });
  };

  // Practice scoring & submission
  const handleSelectPracticeAnswer = (qId: string, option: string) => {
    if (practiceSubmitted) return;
    setPracticeAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handlePracticeSubmit = () => {
    if (!currentDay) return;
    let correctCount = 0;
    currentDay.practiceQuestions.forEach(q => {
      if (practiceAnswers[q.id] === q.correctOption) correctCount++;
    });

    const score = Math.round((correctCount / currentDay.practiceQuestions.length) * 100);
    setPracticeSubmitted(true);

    // Save attempt
    const newAttempt = {
      moduleIndex: selectedModuleIndex,
      dayIndex: selectedDayIndex,
      score,
      totalQuestions: currentDay.practiceQuestions.length,
      correctAnswers: correctCount,
      date: new Date().toISOString()
    };

    const key = `M${selectedModuleIndex}-D${selectedDayIndex}`;
    const previousAttempts = progress.practiceAttempts[key] || [];
    onUpdateProgress({
      practiceAttempts: {
        ...progress.practiceAttempts,
        [key]: [...previousAttempts, newAttempt]
      }
    });
  };

  const handleResetPractice = () => {
    setPracticeAnswers({});
    setPracticeSubmitted(false);
    setAiExplanations({});
  };

  // Query Gemini Tutor for detail explanation of a question
  const handleQueryTutorExplanation = async (q: Question) => {
    setAiExplanations(prev => ({ ...prev, [q.id]: { loading: true } }));
    try {
      const res = await authedFetchWithRetry('/api/tutor/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          options: q.options,
          selectedOption: practiceAnswers[q.id],
          correctOption: q.correctOption,
          contextInfo: `Módulo ${selectedModuleIndex + 1}, Día ${selectedDayIndex + 1}: ${currentDay?.title}`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ocurrió un error inesperado');

      setAiExplanations(prev => ({
        ...prev,
        [q.id]: { loading: false, text: data.explanation }
      }));
    } catch (err: any) {
      setAiExplanations(prev => ({
        ...prev,
        [q.id]: { loading: false, text: `Error de Tutor IA: ${err.message}` }
      }));
    }
  };

  // Control Exam Submit
  const handleSelectExamAnswer = (qId: string, option: string) => {
    if (examSubmitted) return;
    setExamAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleExamSubmit = () => {
    let correctCount = 0;
    examQuestions.forEach(q => {
      if (examAnswers[q.id] === q.correctOption) correctCount++;
    });

    const score = Math.round((correctCount / examQuestions.length) * 100);
    setExamScore(score);
    setExamSubmitted(true);
    localStorage.removeItem(examStorageKey(selectedModuleIndex));

    // Save exam attempt in progress
    const newAttempt = {
      id: 'exam_' + Math.random().toString(36).substr(2, 9),
      type: 'module' as const,
      moduleIndex: selectedModuleIndex,
      score,
      totalQuestions: examQuestions.length,
      correctAnswers: correctCount,
      date: new Date().toISOString(),
      answers: examAnswers
    };

    onUpdateProgress({
      examAttempts: [...(progress.examAttempts || []), newAttempt]
    });
  };

  const handleResetExam = () => {
    const mod = modules[selectedModuleIndex];
    if (mod) {
      const pool = buildModuleExamPool(mod);
      setExamQuestions(sampleQuestions(pool, Math.min(EXAM_QUESTION_COUNT, pool.length)));
    }
    setExamAnswers({});
    setExamSubmitted(false);
    setExamScore(0);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-4 font-sans">
      {/* Horizontal Modules Select tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
        {modules.map((mod) => (
          <button
            key={mod.index}
            onClick={() => {
              onSelectModule(mod.index);
              setSelectedDayIndex(0);
              handleResetPractice();
              // Exam state for the target module is restored (or blanked) by the
              // selectedModuleIndex effect above — no manual reset needed here.
            }}
            className={`py-3 px-5 text-sm font-semibold tracking-tight border-b-2 transition-all mr-2 cursor-pointer focus:outline-none ${
              selectedModuleIndex === mod.index
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Módulo {mod.index + 1}
          </button>
        ))}
      </div>

      {/* Module Overview Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Temario Oficial B2 First
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display leading-tight">
            {currentModule.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {currentModule.description}
          </p>
        </div>
      </div>

      {/* Internal Module Sub-tabs (Theory, Practice, Resources, Exam) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar/Rail */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <button
              onClick={() => setActiveSubTab('theory')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all focus:outline-none cursor-pointer ${
                activeSubTab === 'theory' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>📚 Teoría Semanal</span>
            </button>
            <button
              onClick={() => setActiveSubTab('practice')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all focus:outline-none cursor-pointer ${
                activeSubTab === 'practice' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>📝 Prácticas Diarias</span>
            </button>
            <button
              onClick={() => setActiveSubTab('resources')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all focus:outline-none cursor-pointer ${
                activeSubTab === 'resources' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>🎧 Recursos y Podcast</span>
            </button>
            <button
              onClick={() => setActiveSubTab('exam')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all focus:outline-none cursor-pointer ${
                activeSubTab === 'exam' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span>🏆 Control de Módulo</span>
            </button>
          </div>

          {/* Days Sub-selector if on Theory or Practice */}
          {(activeSubTab === 'theory' || activeSubTab === 'practice') && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plan de Estudio Diario</h3>
              <div className="space-y-2">
                {currentModule.days.map((day, idx) => {
                  const dayKey = `M${selectedModuleIndex}-D${idx}`;
                  const isRead = progress.completedTheory.includes(dayKey);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedDayIndex(idx);
                        handleResetPractice();
                      }}
                      className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between border cursor-pointer focus:outline-none ${
                        selectedDayIndex === idx
                          ? 'border-indigo-200 bg-indigo-50/50 text-indigo-800 font-bold'
                          : 'border-slate-200/60 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate pr-2">{day.title}</span>
                      {isRead && <span className="text-indigo-600 font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Study Notes Scratchpad */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Edit3 className="w-3 h-3 text-indigo-500" />
                <span>Bloc de Notas (Módulo {selectedModuleIndex + 1})</span>
              </h3>
              {saveStatus === 'saving' && (
                <span className="text-[9px] font-bold text-indigo-600 flex items-center space-x-1 animate-pulse">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  <span>Guardando...</span>
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-[9px] font-bold text-emerald-600 flex items-center space-x-1">
                  <Check className="w-2.5 h-2.5" />
                  <span>Guardado</span>
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-[9px] font-bold text-rose-500">
                  ⚠️ Error
                </span>
              )}
              {saveStatus === 'idle' && noteText && (
                <span className="text-[9px] text-slate-400">
                  Sin guardar
                </span>
              )}
            </div>

            {isLoadingNote ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-slate-300" />
                <p>Cargando notas...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => {
                    setNoteText(e.target.value);
                    if (saveStatus === 'saved') setSaveStatus('idle');
                  }}
                  placeholder="Escribe tus apuntes personales para este módulo aquí (phrasal verbs, trucos gramaticales, dudas...)"
                  className="w-full h-32 p-3 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white resize-none"
                />
                <button
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer focus:outline-none ${
                    isSavingNote
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isSavingNote ? 'Guardando...' : 'Guardar Notas'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View Layout Canvas */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeSubTab === 'theory' && currentDay && (
              <motion.div
                key={`theory-${selectedDayIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold font-display text-slate-900">{currentDay.title}</h3>
                    <button
                      onClick={handleMarkTheoryRead}
                      className={`text-xs font-semibold py-1.5 px-3 rounded-xl transition-all cursor-pointer focus:outline-none ${
                        isTheoryCompleted
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isTheoryCompleted ? '✓ Leída y completada' : 'Marcar como leída'}
                    </button>
                  </div>

                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <span className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Objetivo Diario</span>
                    <p className="text-sm font-medium text-indigo-950 mt-1">{currentDay.focus}</p>
                  </div>

                  {/* Cheat sheet list details */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">📋 Reglas y Claves de Examen (Cheat Sheet)</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {currentDay.cheatSheet.map((rule, rIdx) => (
                        <div key={rIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start space-x-3 text-slate-700 text-sm leading-relaxed">
                          <div className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono mt-0.5">Rule {rIdx + 1}</div>
                          <p>{rule}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Arrow to Next day practice */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setActiveSubTab('practice')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all flex items-center space-x-1 cursor-pointer focus:outline-none shadow-md shadow-indigo-100"
                  >
                    <span>Ir a Práctica del Día</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'practice' && currentDay && (
              <motion.div
                key={`practice-${selectedDayIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold font-display text-slate-900">Practice &amp; Daily Check: {currentDay.title}</h3>
                    <button
                      onClick={handleResetPractice}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 focus:outline-none cursor-pointer"
                    >
                      Reiniciar Ejercicios
                    </button>
                  </div>

                  <div className="space-y-8 divide-y divide-slate-100">
                    {currentDay.practiceQuestions.map((q, qIdx) => {
                      const isSelected = (opt: 'a'|'b'|'c'|'d') => practiceAnswers[q.id] === opt;
                      const hasSelected = !!practiceAnswers[q.id];
                      const explainState = aiExplanations[q.id];

                      return (
                        <div key={q.id} className={`pt-6 first:pt-0 space-y-4`}>
                          <div className="flex items-start space-x-3">
                            <span className="bg-slate-100 text-slate-700 font-mono text-xs font-bold px-2 py-1 rounded-lg">Q{qIdx + 1}</span>
                            <p className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">{q.question}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                            {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                              const optLabel = q.options[opt];
                              const isCorrectOption = q.correctOption === opt;
                              const isSelectedOption = practiceAnswers[q.id] === opt;

                              let optStyle = 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700';
                              if (isSelected(opt)) {
                                optStyle = 'border-indigo-600 bg-indigo-50 text-indigo-800 font-bold';
                              }
                              if (practiceSubmitted) {
                                if (isCorrectOption) {
                                  optStyle = 'border-green-500 bg-green-50 text-green-800 font-bold';
                                } else if (isSelectedOption) {
                                  optStyle = 'border-red-400 bg-red-50 text-red-800 font-semibold';
                                } else {
                                  optStyle = 'border-slate-100 opacity-60 text-slate-400 bg-slate-50';
                                }
                              }

                              return (
                                <button
                                  key={opt}
                                  disabled={practiceSubmitted}
                                  onClick={() => handleSelectPracticeAnswer(q.id, opt)}
                                  className={`w-full text-left p-3.5 border rounded-xl text-xs sm:text-sm transition-all focus:outline-none cursor-pointer flex items-center justify-between ${optStyle}`}
                                >
                                  <span><strong>{opt.toUpperCase()}.</strong> {optLabel}</span>
                                  {practiceSubmitted && isCorrectOption && <span className="text-green-600 font-bold font-mono">✓</span>}
                                  {practiceSubmitted && isSelectedOption && !isCorrectOption && <span className="text-red-600 font-bold font-mono">✗</span>}
                                </button>
                              );
                            })}
                          </div>

                          {/* AI Tutor Explanation trigger */}
                          {practiceSubmitted && (
                            <div className="pl-8 space-y-3">
                              {/* Native static explanation */}
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700">
                                <span className="font-bold text-slate-900 block mb-1">💡 Explicación del Profesor:</span>
                                <p>{q.explanation}</p>
                              </div>

                              {!explainState ? (
                                <button
                                  onClick={() => handleQueryTutorExplanation(q)}
                                  className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/50 hover:bg-indigo-100 py-1.5 px-3.5 rounded-xl transition-all flex items-center space-x-1 focus:outline-none cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                  <span>Explicación Detallada con IA</span>
                                </button>
                              ) : explainState.loading ? (
                                <div className="text-[10px] text-slate-500 flex items-center space-x-2 animate-pulse bg-slate-50 py-2 px-4 rounded-xl border border-dashed border-slate-200 w-fit">
                                  <RefreshCw className="animate-spin w-3.5 h-3.5 text-indigo-600" />
                                  <span>Tu tutor de IA está redactando la explicación del Cambridge B2...</span>
                                </div>
                              ) : (
                                <div className="bg-indigo-50 border border-indigo-100 p-4 sm:p-5 rounded-2xl text-xs sm:text-sm text-indigo-950 shadow-inner">
                                  <div className="flex items-center space-x-1.5 text-indigo-800 font-bold mb-3">
                                    <Sparkles className="w-4 h-4" />
                                    <span>Tutor de Inteligencia Artificial:</span>
                                  </div>
                                  <div className="whitespace-pre-line space-y-2 leading-relaxed">
                                    {explainState.text?.split('\n').map((line, idx) => {
                                      if (line.startsWith('**') || line.startsWith('###')) {
                                        return <p key={idx} className="font-bold text-indigo-900 mt-2 first:mt-0 font-display">{line.replace(/\*\*|###/g, '')}</p>;
                                      }
                                      return <p key={idx}>{line}</p>;
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!practiceSubmitted ? (
                    <button
                      onClick={handlePracticeSubmit}
                      disabled={Object.keys(practiceAnswers).length < currentDay.practiceQuestions.length}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl text-sm font-semibold transition-all focus:outline-none cursor-pointer"
                    >
                      Enviar Respuestas de Práctica
                    </button>
                  ) : (
                    <div className="text-center py-2">
                      <button
                        onClick={handleResetPractice}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 underline focus:outline-none cursor-pointer"
                      >
                        Intentar de Nuevo la Práctica
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeSubTab === 'resources' && (
              <motion.div
                key="resources"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Download cards */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Archivos Complementarios</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentModule.resources.map((res) => (
                      <div key={res.id} className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm text-slate-900 font-display">{res.name}</h4>
                          <p className="text-xs text-slate-500">{res.description}</p>
                          <span className="text-[10px] text-slate-400 font-mono font-semibold block">{res.fileSize}</span>
                        </div>
                        <button
                          onClick={() => {
                            // Simple text backup download simulation
                            const blob = new Blob([res.content], { type: 'text/plain;charset=utf-8' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = res.name.replace('.pdf', '.txt').replace('.xlsx', '.csv');
                            link.click();
                          }}
                          className="bg-white p-3 border border-slate-200 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 rounded-xl transition-all cursor-pointer focus:outline-none flex-shrink-0"
                          title="Descargar Recurso de Estudio"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Podcasts section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Escuchar Podcasts</h3>
                  <p className="text-xs text-slate-600">Haz clic para escuchar el podcast explicativo del tema en el reproductor integrado.</p>
                  
                  <div className="space-y-3">
                    {currentModule.podcastEpisodes.map((ep) => (
                      <div key={ep.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between gap-4 bg-slate-50/20">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm text-slate-900 font-display">{ep.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-1">{ep.description}</p>
                        </div>
                        <button
                          onClick={() => onLoadPodcastEpisode(ep)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all focus:outline-none cursor-pointer flex items-center space-x-1"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span className="text-xs font-semibold">Cargar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'exam' && (
              <motion.div
                key="exam"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold font-display text-slate-900">Examen de Control del Conocimiento</h3>
                      <p className="text-xs text-slate-500 mt-1">Somete a prueba tus conocimientos de todo el módulo. Requiere un <strong>80% de aciertos</strong> para aprobar.</p>
                    </div>
                    {examSubmitted && (
                      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${
                        examScore >= 80 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {examScore >= 80 ? 'Aprobado' : 'Reprobado'} ({examScore}%)
                      </span>
                    )}
                  </div>

                  <div className="space-y-8 divide-y divide-slate-100">
                    {examQuestions.map((q, qIdx) => {
                      const hasSelected = !!examAnswers[q.id];
                      return (
                        <div key={q.id} className="pt-6 first:pt-0 space-y-4">
                          <div className="flex items-start space-x-3">
                            <span className="bg-slate-100 text-slate-700 font-mono text-xs font-bold px-2 py-1 rounded-lg">Q{qIdx + 1}</span>
                            <p className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">{q.question}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                            {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                              const optLabel = q.options[opt];
                              const isCorrectOption = q.correctOption === opt;
                              const isSelectedOption = examAnswers[q.id] === opt;

                              let optStyle = 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700';
                              if (isSelectedOption) {
                                optStyle = 'border-indigo-600 bg-indigo-50 text-indigo-800 font-bold';
                              }
                              if (examSubmitted) {
                                if (isCorrectOption) {
                                  optStyle = 'border-green-500 bg-green-50 text-green-800 font-bold';
                                } else if (isSelectedOption) {
                                  optStyle = 'border-red-400 bg-red-50 text-red-800 font-semibold';
                                } else {
                                  optStyle = 'border-slate-100 opacity-60 text-slate-400 bg-slate-50';
                                }
                              }

                              return (
                                <button
                                  key={opt}
                                  disabled={examSubmitted}
                                  onClick={() => handleSelectExamAnswer(q.id, opt)}
                                  className={`w-full text-left p-3.5 border rounded-xl text-xs sm:text-sm transition-all focus:outline-none cursor-pointer flex items-center justify-between ${optStyle}`}
                                >
                                  <span><strong>{opt.toUpperCase()}.</strong> {optLabel}</span>
                                  {examSubmitted && isCorrectOption && <span className="text-green-600 font-bold font-mono">✓</span>}
                                  {examSubmitted && isSelectedOption && !isCorrectOption && <span className="text-red-600 font-bold font-mono">✗</span>}
                                </button>
                              );
                            })}
                          </div>

                          {examSubmitted && (
                            <div className="pl-8 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-700">
                              <span className="font-bold text-slate-900 block mb-1">💡 Explicación del Profesor:</span>
                              <p>{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!examSubmitted ? (
                    <button
                      onClick={handleExamSubmit}
                      disabled={Object.keys(examAnswers).length < examQuestions.length}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl text-sm font-semibold transition-all focus:outline-none cursor-pointer"
                    >
                      Enviar Examen de Control
                    </button>
                  ) : (
                    <div className="text-center py-2 space-y-2">
                      <p className="text-sm font-semibold text-slate-700">
                        {examScore >= 80 ? '¡Enhorabuena! Has completado con éxito este módulo 🎉' : 'No has alcanzado el 80% mínimo de aciertos para aprobar.'}
                      </p>
                      <button
                        onClick={handleResetExam}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 underline focus:outline-none cursor-pointer"
                      >
                        Reintentar Examen de Control
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
