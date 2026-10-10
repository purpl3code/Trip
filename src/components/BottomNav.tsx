import { useApp } from '../context/appState';
import { Compass, User, Plus, Moon, Sun, Search } from 'lucide-react';

export function BottomNav({ onOpenNewPost }: { onOpenNewPost: () => void }) {
  const { activeTab, setActiveTab, currentUser, setSelectedUser, theme, toggleTheme } = useApp();
  return <nav className="bottom-nav" aria-label="Navegação principal">
    <button aria-current={activeTab === 'feed' ? 'page' : undefined} onClick={() => setActiveTab('feed')}><Compass size={21} /><span>Explorar</span></button>
    <button aria-current={activeTab === 'search' ? 'page' : undefined} onClick={() => setActiveTab('search')}><Search size={21} /><span>Buscar</span></button>
    <button className="nav-create" aria-label="Criar novo relato" onClick={onOpenNewPost}><Plus size={24} /><span>Relatar</span></button>
    <button aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'} onClick={toggleTheme}>{theme === 'dark' ? <Sun size={21} /> : <Moon size={21} />}<span>Tema</span></button>
    <button aria-current={activeTab === 'profile' ? 'page' : undefined} onClick={() => { setSelectedUser(currentUser); setActiveTab('profile'); }}><User size={21} /><span>Perfil</span></button>
  </nav>;
}
