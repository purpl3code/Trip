import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, User, Plus, Moon, Sun, Search } from 'lucide-react';

interface BottomNavProps {
  onOpenNewPost: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenNewPost }) => {
  const { activeTab, setActiveTab, currentUser, setSelectedUser, theme, toggleTheme } = useApp();

  const handleProfileClick = () => {
    setSelectedUser(currentUser);
    setActiveTab('profile');
  };

  const tabs = [
    { id: 'feed' as const, icon: Compass, label: 'Feed', onClick: () => setActiveTab('feed') },
    { id: 'search' as const, icon: Search, label: 'Buscar', onClick: () => setActiveTab('search') },
    { id: null, icon: Plus, label: '', onClick: onOpenNewPost },
    { id: 'theme' as const, icon: theme === 'dark' ? Moon : Sun, label: 'Tema', onClick: toggleTheme },
    { id: 'profile' as const, icon: User, label: 'Perfil', onClick: handleProfileClick },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20">
      {/* Curved top shape */}
      <div className="relative">
        {/* Glass bar */}
        <div className="h-[calc(4.5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-[var(--bg-elevated)]/80 backdrop-blur-xl border-t border-[var(--border-subtle)] px-4 flex items-center justify-around transition-colors duration-500">
          {tabs.map((tab, idx) => {
            // Center "+" button
            if (tab.id === null) {
              return (
                <div key="new-post" className="flex justify-center -translate-y-3">
                  <button
                    onClick={tab.onClick}
                    className="gradient-primary text-white p-3.5 rounded-2xl shadow-lg transform active:scale-90 transition-all duration-200 border-4 border-[var(--bg-base)]"
                    style={{ boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)' }}
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              );
            }

            const isActive = tab.id === activeTab;
            const isTheme = tab.id === 'theme';
            const Icon = tab.icon;

            return (
              <button
                key={tab.id || idx}
                onClick={tab.onClick}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 transition-all duration-300 relative ${
                  isActive
                    ? 'text-[var(--clr-primary)]'
                    : isTheme
                      ? 'text-[var(--text-muted)]'
                      : 'text-[var(--text-muted)]'
                }`}
              >
                {/* Active dot indicator */}
                {isActive && (
                  <div className="absolute -top-0.5 w-1 h-1 rounded-full bg-[var(--clr-primary)] animate-scale-in" />
                )}
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-[9px] font-semibold transition-all duration-300 ${isActive ? 'opacity-100 font-bold' : 'opacity-70'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
