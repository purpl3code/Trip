import { useApp } from '../context/appState';
import { Compass, User, Moon, Sun, Search, LogOut, Plus } from 'lucide-react';
import { Brand } from './Brand';

export function Sidebar({ onOpenNewPost }: { onOpenNewPost: () => void }) {
  const { activeTab, setActiveTab, currentUser, setSelectedUser, theme, toggleTheme, handleSignOut } = useApp();
  if (!currentUser) return null;
  return <aside className="app-sidebar">
    <div><Brand /><p className="sidebar-tagline">Cada descoberta, uma história.</p>
      <nav aria-label="Navegação principal">
        <button aria-current={activeTab === 'feed' ? 'page' : undefined} onClick={() => setActiveTab('feed')}><Compass size={21} /> Explorar</button>
        <button aria-current={activeTab === 'search' ? 'page' : undefined} onClick={() => setActiveTab('search')}><Search size={21} /> Buscar</button>
        <button aria-current={activeTab === 'profile' ? 'page' : undefined} onClick={() => { setSelectedUser(currentUser); setActiveTab('profile'); }}><User size={21} /> Meu diário</button>
      </nav>
      <button className="btn-primary sidebar-create" aria-current={activeTab === 'create' ? 'page' : undefined} onClick={onOpenNewPost}><Plus size={18} /> Criar relato</button>
    </div>
    <footer><button className="sidebar-theme" onClick={toggleTheme}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}<span>{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</span></button>
      <div className="sidebar-user"><img src={currentUser.avatar} alt="" /><div><strong>{currentUser.displayName}</strong><span>@{currentUser.username}</span></div><button className="icon-button" aria-label="Sair da conta" onClick={() => void handleSignOut()}><LogOut size={18} /></button></div>
    </footer>
  </aside>;
}
