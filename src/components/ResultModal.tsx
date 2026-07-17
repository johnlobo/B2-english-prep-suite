import React from 'react';
import { Award, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ResultKind = 'practice' | 'exam' | 'simulation';

interface ResultModalProps {
  open: boolean;
  kind: ResultKind;
  score: number;
  correct: number;
  total: number;
  passThreshold?: number; // e.g. 80 for module/simulation exams; omitted for practice
  onClose: () => void;
}

const KIND_LABEL: Record<ResultKind, string> = {
  practice: 'Resultado de la Práctica',
  exam: 'Resultado del Control de Módulo',
  simulation: 'Resultado del Simulacro',
};

export default function ResultModal({ open, kind, score, correct, total, passThreshold, onClose }: ResultModalProps) {
  const failed = total - correct;
  const passed = passThreshold === undefined || score >= passThreshold;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 sm:p-8 text-center space-y-5 relative"
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer focus:outline-none"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className={`p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center ${
              passThreshold !== undefined
                ? (passed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600')
                : 'bg-indigo-50 text-indigo-600'
            }`}>
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold font-display text-slate-900">{KIND_LABEL[kind]}</h2>
              {passThreshold !== undefined && (
                <p className={`text-xs font-bold uppercase tracking-wider ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {passed ? '¡Aprobado!' : 'No alcanzado'}
                </p>
              )}
            </div>

            <div className="text-4xl font-extrabold font-display text-slate-900">{score}%</div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 rounded-2xl py-3">
                <span className="block text-lg font-bold font-display text-slate-900">{total}</span>
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Totales</span>
              </div>
              <div className="bg-green-50 rounded-2xl py-3">
                <span className="block text-lg font-bold font-display text-green-700">{correct}</span>
                <span className="block text-[10px] font-semibold text-green-600 uppercase tracking-wider mt-0.5">Acertadas</span>
              </div>
              <div className="bg-red-50 rounded-2xl py-3">
                <span className="block text-lg font-bold font-display text-red-700">{failed}</span>
                <span className="block text-[10px] font-semibold text-red-600 uppercase tracking-wider mt-0.5">Falladas</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer focus:outline-none text-sm"
            >
              Ver Detalle
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
