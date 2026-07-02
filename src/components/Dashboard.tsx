import React from 'react';
import { Award, CheckCircle, TrendingUp, Sparkles, BookOpen, Clock, Calendar, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { UserProgress, ModuleData } from '../types';

interface DashboardProps {
  user: { name: string; email: string };
  progress: UserProgress;
  modules: ModuleData[];
  onSelectTab: (tab: string, moduleIndex?: number) => void;
  onStartSimulation: () => void;
}

export default function Dashboard({ user, progress, modules, onSelectTab, onStartSimulation }: DashboardProps) {
  // Compute progress stats
  const completedTheoryCount = progress.completedTheory.length;
  const totalTheoryCount = modules.reduce((acc, m) => acc + m.days.length, 0);
  const theoryPercentage = totalTheoryCount > 0 ? Math.round((completedTheoryCount / totalTheoryCount) * 100) : 0;

  // Practice counts
  const totalPracticeCount = Object.keys(progress.practiceAttempts).length;
  
  // High scores and averages
  const examAttempts = progress.examAttempts || [];
  const simulations = examAttempts.filter(e => e.type === 'simulation');
  const avgSimulationScore = simulations.length > 0 
    ? Math.round(simulations.reduce((acc, s) => acc + s.score, 0) / simulations.length) 
    : 0;

  // Streak logic
  const streak = 3; // Mock active daily streak
  
  // Badges Earned
  const badges = [
    { id: 'b1', name: 'Primeros Pasos', desc: 'Completaste tu primera teoría B2', earned: progress.completedTheory.length > 0, icon: '🌱' },
    { id: 'b2', name: 'Práctica Constante', desc: 'Completaste 3 prácticas diarias', earned: totalPracticeCount >= 3, icon: '🔥' },
    { id: 'b3', name: 'Control de Módulo', desc: 'Aprobaste un examen de control', earned: examAttempts.some(e => e.type === 'module' && e.score >= 80), icon: '🏆' },
    { id: 'b4', name: 'Simulador B2', desc: 'Lograste >80% en simulacro completo', earned: simulations.some(e => e.score >= 80), icon: '🎓' },
  ];

  const earnedBadges = badges.filter(b => b.earned);

  // Prepare chart data
  const chartData = simulations.map((attempt, index) => ({
    name: `Test ${index + 1}`,
    score: attempt.score,
    correct: attempt.correctAnswers,
  }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-4">
      {/* Welcome Banner / Simulation Premium Card */}
      <div className="bg-indigo-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-200/10">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-1.5 bg-white/10 text-indigo-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full border border-white/5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Camino al B2 First de Cambridge</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display">
            ¡Hola de nuevo, {user.name}!
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed max-w-lg">
            Tienes un avance del <strong className="text-white">{theoryPercentage}%</strong> en el temario teórico oficial. Continúa completando tu Daily Check para asegurar el dominio gramatical.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onStartSimulation}
              className="bg-white hover:bg-indigo-50 text-indigo-900 font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg text-sm cursor-pointer"
            >
              Simular Examen Completo
            </button>
            <button
              onClick={() => onSelectTab('modules')}
              className="bg-indigo-800/60 hover:bg-indigo-800/80 text-white font-semibold py-2.5 px-5 rounded-xl transition-all text-sm cursor-pointer border border-indigo-700"
            >
              Explorar Módulos
            </button>
          </div>
        </div>
        {/* Abstract background decorations from Bento Grid design template */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-800 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-500 rounded-full opacity-20 blur-2xl pointer-events-none"></div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Teoría Completada</span>
            <span className="text-2xl font-bold font-display text-slate-900 mt-1 block">
              {completedTheoryCount} / {totalTheoryCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Prácticas Diarias</span>
            <span className="text-2xl font-bold font-display text-slate-900 mt-1 block">
              {totalPracticeCount} completadas
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Promedio Simulacros</span>
            <span className="text-2xl font-bold font-display text-slate-900 mt-1 block">
              {avgSimulationScore}% aciertos
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="bg-amber-50 text-amber-600 p-3.5 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Racha de Estudio</span>
            <span className="text-2xl font-bold font-display text-slate-900 mt-1 block">
              {streak} días activos
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Analytics and badges */}
        <div className="lg:col-span-2 space-y-8">
          {/* Simulation Scores Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Progreso en Simulacros (20 Preguntas)</h3>
              <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 py-1 px-3 rounded-full">Meta de aprobación: &gt;80%</span>
            </div>
            
            <div className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <AlertCircle className="w-8 h-8 text-slate-300" />
                  <span>Aún no has completado simulaciones de examen.</span>
                  <button onClick={onStartSimulation} className="text-indigo-600 hover:text-indigo-500 text-xs font-bold underline">Iniciar simulador ahora</button>
                </div>
              )}
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Tus Logros y Medallas</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    badge.earned
                      ? 'bg-indigo-50/50 border-indigo-100'
                      : 'bg-slate-50/50 border-slate-100 opacity-60'
                  }`}
                >
                  <span className="text-3xl block mb-2">{badge.icon}</span>
                  <h4 className="font-bold text-xs text-slate-900 font-display">{badge.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">{badge.desc}</p>
                  {badge.earned ? (
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full mt-2 inline-block">Ganado</span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full mt-2 inline-block">Bloqueado</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Study path and recommendations */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Módulos de Preparación</h3>
            
            <div className="space-y-4">
              {modules.map((module) => {
                // Compute module progress
                const modTheoryCount = module.days.length;
                const completedInMod = progress.completedTheory.filter(t => t.startsWith(`M${module.index}`)).length;
                const pct = Math.round((completedInMod / modTheoryCount) * 100);

                return (
                  <div key={module.index} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-slate-800 font-bold truncate max-w-[160px]">{module.title}</span>
                      <span className="text-slate-500 font-semibold">{pct}% completado</span>
                    </div>
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="absolute top-0 left-0 bottom-0 bg-indigo-500" />
                    </div>
                    <button
                      onClick={() => onSelectTab('modules', module.index)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-500 font-bold uppercase tracking-wider focus:outline-none flex items-center space-x-1 mt-1"
                    >
                      <span>Estudiar módulo</span>
                      <span>→</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 space-y-4">
            <div className="flex items-center space-x-1.5 text-indigo-800">
              <Award className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold font-display text-sm">Consejo de Profesor</h4>
            </div>
            <p className="text-xs text-indigo-950 leading-relaxed">
              "Para el examen Cambridge B2 First, la clave es buscar siempre el <strong>activador visual</strong> o marcador temporal en el enunciado. En un test de opción múltiple, el marcador temporal es la fórmula que fuerza matemáticamente el tiempo verbal correcto. ¡Practica detectando estas pistas!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
