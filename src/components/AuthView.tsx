import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Mail, Lock, User, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      {/* Animated mesh orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--clr-primary)]/8 blur-[100px] pointer-events-none animate-float" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[var(--clr-teal)]/6 blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-[30%] right-[15%] w-[30%] h-[30%] rounded-full bg-[var(--clr-coral)]/5 blur-[80px] pointer-events-none animate-float" style={{ animationDelay: '3s' }} />

      {/* Main Card */}
      <div className="glass-panel w-full max-w-md rounded-3xl p-7 md:p-9 relative z-10 animate-modal">
        
        {/* Gradient border accent */}
        <div className="absolute inset-0 rounded-3xl gradient-border pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8 animate-slide-up">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-2xl animate-glow-pulse" />
            <div className="relative gradient-primary p-3.5 rounded-2xl shadow-lg">
              <Compass className="w-8 h-8 text-white animate-spin-slow" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-3xl font-black tracking-widest gradient-primary-text">
              TRIP
            </h1>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-semibold tracking-wider uppercase mt-1.5">
            Diário Social de Viagens & Comidas
          </p>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="p-3.5 mb-5 rounded-2xl bg-[var(--clr-danger)]/10 border border-[var(--clr-danger)]/20 text-xs text-[var(--clr-danger)] font-bold flex items-center gap-2 animate-slide-down">
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
              <div className="space-y-1.5 animate-slide-up stagger-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3 h-3 text-[var(--clr-primary)]" />
                  Nome de Exibição
                </label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)]"
                />
              </div>

              {/* Username */}
              <div className="space-y-1.5 animate-slide-up stagger-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3 h-3 text-[var(--clr-primary)]" />
                  Nome de Usuário (@handle)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome de usuário desejado"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)]"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5 animate-slide-up stagger-3">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[var(--clr-primary)]" />
                  Bio curta (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Fale um pouco sobre você..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)]"
                />
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1.5 animate-slide-up stagger-4">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-[var(--clr-primary)]" />
              E-mail
            </label>
            <input
              type="email"
              required
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5 animate-slide-up stagger-5">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[var(--clr-primary)]" />
              Senha
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>

          {/* Keep Connected Checkbox */}
          {!isSignUp && (
            <div className="flex items-center gap-2.5 py-1 animate-slide-up stagger-6">
              <input
                type="checkbox"
                id="keep-logged"
                checked={keepLogged}
                onChange={(e) => {
                  setKeepLogged(e.target.checked);
                  localStorage.setItem('trip_keep_logged', e.target.checked ? 'true' : 'false');
                }}
                className="w-4 h-4 rounded accent-[var(--clr-primary)] cursor-pointer"
              />
              <label htmlFor="keep-logged" className="text-xs font-semibold text-[var(--text-muted)] cursor-pointer select-none">
                Mantenha-me conectado
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isAuthLoading}
            className="w-full py-4 mt-2 btn-primary rounded-2xl text-sm flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up stagger-7"
          >
            {isAuthLoading ? (
              <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
            ) : isSignUp ? (
              <>
                <span>Criar Minha Conta</span>
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Acessar Minha Conta</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Switch */}
        <div className="mt-6 text-center text-xs text-[var(--text-muted)] animate-slide-up stagger-8">
          <span>{isSignUp ? 'Já possui uma conta?' : 'Ainda não tem conta?'}</span>{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[var(--clr-primary)] hover:underline font-bold transition-colors"
          >
            {isSignUp ? 'Fazer Login' : 'Cadastre-se'}
          </button>
        </div>

      </div>
    </div>
  );
};
