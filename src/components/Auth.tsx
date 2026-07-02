import React, { useState } from 'react';
import { BookOpen, KeyRound, Mail, Sparkles, User, Award, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProps {
  onAuthSuccess: (user: { id: string; name: string; email: string }, progress: any) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error inesperado');
      }

      // Success
      onAuthSuccess(data.user, data.progress);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center space-x-2 mx-auto"
        >
          <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-200">
            <BookOpen className="w-8 h-8" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            B2 English <span className="text-indigo-600">Mastery</span>
          </span>
        </motion.div>
        <h2 className="mt-6 text-3xl font-extrabold text-slate-900 font-display">
          {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta de estudio'}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes una cuenta? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors focus:outline-none"
          >
            {isLogin ? 'Regístrate gratis' : 'Inicia sesión aquí'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white py-8 px-4 shadow-xl shadow-slate-100 rounded-3xl sm:px-10 border border-slate-200"
        >
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-800 font-bold">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm focus:outline-none focus:ring-2 bg-slate-50 focus:bg-white transition-all placeholder-slate-400"
                    placeholder="Martín Lucas"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 h-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm focus:outline-none focus:ring-2 bg-slate-50 focus:bg-white transition-all placeholder-slate-400"
                  placeholder="estudiante@b2mastery.es"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Contraseña</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 h-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm focus:outline-none focus:ring-2 bg-slate-50 focus:bg-white transition-all placeholder-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="animate-spin text-white">🌀</span>
                    <span>Procesando...</span>
                  </span>
                ) : (
                  <span>{isLogin ? 'Iniciar Sesión' : 'Comenzar Preparación'}</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 flex items-center justify-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Guarda tus avances de forma segura y analiza tu progreso en tiempo real</span>
          </div>
        </motion.div>
      </div>

      {/* Feature cards for B2 exam */}
      <div className="mt-12 max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-3">
          <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 font-display">4 Módulos Oficiales</h4>
            <p className="text-xs text-slate-600 mt-1">Teoría interactiva diaria, trucos para evitar trampas comunes de examen y explicaciones gramaticales.</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-3">
          <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 font-display">Controles y Simulador</h4>
            <p className="text-xs text-slate-600 mt-1">Exámenes de 20 preguntas con límite de tiempo. Analiza tu precisión de examen con &gt;80% de aciertos.</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-3">
          <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 font-display">Sincronización Sheets</h4>
            <p className="text-xs text-slate-600 mt-1">Conecta tu propia hoja de Google Sheets para expandir el banco de preguntas y lecciones de forma instantánea.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
