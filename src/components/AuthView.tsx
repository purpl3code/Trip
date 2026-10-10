import React, { useState } from 'react';
import { useApp } from '../context/appState';
import { Compass, Mail, Lock, User, Sparkles, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { authError, authMessage, clearAuthFeedback, isAuthLoading, handleSignIn, handleSignUp } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="auth-page">
      {/* Main Card */}
      <section className="auth-card" aria-labelledby="auth-heading">
        
        {/* Brand Header */}
        <header className="auth-header">
          <div className="auth-brand">
            <span className="auth-brand-icon"><Compass size={26} aria-hidden="true" /></span>
            <span className="auth-wordmark">TRIP</span>
          </div>
          <p className="auth-eyebrow">Viagens, sabores e boas histórias.</p>
          <h1 id="auth-heading">{isSignUp ? 'Sua história começa aqui.' : 'Bem-vindo de volta.'}</h1>
          <p className="auth-description">{isSignUp ? 'Crie seu diário e compartilhe suas descobertas.' : 'Entre para continuar seu diário de descobertas.'}</p>
        </header>

        {/* Auth Error Banner */}
        {authError && (
          <div role="alert" className="auth-error">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Input Form */}
        {authMessage && <div className="auth-message" role="status">{authMessage}</div>}
        <form onSubmit={handleSubmit} className="auth-form" aria-busy={isAuthLoading}>
          {/* Sign Up Fields */}
          {isSignUp && (
            <>
              {/* Display Name */}
              <div className="space-y-1.5 animate-slide-up stagger-1">
                <label htmlFor="auth-name" className="auth-label">
                  <User className="w-3 h-3 text-[var(--clr-primary)]" />
                  Nome de exibição
                </label>
                <input
                  id="auth-name"
                  name="name"
                  autoComplete="name"
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
                <label htmlFor="auth-username" className="auth-label">
                  <User className="w-3 h-3 text-[var(--clr-primary)]" />
                  Nome de usuário
                </label>
                <input
                  id="auth-username"
                  name="username"
                  pattern="[a-z0-9_]{3,30}"
                  title="Use de 3 a 30 letras minúsculas, números ou sublinhados."
                  maxLength={30}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
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
                <label htmlFor="auth-bio" className="auth-label">
                  <Sparkles className="w-3 h-3 text-[var(--clr-primary)]" />
                  Bio curta (opcional)
                </label>
                <input
                  id="auth-bio"
                  name="bio"
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
            <label htmlFor="auth-email" className="auth-label">
              <Mail className="w-3 h-3 text-[var(--clr-primary)]" />
              E-mail
            </label>
            <input
              id="auth-email"
              name="email"
              autoComplete={isSignUp ? 'email' : 'username'}
              autoCapitalize="none"
              spellCheck={false}
              type="email"
              required
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5 animate-slide-up stagger-5">
            <label htmlFor="auth-password" className="auth-label">
              <Lock className="w-3 h-3 text-[var(--clr-primary)]" />
              Senha
            </label>
            <div className="auth-password-wrap">
            <input
              id="auth-password"
              name="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              type={showPassword ? 'text' : 'password'}
              required
              minLength={isSignUp ? 6 : undefined}
              placeholder={isSignUp ? 'Pelo menos 6 caracteres' : 'Digite sua senha'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)]"
            />
            <button type="button" className="auth-password-toggle" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
            </div>
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
              <label htmlFor="keep-logged" className="auth-remember">
                Manter conectado
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isAuthLoading}
            className="auth-submit"
          >
            {isAuthLoading ? (
              <><span className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" aria-hidden="true" /><span>{isSignUp ? 'Criando conta…' : 'Entrando…'}</span></>
            ) : isSignUp ? (
              <>
                <span>Criar conta</span>
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Entrar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Switch */}
        <footer className="auth-footer">
          <span>{isSignUp ? 'Já tem uma conta?' : 'Novo por aqui?'}</span>{' '}
          <button
            type="button"
            disabled={isAuthLoading}
            onClick={() => { clearAuthFeedback(); setIsSignUp(!isSignUp); setShowPassword(false); }}
            className="text-[var(--clr-primary)] hover:underline font-bold transition-colors"
          >
            {isSignUp ? 'Entrar' : 'Criar conta'}
          </button>
        </footer>

      </section>
      <p className="auth-caption">Cada descoberta merece uma história.</p>
    </main>
  );
};
