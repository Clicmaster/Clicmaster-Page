import React, { useState } from 'react';
import { X, LogIn, UserPlus, ShieldCheck, XCircle } from 'lucide-react';
import { useClicCoins } from '../../context/ClicCoinsContext.tsx';

export const AuthModal: React.FC = () => {
  const { authOpen, setAuthOpen, login, register, loading } = useClicCoins();

  const [mode, setMode] = useState<'login' | 'registro'>('login');
  const [username, setUsername] = useState('');
  const [robloxUsername, setRobloxUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authOpen) return null;

  const close = () => {
    setAuthOpen(false);
    setError(null);
    setPassword('');
    setPasswordConfirm('');
    setAdminCode('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'registro' && password !== passwordConfirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const res =
      mode === 'login'
        ? await login(username.trim(), password)
        : await register({
            username: username.trim(),
            robloxUsername: robloxUsername.trim(),
            password,
            adminCode: adminCode.trim() || undefined,
          });

    if (res.success) {
      close();
    } else {
      setError(res.message);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#67F23B]';
  const labelClass = 'block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-[#151518] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-auto">
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/60 dark:bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-[#67F23B] flex items-center justify-center text-[#121212] shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Tu cuenta de ClicCoins en CLICMaster</p>
            </div>
          </div>
          <button
            onClick={close}
            className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas */}
        <div className="px-6 pt-4 flex gap-2">
          {(['login', 'registro'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                mode === m
                  ? 'bg-[#121212] dark:bg-[#67F23B] text-white dark:text-[#121212]'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {m === 'login' ? 'Ya tengo cuenta' : 'Soy nuevo'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className={labelClass}>Nombre de usuario</label>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: Carlos_RP"
              maxLength={20}
              className={inputClass}
            />
          </div>

          {mode === 'registro' && (
            <div>
              <label className={labelClass}>Tu usuario de Roblox</label>
              <input
                type="text"
                required
                value={robloxUsername}
                onChange={(e) => setRobloxUsername(e.target.value)}
                placeholder="Ej: Rodriguez_Capo"
                maxLength={20}
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className={labelClass}>Contraseña</label>
            <input
              type="password"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={mode === 'registro' ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'registro' ? 'Mínimo 8 caracteres' : ''}
              className={inputClass}
            />
          </div>

          {mode === 'registro' && (
            <>
              <div>
                <label className={labelClass}>Repite la contraseña</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className={inputClass}
                />
              </div>

              {showAdminCode ? (
                <div>
                  <label className={labelClass}>Código de administrador (solo staff)</label>
                  <input
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Déjalo vacío si no eres staff"
                    className={inputClass}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAdminCode(true)}
                  className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline"
                >
                  ¿Eres parte del staff?
                </button>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl bg-[#67F23B] hover:bg-[#52db28] text-[#121212] font-black text-sm flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
          >
            {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{loading ? 'Un momento...' : mode === 'login' ? 'Entrar' : 'Crear mi cuenta'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
