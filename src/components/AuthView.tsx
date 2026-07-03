import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Mail, Lock, User, Sparkles, AlertCircle } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { authError, isAuthLoading, handleSignIn, handleSignUp } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [keepLogged, setKeepLogged] = useState(() => {
    return localStorage.getItem('trip_keep_logged') !== 'false';
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await handleSignUp(email, password, username, displayName, bio);
    } else {
      await handleSignIn(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] dark:bg-[#090a0d] text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Decorative gradient glowing blur elements in background */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-pink-500/10 dark:bg-pink-500/5 blur-[120px] pointer-events-none z-0" />

      {/* Main Glassmorphism Form Card */}
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-gradient-to-tr from-indigo-500 to-pink-500 p-3 rounded-2xl shadow-lg shadow-indigo-500/20 mb-3">
            <Compass className="w-8 h-8 text-white animate-spin-slow" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-widest">
            TRIP
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-widest uppercase mt-1">
            Diário Social de Viagens & Comidas
          </p>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="p-3.5 mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sign Up Fields */}
          {isSignUp && (
            <>
              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3 h-3 text-indigo-500" />
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-input focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-gray-800 dark:text-white transition-all"
                />
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3 h-3 text-indigo-500" />
                  Nome de Usuário (@handle)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome de usuário desejado"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full px-4 py-3 rounded-2xl glass-input focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-gray-800 dark:text-white transition-all"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Bio curta (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Fale um pouco sobre você..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-input focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-gray-800 dark:text-white transition-all"
                />
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-indigo-500" />
              E-mail
            </label>
            <input
              type="email"
              required
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass-input focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-gray-800 dark:text-white transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-indigo-500" />
              Senha
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass-input focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-gray-800 dark:text-white transition-all"
            />
          </div>

          {/* Keep Connected Checkbox */}
          {!isSignUp && (
            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="keep-logged"
                checked={keepLogged}
                onChange={(e) => {
                  setKeepLogged(e.target.checked);
                  localStorage.setItem('trip_keep_logged', e.target.checked ? 'true' : 'false');
                }}
                className="w-4 h-4 rounded text-indigo-500 border-white/20 dark:border-white/5 bg-white/20 dark:bg-white/5 focus:ring-indigo-500/50"
              />
              <label htmlFor="keep-logged" className="text-xs font-bold text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                Mantenha-me conectado
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isAuthLoading}
            className="w-full py-4 mt-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
          >
            {isAuthLoading ? (
              <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
            ) : isSignUp ? (
              'Criar Minha Conta ✨'
            ) : (
              'Acessar Minha Conta 🚀'
            )}
          </button>
        </form>

        {/* Toggle Switch */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <span>{isSignUp ? 'Já possui uma conta?' : 'Ainda não tem conta?'}</span>{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-500 hover:underline font-bold"
          >
            {isSignUp ? 'Fazer Login' : 'Cadastre-se'}
          </button>
        </div>

      </div>
    </div>
  );
};
