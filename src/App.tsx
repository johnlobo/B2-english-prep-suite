import React, { useState, useEffect } from 'react';
import {
  Compass,
  BookOpen,
  Database,
  Headphones,
  Sparkles,
  LogOut,
  User,
  Bot,
  Flame,
  Award,
  BookMarked,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';

// Import our custom sub-components
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ModuleSection from './components/ModuleSection';
import SheetSync from './components/SheetSync';
import AudioPlayer from './components/AudioPlayer';
import AITutor from './components/AITutor';
import ExamSimulation from './components/ExamSimulation';
import UserManagement from './components/UserManagement';

// Import Static Data
import { DEFAULT_B2_DATA as b2Modules, getFullCombinedBank } from './data/b2Data';
import { UserProgress, Question, PodcastEpisode } from './types';

export default function App() {
  // Authentication states
  const [user, setUser] = useState<{ id: string; name: string; email: string; role?: string } | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  
  // Custom synced questions bank
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [sheetUrl, setSheetUrl] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState('');

  // Active module indices and global page states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);

  // Active loaded podcast in persistent dock player
  const [activePodcastEpisode, setActivePodcastEpisode] = useState<PodcastEpisode | null>(null);

  // Study streak state
  const [streak, setStreak] = useState(0);

  // Helper to calculate date difference in days
  const getDateDiffInDays = (dateStr1: string, dateStr2: string): number => {
    const d1 = new Date(dateStr1 + 'T00:00:00');
    const d2 = new Date(dateStr2 + 'T00:00:00');
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const getLocalDateString = (): string => {
    const localDate = new Date();
    const offset = localDate.getTimezoneOffset();
    const adjustedDate = new Date(localDate.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
  };

  const checkAndResetStreakIfBroken = () => {
    const today = getLocalDateString();
    const savedLastDate = localStorage.getItem('b2_last_active_date');
    const savedStreak = localStorage.getItem('b2_streak_count');
    
    if (savedLastDate && savedStreak) {
      const diffDays = getDateDiffInDays(today, savedLastDate);
      if (diffDays > 1) {
        // Streak is broken because more than 1 day has passed without accessing
        localStorage.setItem('b2_streak_count', '0');
        setStreak(0);
      } else {
        setStreak(parseInt(savedStreak, 10));
      }
    } else {
      setStreak(0);
    }
  };

  const updateStreakOnAccess = () => {
    const today = getLocalDateString();
    const savedLastDate = localStorage.getItem('b2_last_active_date');
    const savedStreak = localStorage.getItem('b2_streak_count');
    
    let currentStreak = savedStreak ? parseInt(savedStreak, 10) : 0;

    if (!savedLastDate) {
      currentStreak = 1;
    } else if (savedLastDate === today) {
      // Already accessed today, maintain current streak
      if (currentStreak === 0) currentStreak = 1;
    } else {
      const diffDays = getDateDiffInDays(today, savedLastDate);
      if (diffDays === 1) {
        // Consecutive day!
        currentStreak += 1;
      } else {
        // Streak broken/expired
        currentStreak = 1;
      }
    }
    
    localStorage.setItem('b2_streak_count', String(currentStreak));
    localStorage.setItem('b2_last_active_date', today);
    setStreak(currentStreak);
  };

  // Check client-side session on load & listen to Firebase Auth changes
  useEffect(() => {
    const savedCustomQs = localStorage.getItem('b2_custom_qs');
    const savedSheetUrl = localStorage.getItem('b2_sheet_url');
    const savedSyncDate = localStorage.getItem('b2_sync_date');

    if (savedCustomQs) {
      try {
        setCustomQuestions(JSON.parse(savedCustomQs));
      } catch (e) {}
    }
    if (savedSheetUrl) setSheetUrl(savedSheetUrl);
    if (savedSyncDate) setLastSyncedAt(savedSyncDate);
    
    // Check and load study streak
    checkAndResetStreakIfBroken();

    // Firebase Auth session listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          let userData: any = null;
          
          try {
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              userData = userSnap.data();
            } else {
              userData = {
                id: firebaseUser.uid,
                name: firebaseUser.email === 'admin@b2mastery.es' ? 'Administrador' : (firebaseUser.displayName || 'Estudiante'),
                email: firebaseUser.email || '',
                role: firebaseUser.email === 'admin@b2mastery.es' ? 'admin' : 'user',
                createdAt: new Date().toISOString()
              };
              await setDoc(userRef, userData);
            }
          } catch (firestoreErr) {
            console.warn("Firestore fetch user failed, falling back to cached user state", firestoreErr);
            const cachedUserStr = localStorage.getItem('b2_user');
            if (cachedUserStr) {
              userData = JSON.parse(cachedUserStr);
            } else {
              userData = {
                id: firebaseUser.uid,
                name: firebaseUser.email === 'admin@b2mastery.es' ? 'Administrador' : (firebaseUser.displayName || 'Estudiante'),
                email: firebaseUser.email || '',
                role: firebaseUser.email === 'admin@b2mastery.es' ? 'admin' : 'user',
                createdAt: new Date().toISOString()
              };
            }
          }

          // Auto-repair and enforce password change check on session restoration
          if (userData) {
            const isAdminEmail = firebaseUser.email === 'admin@b2mastery.es';
            let needsUpdate = false;
            
            if (isAdminEmail && userData.role !== 'admin') {
              userData.role = 'admin';
              needsUpdate = true;
            }
            if (isAdminEmail && userData.name === 'Estudiante') {
              userData.name = 'Administrador';
              needsUpdate = true;
            }

            // Check setup status
            let isSetupComplete = false;
            try {
              const setupSnap = await getDoc(doc(db, 'system', 'setup'));
              isSetupComplete = setupSnap.exists() ? !!setupSnap.data().adminSetupComplete : false;
            } catch (e) {
              isSetupComplete = false;
            }

            if (firebaseUser.email === 'admin@b2mastery.es' && !isSetupComplete && userData.mustChangePassword !== false) {
              userData.mustChangePassword = true;
              needsUpdate = true;
            }

            if (needsUpdate) {
              try {
                await setDoc(userRef, userData, { merge: true });
              } catch (setDocErr) {
                console.warn("Failed to auto-repair user profile on Firebase (might be rules):", setDocErr);
              }
            }

            // Force logout and prompt password change if mustChangePassword is active
            if (userData.mustChangePassword === true) {
              setUser(null);
              setProgress(null);
              localStorage.removeItem('b2_user');
              localStorage.removeItem('b2_progress');
              return;
            }
          }

          // Fetch user progress from Firestore
          const progressRef = doc(db, 'progress', firebaseUser.uid);
          let progressData: any = null;

          try {
            const progressSnap = await getDoc(progressRef);
            if (progressSnap.exists()) {
              progressData = progressSnap.data();
            } else {
              progressData = {
                userId: firebaseUser.uid,
                completedTheory: [],
                practiceAttempts: {},
                examAttempts: []
              };
              await setDoc(progressRef, progressData);
            }
          } catch (firestoreErr) {
            console.warn("Firestore fetch progress failed, falling back to cached progress state", firestoreErr);
            const cachedProgressStr = localStorage.getItem('b2_progress');
            if (cachedProgressStr) {
              progressData = JSON.parse(cachedProgressStr);
            } else {
              progressData = {
                userId: firebaseUser.uid,
                completedTheory: [],
                practiceAttempts: {},
                examAttempts: []
              };
            }
          }

          setUser(userData);
          setProgress(progressData);
          localStorage.setItem('b2_user', JSON.stringify(userData));
          localStorage.setItem('b2_progress', JSON.stringify(progressData));
        } catch (err) {
          console.error("Error fetching Firebase user session data:", err);
        }
      } else {
        setUser(null);
        setProgress(null);
        localStorage.removeItem('b2_user');
        localStorage.removeItem('b2_progress');
      }
    });

    return () => unsubscribe();
  }, []);

  // Track study module accesses to calculate/increment streak
  useEffect(() => {
    if (activeTab === 'modules') {
      updateStreakOnAccess();
    } else {
      checkAndResetStreakIfBroken();
    }
  }, [activeTab]);

  // Sync state helpers
  const handleAuthSuccess = (
    authenticatedUser: { id: string; name: string; email: string; role?: string },
    userProgress: any
  ) => {
    setUser(authenticatedUser);
    setProgress(userProgress);
    localStorage.setItem('b2_user', JSON.stringify(authenticatedUser));
    localStorage.setItem('b2_progress', JSON.stringify(userProgress));
  };

  const handleUpdateProgress = async (updatedFields: Partial<UserProgress>) => {
    if (!user || !progress) return;

    const newProgress = { ...progress, ...updatedFields };
    setProgress(newProgress);
    localStorage.setItem('b2_progress', JSON.stringify(newProgress));

    // Save directly to Firestore progress collection
    try {
      await setDoc(doc(db, 'progress', user.id), newProgress, { merge: true });
    } catch (err) {
      console.error('Failed to sync progress with Firebase Firestore', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Failed to sign out from Firebase Auth', err);
    }
    setUser(null);
    setProgress(null);
    localStorage.removeItem('b2_user');
    localStorage.removeItem('b2_progress');
  };

  // Google Sheet integration callbacks
  const handleSyncSuccess = (questions: Question[], url: string) => {
    setCustomQuestions(questions);
    setSheetUrl(url);
    const syncDate = new Date().toISOString();
    setLastSyncedAt(syncDate);

    localStorage.setItem('b2_custom_qs', JSON.stringify(questions));
    localStorage.setItem('b2_sheet_url', url);
    localStorage.setItem('b2_sync_date', syncDate);
  };

  const handleClearSync = () => {
    setCustomQuestions([]);
    setSheetUrl('');
    setLastSyncedAt('');
    localStorage.removeItem('b2_custom_qs');
    localStorage.removeItem('b2_sheet_url');
    localStorage.removeItem('b2_sync_date');
  };

  // Compile entire bank of questions (combine default preloaded static + Google sheets imported custom)
  const getFullActiveQuestionBank = (): Question[] => {
    const defaultQs = getFullCombinedBank();
    return [...defaultQs, ...customQuestions];
  };

  // Dynamically merge sheet questions into the modules structure
  const dynamicModules = React.useMemo(() => {
    // Deep clone to avoid mutating the static dataset directly
    const cloned = JSON.parse(JSON.stringify(b2Modules)) as typeof b2Modules;
    
    customQuestions.forEach((q) => {
      const mIdx = q.moduleIndex;
      const dIdx = q.dayIndex;
      
      if (mIdx !== undefined && mIdx >= 0 && mIdx < cloned.length) {
        const targetModule = cloned[mIdx];
        
        if (dIdx !== undefined && dIdx >= 0 && dIdx < targetModule.days.length) {
          const targetDay = targetModule.days[dIdx];
          
          // Avoid duplicate entries
          const alreadyExists = targetDay.practiceQuestions.some(
            (existingQ) => existingQ.id === q.id || existingQ.question.trim().toLowerCase() === q.question.trim().toLowerCase()
          );
          
          if (!alreadyExists) {
            targetDay.practiceQuestions.push(q);
          }
        } else {
          // If no day index is specified or out of bounds, treat as control exam question
          const alreadyExists = targetModule.controlExam.some(
            (existingQ) => existingQ.id === q.id || existingQ.question.trim().toLowerCase() === q.question.trim().toLowerCase()
          );
          
          if (!alreadyExists) {
            targetModule.controlExam.push(q);
          }
        }
      }
    });
    
    return cloned;
  }, [customQuestions]);

  // Persistent continuous Podcast Episode loader callback
  const handleLoadPodcastEpisode = (episode: PodcastEpisode) => {
    setActivePodcastEpisode(episode);
    setActiveTab('podcast'); // jump to audio section
  };

  if (!user || !progress) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Podcast collection of all modules
  const allPodcasts = dynamicModules.flatMap((m) => m.podcastEpisodes);

  // Calculate global progress
  const completedTheoryCount = progress.completedTheory.length;
  const totalTheoryCount = dynamicModules.reduce((acc, m) => acc + m.days.length, 0);
  const theoryPercentage = totalTheoryCount > 0 ? Math.round((completedTheoryCount / totalTheoryCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative pb-16">
      {/* Bento Grid Header */}
      <header className="sticky top-0 z-40 h-20 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl italic shadow-sm shadow-indigo-200">
            B2
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-lg leading-tight font-display text-slate-900">
              Exam Master: Cambridge English
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Authorized Access: {user.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-8">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 py-1.5 px-3 rounded-xl text-xs font-bold animate-pulse">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{streak} {streak === 1 ? 'Día' : 'Días'}</span>
            </div>
          )}

          <div className="hidden md:flex flex-col items-end gap-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Global Progress</div>
            <div className="flex items-center gap-2">
              <div className="w-32 lg:w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${theoryPercentage}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-indigo-600">{theoryPercentage}%</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pl-4 sm:pl-8 border-l border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative shadow-inner">
              <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold text-sm">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="hidden sm:block text-right leading-none">
              <div className="text-sm font-bold text-slate-800">{user.name.split(' ')[0]}</div>
              <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5 animate-pulse">Online</div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 border border-slate-100 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition-all cursor-pointer focus:outline-none"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Core Router Layout with desktop left navigation bar and mobile bottom navigation */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar for desktop */}
        <nav className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 p-6 space-y-8 flex-shrink-0">
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-3">Estudio</h3>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 py-3 px-4 rounded-xl text-left text-sm font-semibold transition-all focus:outline-none cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('modules')}
              className={`w-full flex items-center space-x-3 py-3 px-4 rounded-xl text-left text-sm font-semibold transition-all focus:outline-none cursor-pointer ${
                activeTab === 'modules' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Módulos de Preparación</span>
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-3">Interactivos</h3>
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center space-x-3 py-3 px-4 rounded-xl text-left text-sm font-semibold transition-all focus:outline-none cursor-pointer ${
                activeTab === 'chat' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bot className="w-5 h-5" />
              <span>Tutor de IA</span>
            </button>

            <button
              onClick={() => setActiveTab('podcast')}
              className={`w-full flex items-center space-x-3 py-3 px-4 rounded-xl text-left text-sm font-semibold transition-all focus:outline-none cursor-pointer ${
                activeTab === 'podcast' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Headphones className="w-5 h-5" />
              <span>Podcast y Audio</span>
            </button>
          </div>

          {user && user.role === 'admin' && (
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-3">Administración</h3>
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`w-full flex items-center space-x-3 py-3 px-4 rounded-xl text-left text-sm font-semibold transition-all focus:outline-none cursor-pointer ${
                  activeTab === 'usuarios' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Gestión Usuarios</span>
              </button>

              <button
                onClick={() => setActiveTab('sheets')}
                className={`w-full flex items-center space-x-3 py-3 px-4 rounded-xl text-left text-sm font-semibold transition-all focus:outline-none cursor-pointer ${
                  activeTab === 'sheets' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Database className="w-5 h-5" />
                <span>Sincronizar Sheets</span>
              </button>
            </div>
          )}
        </nav>

        {/* Dynamic Content View Area */}
        <main className="flex-1 bg-slate-50/50 pb-12 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Dashboard
                  user={user}
                  progress={progress}
                  modules={dynamicModules}
                  onSelectTab={(tab, moduleIdx) => {
                    setActiveTab(tab);
                    if (moduleIdx !== undefined) {
                      setSelectedModuleIndex(moduleIdx);
                    }
                  }}
                  onStartSimulation={() => setActiveTab('simulacion')}
                  streak={streak}
                />
              </motion.div>
            )}

            {activeTab === 'modules' && (
              <motion.div
                key="modules"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ModuleSection
                  modules={dynamicModules}
                  selectedModuleIndex={selectedModuleIndex}
                  onSelectModule={setSelectedModuleIndex}
                  progress={progress}
                  onUpdateProgress={handleUpdateProgress}
                  onLoadPodcastEpisode={handleLoadPodcastEpisode}
                />
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AITutor />
              </motion.div>
            )}

            {activeTab === 'podcast' && (
              <motion.div
                key="podcast"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AudioPlayer episodes={allPodcasts} />
              </motion.div>
            )}

            {activeTab === 'sheets' && user && user.role === 'admin' && (
              <motion.div
                key="sheets"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SheetSync
                  userId={user.id}
                  googleSheetUrl={sheetUrl}
                  lastSyncedAt={lastSyncedAt}
                  onSyncSuccess={handleSyncSuccess}
                  onClearSync={handleClearSync}
                  customQuestionsCount={customQuestions.length}
                />
              </motion.div>
            )}

            {activeTab === 'usuarios' && user && user.role === 'admin' && (
              <motion.div
                key="usuarios"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <UserManagement currentUserId={user.id} />
              </motion.div>
            )}

            {activeTab === 'simulacion' && (
              <motion.div
                key="simulacion"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ExamSimulation
                  questions={getFullActiveQuestionBank()}
                  onComplete={(attempt) => {
                    const attempts = progress.examAttempts || [];
                    handleUpdateProgress({ examAttempts: [...attempts, attempt] });
                  }}
                  onCancel={() => setActiveTab('dashboard')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Floating mini Audio status continuous player at bottom if a podcast is loaded */}
      {activePodcastEpisode && (
        <div className="fixed bottom-14 md:bottom-0 left-0 right-0 bg-slate-900 text-white py-2 px-4 flex items-center justify-between border-t border-slate-800 shadow-xl z-30">
          <div className="flex items-center space-x-3 truncate">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Headphones className="w-4 h-4 animate-bounce" />
            </div>
            <div className="truncate">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Reproducción Activa</span>
              <span className="text-xs font-semibold block truncate">{activePodcastEpisode.title}</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('podcast')}
            className="text-[11px] font-bold text-indigo-300 hover:text-indigo-200 uppercase tracking-wider py-1 px-3 bg-white/10 rounded-lg cursor-pointer focus:outline-none"
          >
            Abrir Reproductor
          </button>
        </div>
      )}

      {/* Mobile-friendly Bottom Navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center h-14 z-40 px-2 shadow-inner">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl focus:outline-none ${
            activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px] font-medium mt-0.5">Inicio</span>
        </button>

        <button
          onClick={() => setActiveTab('modules')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl focus:outline-none ${
            activeTab === 'modules' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[9px] font-medium mt-0.5">Módulos</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl focus:outline-none ${
            activeTab === 'chat' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Bot className="w-5 h-5" />
          <span className="text-[9px] font-medium mt-0.5">Tutor IA</span>
        </button>

        <button
          onClick={() => setActiveTab('podcast')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl focus:outline-none ${
            activeTab === 'podcast' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <Headphones className="w-5 h-5" />
          <span className="text-[9px] font-medium mt-0.5">Audio</span>
        </button>

        {user && user.role === 'admin' && (
          <>
            <button
              onClick={() => setActiveTab('sheets')}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl focus:outline-none ${
                activeTab === 'sheets' ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <Database className="w-5 h-5" />
              <span className="text-[9px] font-medium mt-0.5">Sheets</span>
            </button>

            <button
              onClick={() => setActiveTab('usuarios')}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl focus:outline-none ${
                activeTab === 'usuarios' ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[9px] font-medium mt-0.5">Usuarios</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
