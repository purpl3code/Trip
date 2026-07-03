import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, User, Moon, Sun, PlusCircle, Search, LogOut } from 'lucide-react';

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

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white/40 dark:bg-[#0f1115]/40 backdrop-blur-xl border-r border-white/20 dark:border-white/5 p-6 justify-between z-10 transition-colors duration-300">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3 pl-2">
          <div className="bg-gradient-to-tr from-indigo-500 to-pink-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Compass className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-wider">
              TRIP
            </h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-widest uppercase">
              Social Journal
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'feed'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 translate-x-1'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/5'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span>Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'search'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 translate-x-1'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/5'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Buscar</span>
          </button>

          <button
            onClick={handleProfileClick}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'profile'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 translate-x-1'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/5'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Meu Perfil</span>
          </button>
        </nav>

        {/* Action Button */}
        <button
          onClick={onOpenNewPost}
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Novo Relato</span>
        </button>
      </div>

      {/* Footer Profile & Settings */}
      <div className="flex flex-col gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/5 hover:bg-white/30 dark:hover:bg-white/10 transition-all duration-300"
        >
          <span className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            Tema
          </span>
          <span className="text-xs text-gray-400 capitalize">{theme === 'dark' ? 'Escuro' : 'Claro'}</span>
        </button>

        {/* User Card & Logout */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white/20 dark:bg-white/5 border border-white/20 dark:border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.displayName}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/25"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-gray-800 dark:text-white truncate">
                {currentUser.displayName}
              </h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                @{currentUser.username}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
            title="Sair da Conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
