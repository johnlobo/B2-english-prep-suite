import React, { useState, useEffect } from 'react';
import { KeyRound, Mail, Sparkles, User, Award, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  ADMIN_BOOTSTRAP_EMAIL,
  loadUserProfile,
  loadUserProgress,
  isAdminSetupComplete as checkAdminSetupComplete,
} from '../lib/userSession';

// Bootstrap password for the very first admin login (before any account exists in Firebase Auth).
// It lives in VITE_ADMIN_BOOTSTRAP_PASSWORD (.env.local, never committed) rather than in source,
// since this file ends up in a public repo.
const ADMIN_BOOTSTRAP_PASSWORD = import.meta.env.VITE_ADMIN_BOOTSTRAP_PASSWORD as string | undefined;

interface AuthProps {
  onAuthSuccess: (user: { id: string; name: string; email: string; role?: string }, progress: any) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // States for forced password change on first login
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Check if admin initial password has been changed
  const [isAdminSetupComplete, setIsAdminSetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const checkSetup = async () => {
      try {
        const setupSnap = await getDoc(doc(db, 'system', 'setup'));
        if (setupSnap.exists()) {
          const data = setupSnap.data();
          if (active) {
            setIsAdminSetupComplete(!!data.adminSetupComplete);
          }
        } else {
          if (active) {
            setIsAdminSetupComplete(false);
          }
        }
      } catch (err) {
        console.error('Error checking setup status:', err);
        if (active) {
          setIsAdminSetupComplete(false);
        }
      }
    };
    checkSetup();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && active) {
        try {
          const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.mustChangePassword === true && active) {
              setEmail(currentUser.email || '');
              setShowChangePasswordForm(true);
            }
          }
        } catch (e) {
          console.warn("Could not check current user profile on Auth auth change:", e);
        }
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes('@')) {
      setError('Por favor, introduce un correo electrónico válido.');
      setLoading(false);
      return;
    }

    try {
      // 1. Try Firebase Auth sign-in directly
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      } catch (authErr: any) {
        // If sign-in fails, check if we need to auto-create the initial admin
        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
          if (normalizedEmail === ADMIN_BOOTSTRAP_EMAIL && ADMIN_BOOTSTRAP_PASSWORD && password === ADMIN_BOOTSTRAP_PASSWORD && !isAdminSetupComplete) {
            // Register initial admin on-the-fly
            userCredential = await createUserWithEmailAndPassword(auth, ADMIN_BOOTSTRAP_EMAIL, ADMIN_BOOTSTRAP_PASSWORD);
            const uid = userCredential.user.uid;

            // Save admin user doc
            await setDoc(doc(db, 'users', uid), {
              id: uid,
              name: 'Administrador',
              email: ADMIN_BOOTSTRAP_EMAIL,
              role: 'admin',
              mustChangePassword: true,
              createdAt: new Date().toISOString()
            });

            // Save progress doc
            await setDoc(doc(db, 'progress', uid), {
              userId: uid,
              completedTheory: [],
              practiceAttempts: {},
              masteredPractice: [],
              examAttempts: []
            });
          } else {
            setError('Contraseña o usuario incorrectos.');
            setLoading(false);
            return;
          }
        } else {
          throw authErr;
        }
      }

      // 2. User authenticated successfully
      const uid = userCredential.user.uid;

      // Reuse the setup-status check from the mount-time effect when available, to avoid a
      // redundant Firestore read on every login.
      const setupComplete = isAdminSetupComplete !== null ? isAdminSetupComplete : await checkAdminSetupComplete();
      const userData = await loadUserProfile(uid, normalizedEmail, null, setupComplete);

      // Force password change if marked
      if (userData.mustChangePassword === true) {
        setShowChangePasswordForm(true);
        setLoading(false);
        return;
      }

      const cachedProgressStr = localStorage.getItem('b2_progress');
      let cachedProgress = null;
      if (cachedProgressStr) {
        try {
          cachedProgress = JSON.parse(cachedProgressStr);
        } catch (e) {}
      }
      const progressData = await loadUserProgress(uid, cachedProgress);

      onAuthSuccess(
        { id: userData.id, name: userData.name, email: userData.email, role: userData.role },
        progressData
      );

    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Error de conexión';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Contraseña o usuario incorrectos.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No se encontró ningún usuario con este correo electrónico.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'El inicio de sesión por Correo/Contraseña no está habilitado en Firebase. Por favor, actívalo en tu consola de Firebase.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No hay una sesión de usuario activa para cambiar la contraseña.');
      }

      // Update password in Firebase Auth
      await updatePassword(currentUser, newPassword);

      // Remove forced change password flag in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { mustChangePassword: false }, { merge: true });

      // Save system setup status in global state
      if (currentUser.email === ADMIN_BOOTSTRAP_EMAIL) {
        await setDoc(doc(db, 'system', 'setup'), { adminSetupComplete: true }, { merge: true });
      }

      // Fetch fresh userData
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {
        id: currentUser.uid,
        name: 'Administrador',
        email: ADMIN_BOOTSTRAP_EMAIL,
        role: 'admin'
      };

      // Fetch progress
      const progressRef = doc(db, 'progress', currentUser.uid);
      const progressSnap = await getDoc(progressRef);
      const progressData = progressSnap.exists() ? progressSnap.data() : {
        userId: currentUser.uid,
        completedTheory: [],
        practiceAttempts: {},
        masteredPractice: [],
        examAttempts: []
      };

      onAuthSuccess(
        { id: userData.id, name: userData.name, email: userData.email, role: userData.role },
        progressData
      );

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al actualizar la contraseña. Inténtalo de nuevo.');
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
          className="flex items-center justify-center mx-auto"
        >
          <img src="/logo.png" alt="B2 English Prep Suite" className="h-24 sm:h-28 w-auto" />
        </motion.div>
        <h2 className="mt-6 text-3xl font-extrabold text-slate-900 font-display">
          {showChangePasswordForm ? 'Actualizar Contraseña' : 'Inicia sesión en tu cuenta'}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {showChangePasswordForm
            ? 'Debes establecer una nueva contraseña permanente para tu cuenta.'
            : 'Accede al panel de preparación oficial para el examen B2'}
        </p>
      </div>

      {isAdminSetupComplete === false && !showChangePasswordForm && ADMIN_BOOTSTRAP_PASSWORD && (
        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 shadow-sm text-sm"
          >
            <div className="flex space-x-3">
              <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="font-semibold text-indigo-950">Acceso Administrador Inicial</h4>
                <p className="text-xs text-indigo-800 mt-1">
                  Usa estas credenciales para configurar la plataforma por primera vez:
                </p>
                <div className="mt-2.5 bg-white border border-indigo-100 rounded-xl p-2.5 font-mono text-xs text-slate-800 space-y-1 select-all">
                  <div><strong className="text-indigo-950 font-sans font-semibold">Email:</strong> {ADMIN_BOOTSTRAP_EMAIL}</div>
                  <div><strong className="text-indigo-950 font-sans font-semibold">Contraseña:</strong> {ADMIN_BOOTSTRAP_PASSWORD}</div>
                </div>
                <p className="text-[10px] text-indigo-500 mt-2">
                  * Este mensaje desaparecerá de forma permanente cuando el administrador cambie su contraseña temporal.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white py-8 px-4 shadow-xl shadow-slate-100 rounded-3xl sm:px-10 border border-slate-200"
        >
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-xl">
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

          {showChangePasswordForm ? (
            <form className="space-y-6" onSubmit={handleChangePasswordSubmit}>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-medium">
                🔒 Por razones de seguridad, debes actualizar tu contraseña la primera vez que accedes con tu clave temporal de administrador.
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Nueva Contraseña</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm focus:outline-none focus:ring-2 bg-slate-50 focus:bg-white transition-all placeholder-slate-400"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Confirmar Nueva Contraseña</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm focus:outline-none focus:ring-2 bg-slate-50 focus:bg-white transition-all placeholder-slate-400"
                    placeholder="Repite la contraseña"
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
                      <span>Guardando...</span>
                    </span>
                  ) : (
                    <span>Establecer Contraseña y Entrar</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm focus:outline-none focus:ring-2 bg-slate-50 focus:bg-white transition-all placeholder-slate-400"
                    placeholder="estudiante@b2mastery.es"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Contraseña de Acceso</label>
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
                    <span>Iniciar Sesión</span>
                  )}
                </button>
              </div>


            </form>
          )}

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
            <p className="text-xs text-slate-600 mt-1">Exámenes de 40 preguntas con límite de tiempo. Analiza tu precisión de examen con &gt;80% de aciertos.</p>
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
