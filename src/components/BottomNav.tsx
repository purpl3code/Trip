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

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-white/70 dark:bg-[#0f1115]/75 backdrop-blur-lg border-t border-white/20 dark:border-white/5 px-6 flex items-center justify-between z-20 transition-colors duration-300">
      <button
        onClick={() => setActiveTab('feed')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
          activeTab === 'feed'
            ? 'text-indigo-500 scale-105'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-medium">Feed</span>
      </button>

      <button
        onClick={() => setActiveTab('search')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
          activeTab === 'search'
            ? 'text-indigo-500 scale-105'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px] font-medium">Buscar</span>
      </button>

      {/* Floating Center Button */}
      <div className="flex-1 flex justify-center -translate-y-4">
        <button
          onClick={onOpenNewPost}
          className="bg-gradient-to-tr from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white p-3.5 rounded-full shadow-lg shadow-purple-500/30 transform active:scale-95 transition-all duration-200 border-4 border-[#f3f4f6] dark:border-[#13151a]"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <button
        onClick={toggleTheme}
        className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-gray-500 dark:text-gray-400"
      >
        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
        <span className="text-[10px] font-medium">Tema</span>
      </button>

      <button
        onClick={handleProfileClick}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
          activeTab === 'profile'
            ? 'text-indigo-500 scale-105'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium">Perfil</span>
      </button>
    </nav>
  );
};
