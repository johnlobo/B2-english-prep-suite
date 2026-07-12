import React, { useState } from 'react';
import { Award, CheckCircle, TrendingUp, Sparkles, BookOpen, Clock, Calendar, AlertCircle, Flame, Trophy, Percent, FolderOpen, Layers } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { UserProgress, ModuleData } from '../types';

interface DashboardProps {
  user: { name: string; email: string };
  progress: UserProgress;
  modules: ModuleData[];
  onSelectTab: (tab: string, moduleIndex?: number) => void;
  onStartSimulation: () => void;
  streak: number;
}

export default function Dashboard({ user, progress, modules, onSelectTab, onStartSimulation, streak }: DashboardProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'general' | 'milestones' | 'modules'>('all');

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

  // Full test history (module control exams + simulations), most recent first
  const testHistory = [...examAttempts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Badges Earned - Configured and enriched with Milestones and Module Completion rewards
  const badges = [
    // Generales
    { 
      id: 'b1', 
      name: 'Primeros Pasos', 
      desc: 'Completaste tu primera teoría B2', 
      earned: progress.completedTheory.length > 0, 
      icon: '🌱', 
      category: 'general' as const,
      hint: 'Completa al menos una lección teórica'
    },
    { 
      id: 'b2', 
      name: 'Práctica Constante', 
      desc: 'Completaste 3 prácticas diarias', 
      earned: totalPracticeCount >= 3, 
      icon: '🔥', 
      category: 'general' as const,
      hint: `Progreso: ${totalPracticeCount}/3 prácticas`
    },
    { 
      id: 'b3', 
      name: 'Control de Módulo', 
      desc: 'Aprobaste un examen de control con ≥80%', 
      earned: examAttempts.some(e => e.type === 'module' && e.score >= 80), 
      icon: '🏆', 
      category: 'general' as const,
      hint: 'Logra un 80% en cualquier test de control'
    },
    { 
      id: 'b4', 
      name: 'Simulador B2', 
      desc: 'Lograste ≥80% en simulacro completo', 
      earned: simulations.some(e => e.score >= 80), 
      icon: '🎓', 
      category: 'general' as const,
      hint: 'Logra un 80% en el simulacro de examen'
    },
    
    // Metas de Porcentaje
    { 
      id: 'm25', 
      name: 'Iniciado B2', 
      desc: 'Alcanzaste el 25% del temario teórico', 
      earned: theoryPercentage >= 25, 
      icon: '⚡', 
      category: 'milestones' as const,
      hint: `Progreso: ${theoryPercentage}% / 25%`
    },
    { 
      id: 'm50', 
      name: 'Mitad del Camino', 
      desc: 'Alcanzaste el 50% del temario teórico', 
      earned: theoryPercentage >= 50, 
      icon: '🎯', 
      category: 'milestones' as const,
      hint: `Progreso: ${theoryPercentage}% / 50%`
    },
    { 
      id: 'm75', 
      name: 'Avanzado Cambridge', 
      desc: 'Alcanzaste el 75% del temario teórico', 
      earned: theoryPercentage >= 75, 
      icon: '🚀', 
      category: 'milestones' as const,
      hint: `Progreso: ${theoryPercentage}% / 75%`
    },
    { 
      id: 'm100', 
      name: 'Candidato Perfecto', 
      desc: 'Completaste el 100% del temario teórico', 
      earned: theoryPercentage >= 100, 
      icon: '👑', 
      category: 'milestones' as const,
      hint: `Progreso: ${theoryPercentage}% / 100%`
    },

    // Módulos Completados
    ...modules.map((mod) => {
      const modTheoryCount = mod.days.length;
      const completedInMod = progress.completedTheory.filter(t => t.startsWith(`M${mod.index}`)).length;
      const isCompleted = modTheoryCount > 0 && completedInMod === modTheoryCount;
      const moduleBadgeIcons = ['📝', '🔄', '🔮', '📚'];
      const moduleBadgeNames = [
        'Maestro de Narrativa',
        'Experto en Condicionales',
        'Estratega de Estructuras',
        'Señor de Phrasal Verbs'
      ];
      return {
        id: `mod-${mod.index}`,
        name: moduleBadgeNames[mod.index] || `Módulo ${mod.index + 1} Superado`,
        desc: `Completaste toda la teoría del Módulo ${mod.index + 1}`,
        earned: isCompleted,
        icon: moduleBadgeIcons[mod.index] || '🎖️',
        category: 'modules' as const,
        hint: `Progreso: ${completedInMod}/${modTheoryCount} lecciones`
      };
    })
  ];

  const earnedBadgesCount = badges.filter(b => b.earned).length;
  const totalBadgesCount = badges.length;
  const badgesEarnedPercentage = totalBadgesCount > 0 ? Math.round((earnedBadgesCount / totalBadgesCount) * 100) : 0;

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
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-1.5 bg-white/10 text-indigo-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full border border-white/5">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Camino al B2 First de Cambridge</span>
            </div>
            {streak > 0 ? (
              <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full border border-amber-500/30">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                <span>Racha: {streak} {streak === 1 ? 'Día' : 'Días'} 🔥</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-1.5 bg-white/5 text-slate-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full border border-white/5">
                <Flame className="w-3.5 h-3.5 text-slate-400" />
                <span>Sin racha activa. ¡Visita un módulo!</span>
              </div>
            )}
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
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Progreso en Simulacros (40 Preguntas)</h3>
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

          {/* Test History */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Historial de Tests</h3>
            {testHistory.length > 0 ? (
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {testHistory.map((attempt) => {
                  const moduleTitle = attempt.type === 'module'
                    ? modules.find((m) => m.index === attempt.moduleIndex)?.title
                    : null;
                  return (
                    <div key={attempt.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            attempt.type === 'simulation' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {attempt.type === 'simulation' ? 'Simulacro' : 'Control de Módulo'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(attempt.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        {moduleTitle && (
                          <p className="text-xs text-slate-600 mt-1 truncate">{moduleTitle}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-500">{attempt.correctAnswers}/{attempt.totalQuestions}</span>
                        <span className={`text-sm font-bold font-display ${attempt.score >= 80 ? 'text-green-600' : 'text-slate-900'}`}>
                          {attempt.score}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-sm space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <AlertCircle className="w-8 h-8 text-slate-300" />
                <span>Aún no has completado ningún test.</span>
              </div>
            )}
          </div>

          {/* Badges Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span>Tus Logros y Medallas</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Desbloquea medallas oficiales al progresar en la teoría y simulacros.
                </p>
              </div>
              <div className="bg-indigo-50 px-3.5 py-1.5 rounded-2xl flex items-center space-x-2 border border-indigo-100 self-start sm:self-auto">
                <Trophy className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-950">
                  {earnedBadgesCount} / {totalBadgesCount} ({badgesEarnedPercentage}%)
                </span>
              </div>
            </div>

            {/* Progress bar for achievements */}
            <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
              <div style={{ width: `${badgesEarnedPercentage}%` }} className="absolute top-0 left-0 bottom-0 bg-indigo-600 transition-all duration-500" />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Todos</span>
              </button>
              <button
                onClick={() => setActiveCategory('general')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border cursor-pointer ${
                  activeCategory === 'general'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Generales</span>
              </button>
              <button
                onClick={() => setActiveCategory('milestones')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border cursor-pointer ${
                  activeCategory === 'milestones'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Metas %</span>
              </button>
              <button
                onClick={() => setActiveCategory('modules')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border cursor-pointer ${
                  activeCategory === 'modules'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Módulos</span>
              </button>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {badges
                .filter(b => activeCategory === 'all' || b.category === activeCategory)
                .map((badge) => (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className={`p-4 rounded-2xl border text-center transition-all flex flex-col justify-between ${
                      badge.earned
                        ? 'bg-gradient-to-br from-indigo-50/70 to-white border-indigo-100 shadow-sm'
                        : 'bg-slate-50/50 border-slate-100/80 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="relative inline-block">
                        <span className={`text-4xl block mb-2 filter transition-all ${badge.earned ? 'drop-shadow-md' : 'grayscale brightness-75'}`}>
                          {badge.icon}
                        </span>
                        {!badge.earned && (
                          <span className="absolute -bottom-1 -right-1 bg-slate-200 text-slate-500 rounded-full p-0.5 text-[8px] border border-white">
                            🔒
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 font-display mt-1">{badge.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight min-h-[32px] flex items-center justify-center">
                        {badge.desc}
                      </p>
                    </div>

                    <div className="mt-3">
                      {badge.earned ? (
                        <span className="text-[9px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full inline-block">
                          ✨ Ganado
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-slate-500 bg-slate-100/90 px-2 py-0.5 rounded-full inline-block truncate max-w-full" title={badge.hint}>
                          {badge.hint}
                        </span>
                      )}
                    </div>
                  </motion.div>
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
