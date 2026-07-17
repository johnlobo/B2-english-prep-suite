import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  Mail,
  KeyRound,
  Plus,
  Search,
  AlertTriangle,
  X,
  Check,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, firebaseConfig } from '../lib/firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

// Helper to create user in Firebase Auth without disrupting current admin session
const createAuthUserDirectly = async (email: string, password: string): Promise<string> => {
  const appName = `SecondaryAuth-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const secondaryApp = initializeApp(firebaseConfig, appName);
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = userCred.user.uid;
    await secondaryAuth.signOut();
    return uid;
  } finally {
    await deleteApp(secondaryApp).catch(() => {});
  }
};

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface UserManagementProps {
  currentUserId: string;
}

export default function UserManagement({ currentUserId }: UserManagementProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  // Fetch users on mount
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList: UserItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          role: data.role || 'user',
          createdAt: data.createdAt
        });
      });
      setUsers(usersList);
    } catch (err: any) {
      // No silent mock-data fallback here: showing fabricated names (or a stale cache) in an admin
      // user list is indistinguishable from real accounts and has caused real confusion before.
      console.error("Firestore fetch users failed:", err);
      setUsers([]);
      setError('No se pudo cargar la lista de usuarios desde Firestore: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUserId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role: 'admin' | 'user') => {
    setFormData(prev => ({ ...prev, role }));
  };

  const startEdit = (user: UserItem) => {
    setEditingUser(user);
    setIsAdding(false);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Leave blank to keep existing
      role: user.role
    });
    setError(null);
    setSuccess(null);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user'
    });
    setError(null);
    setSuccess(null);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingUser(null);
    setError(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError('Por favor, rellena todos los campos.');
      return;
    }

    try {
      setError(null);
      const emailNormalized = formData.email.trim().toLowerCase();

      // 1. Create user in Firebase Auth using the secondary app helper
      const uid = await createAuthUserDirectly(emailNormalized, formData.password.trim());

      // 2. Save user record in Firestore
      const userRef = doc(db, 'users', uid);
      const userDoc = {
        id: uid,
        name: formData.name.trim(),
        email: emailNormalized,
        role: formData.role,
        createdAt: new Date().toISOString()
      };
      await setDoc(userRef, userDoc);

      // 3. Save progress record in Firestore
      const progressRef = doc(db, 'progress', uid);
      const progressDoc = {
        userId: uid,
        completedTheory: [],
        practiceAttempts: {},
        masteredPractice: [],
        examAttempts: []
      };
      await setDoc(progressRef, progressDoc);

      setSuccess(`Usuario "${formData.name}" creado y registrado en la plataforma con éxito.`);
      setIsAdding(false);
      fetchUsers();
    } catch (err: any) {
      setError('No se pudo crear el usuario: ' + (err.message || err));
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!formData.name || !formData.email || !formData.role) {
      setError('Nombre, email y rol son obligatorios.');
      return;
    }

    try {
      setError(null);
      const emailNormalized = formData.email.trim().toLowerCase();

      const userRef = doc(db, 'users', editingUser.id);
      const updateData: any = {
        name: formData.name.trim(),
        email: emailNormalized,
        role: formData.role
      };
      await setDoc(userRef, updateData, { merge: true });
      setSuccess(`Usuario "${formData.name}" actualizado con éxito.`);

      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setError('No se pudo actualizar el usuario: ' + (err.message || err));
    }
  };

  const [sendingReset, setSendingReset] = useState(false);

  // The client SDK can only change the password of the *currently signed-in* user (see
  // ADMIN_BOOTSTRAP_PASSWORD/updatePassword in Auth.tsx) — there is no way for an admin to set
  // another user's password directly without a server-side Admin SDK. Sending a reset email is
  // the actual supported way to let an admin get another account a new password.
  const handleSendPasswordReset = async (targetEmail: string) => {
    setSendingReset(true);
    setError(null);
    setSuccess(null);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setSuccess(`Se ha enviado un email a ${targetEmail} con instrucciones para restablecer su contraseña.`);
    } catch (err: any) {
      setError('No se pudo enviar el email de restablecimiento: ' + (err.message || err));
    } finally {
      setSendingReset(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${userName}"? Esta acción borrará también todo su historial de progreso de forma permanente.`)) {
      return;
    }

    try {
      setError(null);

      await deleteDoc(doc(db, 'users', userId));
      await deleteDoc(doc(db, 'progress', userId));
      setSuccess(`Usuario "${userName}" eliminado con éxito.`);

      if (editingUser?.id === userId) {
        setEditingUser(null);
      }
      fetchUsers();
    } catch (err: any) {
      setError('No se pudo eliminar el usuario: ' + (err.message || err));
    }
  };


  // Filter users based on search
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Administra los perfiles de acceso, asigna roles de administración o de estudiante y controla quién accede a la plataforma.
          </p>
        </div>

        {!isAdding && !editingUser && (
          <button
            onClick={startAdd}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer focus:outline-none self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        )}
      </div>

      {success && (
        <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <p className="text-sm text-emerald-800 font-medium">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Users List Panel */}
        <div className={`lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden`}>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
            <span className="font-semibold text-slate-900 font-display text-base">
              Usuarios Registrados ({filteredUsers.length})
            </span>
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
              <span className="animate-spin text-indigo-600 text-2xl">🌀</span>
              <span className="text-xs">Cargando base de datos de usuarios...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span className="text-xs block">No se encontraron usuarios que coincidan con la búsqueda.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className={`p-4 flex items-center justify-between hover:bg-slate-50/50 transition-all ${
                    editingUser?.id === u.id ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-4">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${
                      u.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {u.role === 'admin' ? <Shield className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 truncate block">{u.name}</span>
                        {u.id === currentUserId && (
                          <span className="bg-indigo-100 text-indigo-800 text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                            Tú
                          </span>
                        )}
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role === 'admin' ? 'Admin' : 'Estudiante'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">{u.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <button
                      onClick={() => startEdit(u)}
                      className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="Editar usuario"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      disabled={u.id === currentUserId}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors cursor-pointer"
                      title={u.id === currentUserId ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Panel: Add or Edit */}
        <AnimatePresence mode="wait">
          {(isAdding || editingUser) ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl border border-indigo-100 shadow-md shadow-indigo-100/30 p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 font-display text-sm flex items-center gap-1.5">
                  {isAdding ? <UserPlus className="w-4 h-4 text-indigo-600" /> : <Edit2 className="w-4 h-4 text-indigo-600" />}
                  {isAdding ? 'Crear Nuevo Usuario' : 'Modificar Usuario'}
                </h3>
                <button onClick={cancelForm} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={isAdding ? handleCreateUser : handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej. Martín Lucas"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Correo Electrónico (o usuario)</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Ej. marting@b2mastery.es"
                      className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                {editingUser ? (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Contraseña</label>
                    <button
                      type="button"
                      onClick={() => handleSendPasswordReset(editingUser.email)}
                      disabled={sendingReset}
                      className="w-full flex items-center justify-center gap-1.5 text-xs py-2 px-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer focus:outline-none"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      {sendingReset ? 'Enviando...' : 'Enviar email para restablecer contraseña'}
                    </button>
                    <span className="text-[9px] text-slate-400 mt-1 block">
                      Un administrador no puede fijar la contraseña de otra cuenta directamente; esto le envía un enlace de restablecimiento al email del usuario.
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Contraseña</label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        name="password"
                        required={isAdding}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Contraseña de acceso"
                        className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Rol del Usuario</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('user')}
                      className={`py-2 px-3 text-xs rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer focus:outline-none ${
                        formData.role === 'user'
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Estudiante
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('admin')}
                      className={`py-2 px-3 text-xs rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer focus:outline-none ${
                        formData.role === 'admin'
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Admin
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer text-center focus:outline-none"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer text-center focus:outline-none"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 mb-1">Panel de Formulario</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Selecciona a cualquier usuario de la lista para editar su perfil o haz clic en "Nuevo Usuario" para registrar uno de forma manual.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
