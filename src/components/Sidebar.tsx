import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, User, Moon, Sun, Search, LogOut, Camera } from 'lucide-react';

interface SidebarProps {
  onOpenNewPost: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenNewPost }) => {
  const { activeTab, setActiveTab, currentUser, setSelectedUser, theme, toggleTheme, handleSignOut } = useApp();

  if (!currentUser) return null;

  const handleProfileClick = () => {
    setSelectedUser(currentUser);
    setActiveTab('profile');
  };

  const navItems = [
    { id: 'feed' as const, icon: Compass, label: 'Feed' },
    { id: 'search' as const, icon: Search, label: 'Buscar' },
    { id: 'profile' as const, icon: User, label: 'Meu Perfil', onClick: handleProfileClick },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 glass-panel rounded-none border-l-0 border-t-0 border-b-0 p-6 justify-between z-10 transition-colors duration-500">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3 pl-2 animate-slide-up">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl animate-glow-pulse opacity-50" />
            <div className="relative gradient-primary p-2.5 rounded-2xl shadow-lg">
              <Compass className="w-6 h-6 text-white animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <h1 className="text-2xl font-black tracking-wider gradient-primary-text">
                TRIP
              </h1>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-medium tracking-widest uppercase">
              Social Journal
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item, idx) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick || (() => setActiveTab(item.id))}
                className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 group animate-slide-up`}
                style={{ animationDelay: `${(idx + 1) * 50}ms` }}
              >
                {/* Active indicator bar */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full transition-all duration-300 ${
                  isActive ? 'h-6 bg-[var(--clr-primary)]' : 'h-0 bg-transparent'
                }`} />

                <Icon className={`w-5 h-5 transition-colors duration-300 ${
                  isActive ? 'text-[var(--clr-primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                }`} />
                <span className={`transition-colors duration-300 ${
                  isActive ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                }`}>{item.label}</span>

                {/* Hover background */}
                <div className={`absolute inset-0 rounded-2xl transition-all duration-300 -z-10 ${
                  isActive 
                    ? 'bg-[var(--clr-primary)]/8' 
                    : 'bg-transparent group-hover:bg-[var(--bg-subtle)]'
                }`} />
              </button>
            );
          })}
        </nav>

        {/* Action Button */}
        <button
          onClick={onOpenNewPost}
          className="flex items-center justify-center gap-2.5 w-full py-3.5 btn-primary rounded-2xl text-sm animate-slide-up stagger-4"
        >
          <Camera className="w-5 h-5" />
          <span>Novo Relato</span>
        </button>
      </div>

      {/* Footer Profile & Settings */}
      <div className="flex flex-col gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm font-semibold btn-secondary transition-all duration-300"
        >
          <span className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-[var(--clr-primary)]" /> : <Sun className="w-4 h-4 text-[var(--clr-primary)]" />}
            Tema
          </span>
          <span className="text-xs text-[var(--text-muted)]">{theme === 'dark' ? 'Escuro' : 'Claro'}</span>
        </button>

        {/* User Card & Logout */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="avatar-ring flex-shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                className="w-10 h-10 object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                {currentUser.displayName}
              </h4>
              <p className="text-[10px] text-[var(--text-muted)] truncate">
                @{currentUser.username}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--clr-danger)] hover:bg-[var(--clr-danger)]/10 transition-all"
            title="Sair da Conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
