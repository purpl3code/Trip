import { useApp } from '../context/appState';
import { Compass, User, Plus, Search } from 'lucide-react';

export function BottomNav({ onOpenNewPost }: { onOpenNewPost: () => void }) {
  const { activeTab, setActiveTab, currentUser, setSelectedUser } = useApp();
  return <nav className="bottom-nav" aria-label="Navegação principal">
    <button aria-current={activeTab === 'feed' ? 'page' : undefined} onClick={() => setActiveTab('feed')}><span className="bottom-nav-icon" aria-hidden="true"><Compass size={22} /></span><span>Explorar</span></button>
    <button aria-current={activeTab === 'search' ? 'page' : undefined} onClick={() => setActiveTab('search')}><span className="bottom-nav-icon" aria-hidden="true"><Search size={22} /></span><span>Buscar</span></button>
    <button aria-current={activeTab === 'create' ? 'page' : undefined} aria-label="Criar novo relato" onClick={onOpenNewPost}><span className="bottom-nav-icon" aria-hidden="true"><Plus size={22} /></span><span>Relatar</span></button>
    <button aria-current={activeTab === 'profile' ? 'page' : undefined} onClick={() => { setSelectedUser(currentUser); setActiveTab('profile'); }}><span className="bottom-nav-icon" aria-hidden="true"><User size={22} /></span><span>Perfil</span></button>
  </nav>;
}
