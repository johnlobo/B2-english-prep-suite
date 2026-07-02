import React, { useState, useEffect, useRef } from 'react';
import { Award, CheckCircle, Clock, AlertCircle, RefreshCw, Sparkles, ChevronLeft, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, ExamAttempt } from '../types';

interface ExamSimulationProps {
  questions: Question[];
  onComplete: (attempt: ExamAttempt) => void;
  onCancel: () => void;
}

export default function ExamSimulation({ questions, onComplete, onCancel }: ExamSimulationProps) {
  const [simulationQuestions, setSimulationQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Pick 20 random questions from the pool
    if (questions.length > 0) {
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      setSimulationQuestions(shuffled.slice(0, 20));
    }
  }, [questions]);

  useEffect(() => {
    if (isStarted && !isFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleFinishSimulation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isFinished]);

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleSelectAnswer = (qId: string, opt: string) => {
    if (isFinished) return;
    setAnswers(prev => ({ ...prev, [qId]: opt }));
  };

  const handleToggleReview = (qId: string) => {
    setMarkedForReview(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  const handleFinishSimulation = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    simulationQuestions.forEach((q) => {
      if (answers[q.id] === q.correctOption) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / 20) * 100);
    setCorrectAnswersCount(correctCount);
    setScore(calculatedScore);
    setIsFinished(true);

    // Save exam attempt in progress
    const newAttempt: ExamAttempt = {
      id: 'sim_' + Math.random().toString(36).substr(2, 9),
      type: 'simulation',
      score: calculatedScore,
      totalQuestions: 20,
      correctAnswers: correctCount,
      date: new Date().toISOString(),
      answers
    };

    onComplete(newAttempt);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const currentQuestion = simulationQuestions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans">
      <AnimatePresence mode="wait">
        {!isStarted ? (
          // Introduction view
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6 text-center"
          >
            <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900">Simulación de Examen B2 First</h2>
              <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                Esta simulación consta de <strong>20 preguntas de opción múltiple</strong> extraídas aleatoriamente de todos los módulos teóricos. Tendrás un límite de <strong>30 minutos</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl max-w-md mx-auto text-xs text-left text-slate-600 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-slate-900 mb-1">
                <AlertCircle className="w-4 h-4 text-indigo-600" />
                <span>Instrucciones Importantes:</span>
              </div>
              <p>• Puedes marcar preguntas para revisar más tarde.</p>
              <p>• Al pulsar en Enviar obtendrás la calificación y explicaciones.</p>
              <p>• El examen requiere un <strong>80% (16 de 20)</strong> para una calificación sobresaliente.</p>
            </div>

            <div className="pt-4 flex justify-center space-x-3">
              <button
                onClick={onCancel}
                className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer text-sm"
              >
                Volver al Panel
              </button>
              <button
                onClick={handleStart}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-indigo-100 focus:outline-none cursor-pointer text-sm"
              >
                Comenzar Simulación
              </button>
            </div>
          </motion.div>
        ) : !isFinished ? (
          // Active Exam view
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Simulation Header with Timer */}
            <div className="bg-white p-4 sm:px-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3 text-slate-700 font-medium text-xs sm:text-sm">
                <span className="font-bold text-slate-900 font-display">Simulacro B2 First</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                  Pregunta {currentIdx + 1} de 20
                </span>
              </div>

              <div className="flex items-center space-x-2 text-indigo-600 font-mono font-bold text-base sm:text-lg bg-indigo-50 px-3.5 py-1.5 rounded-xl border border-indigo-100">
                <Clock className="w-5 h-5 animate-pulse" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Questions Grid/Navigator */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
              {simulationQuestions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isMarked = markedForReview.includes(q.id);
                const isCurrent = currentIdx === idx;

                let btnStyle = 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100';
                if (isAnswered) btnStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                if (isMarked) btnStyle = 'bg-amber-50 text-amber-700 border-amber-300';
                if (isCurrent) btnStyle = 'ring-2 ring-indigo-500 font-bold bg-white border-transparent';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-9 h-9 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center cursor-pointer focus:outline-none ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Question Card */}
            {currentQuestion && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-50 text-indigo-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    Módulo {currentQuestion.moduleIndex + 1}
                  </span>
                  <button
                    onClick={() => handleToggleReview(currentQuestion.id)}
                    className={`text-xs font-semibold flex items-center space-x-1 py-1 px-2.5 rounded-lg border transition-all cursor-pointer focus:outline-none ${
                      markedForReview.includes(currentQuestion.id)
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{markedForReview.includes(currentQuestion.id) ? 'Marcada para revisar' : 'Marcar para revisar'}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 text-base sm:text-lg leading-snug">
                    {currentQuestion.question}
                  </h3>

                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                      const optLabel = currentQuestion.options[opt];
                      const isSelected = answers[currentQuestion.id] === opt;

                      return (
                        <button
                          key={opt}
                          onClick={() => handleSelectAnswer(currentQuestion.id, opt)}
                          className={`w-full text-left p-4 border rounded-xl text-xs sm:text-sm transition-all focus:outline-none cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-800 font-bold'
                              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span><strong>{opt.toUpperCase()}.</strong> {optLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question Navigation Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(prev => prev - 1)}
                    className="flex items-center space-x-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl disabled:opacity-40 transition-colors cursor-pointer text-xs sm:text-sm focus:outline-none"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  {currentIdx < 19 ? (
                    <button
                      onClick={() => setCurrentIdx(prev => prev + 1)}
                      className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors cursor-pointer text-xs sm:text-sm focus:outline-none"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishSimulation}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-indigo-100 focus:outline-none cursor-pointer text-xs sm:text-sm"
                    >
                      Finalizar y Enviar Examen
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          // Simulation Results view
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md text-center space-y-6">
              <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900">Resultado del Simulacro</h2>
                <p className="text-xs sm:text-sm text-slate-500">Examen completado exitosamente con límite de tiempo.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Calificación</span>
                  <span className={`text-2xl font-bold font-display mt-0.5 block ${score >= 80 ? 'text-indigo-600' : 'text-slate-900'}`}>
                    {score}%
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Aciertos</span>
                  <span className="text-2xl font-bold font-display text-slate-900 mt-0.5 block">
                    {correctAnswersCount} / 20
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                {score >= 80
                  ? '¡Fantástico! Tu nivel gramatical actual es muy sólido y estás preparado para el Cambridge B2 First. Sigue así.'
                  : 'Sigue preparándote. Repasa las explicaciones de las respuestas incorrectas y los consejos de los módulos teóricos para afianzar tus conocimientos.'}
              </p>

              <div className="pt-2 flex justify-center space-x-3">
                <button
                  onClick={onCancel}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer text-sm"
                >
                  Volver al Panel
                </button>
              </div>
            </div>

            {/* Questions Review Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
              <h3 className="text-base font-bold font-display text-slate-900 border-b border-slate-200 pb-4">Revisión de Preguntas</h3>

              <div className="space-y-8 divide-y divide-slate-100">
                {simulationQuestions.map((q, qIdx) => {
                  const userAnswer = answers[q.id];
                  const isCorrect = userAnswer === q.correctOption;

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
                          const isSelectedOption = userAnswer === opt;

                          let optStyle = 'border-slate-100 text-slate-400 bg-slate-50 opacity-60';
                          if (isCorrectOption) {
                            optStyle = 'border-green-500 bg-green-50 text-green-800 font-bold';
                          } else if (isSelectedOption) {
                            optStyle = 'border-red-400 bg-red-50 text-red-800 font-semibold';
                          }

                          return (
                            <div
                              key={opt}
                              className={`p-3.5 border rounded-xl text-xs sm:text-sm flex items-center justify-between ${optStyle}`}
                            >
                              <span><strong>{opt.toUpperCase()}.</strong> {optLabel}</span>
                              {isCorrectOption && <span className="text-green-600 font-bold font-mono">✓</span>}
                              {isSelectedOption && !isCorrectOption && <span className="text-red-600 font-bold font-mono">✗</span>}
                            </div>
                          );
                        })}
                      </div>

                      <div className="pl-8 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-700">
                        <span className="font-bold text-slate-900 block mb-1">💡 Explicación del Profesor:</span>
                        <p>{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
