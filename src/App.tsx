import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useApp } from './context/appState';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { PostCard } from './components/PostCard';
import { UserProfile } from './components/UserProfile';
import { NewPostModal } from './components/NewPostModal';
import { EditProfileModal } from './components/EditProfileModal';
import { SearchView } from './components/SearchView';
import { AuthView } from './components/AuthView';
import { Brand } from './components/Brand';
import { Dialog } from './components/Dialog';
import { ArrowRight, RefreshCw, MapPin, CheckCircle2, AlertCircle, X } from 'lucide-react';

function App() {
  const { posts, activeTab, currentUser, selectedUser, setSelectedUser, setActiveTab, isSessionLoading, isEditProfileOpen, setIsEditProfileOpen, expandedPhotoUrl, setExpandedPhotoUrl, notice, dismissNotice, dataError, refreshData, isRefreshing } = useApp();
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [feedType, setFeedType] = useState<'global' | 'following'>('global');
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [activeTab, selectedUser?.id]);
  useEffect(() => { if (!currentUser) setIsNewPostOpen(false); }, [currentUser]);

  const feedback = notice && <div className={`trip-toast ${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>{notice.kind === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}<span>{notice.message}</span><button className="icon-button" aria-label="Dispensar mensagem" onClick={dismissNotice}><X size={18} /></button></div>;
  const retry = dataError && <div className="data-error" role="alert"><AlertCircle size={20} /><span>{dataError}</span><button onClick={() => void refreshData()} disabled={isRefreshing}>{isRefreshing ? 'Atualizando…' : 'Tentar novamente'}</button></div>;
  if (isSessionLoading) return <div className="session-loading"><Brand /><span className="loading-dots"><span /><span /><span /></span><p>Preparando seu diário…</p></div>;
  if (!currentUser) return <>{retry}<AuthView />{feedback}</>;

  const displayedPosts = feedType === 'global' ? posts : posts.filter(post => post.user.id === currentUser.id || post.user.isFollowing);
  const openProfile = () => { setSelectedUser(currentUser); setActiveTab('profile'); };
  return (
    <div className={`app-shell ${Capacitor.isNativePlatform() ? 'native-app' : ''}`}>
      <a className="skip-link" href="#main-content">Ir para o conteúdo</a>
      <Sidebar onOpenNewPost={() => setIsNewPostOpen(true)} />
      <div className="app-body">
        <header className="app-header">
          <Brand />
          <span className="header-context">{activeTab === 'feed' ? 'Seu diário de descobertas' : activeTab === 'search' ? 'Encontre sua próxima parada' : 'Histórias que ficam'}</span>
          <button className="header-avatar" onClick={openProfile} aria-label="Abrir meu perfil"><img src={currentUser.avatar} alt="" /></button>
        </header>
        <main id="main-content" className="app-content">
          {retry}
          {activeTab === 'feed' && <>
            <div className="section-heading"><div><h2>Seu próximo destino começa aqui</h2><p>Experiências reais de quem esteve lá.</p></div><button className="icon-button" aria-label="Atualizar relatos" onClick={() => void refreshData()} disabled={isRefreshing}><RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} /></button></div>
            <div className="segmented-control feed-filter" aria-label="Filtrar relatos"><button aria-pressed={feedType === 'global'} onClick={() => setFeedType('global')}>Explorar</button><button aria-pressed={feedType === 'following'} onClick={() => setFeedType('following')}>Seguindo</button></div>
            <div className="post-list">{displayedPosts.map(post => <PostCard key={post.id} post={post} />)}</div>
            {!displayedPosts.length && <div className="empty-state"><MapPin size={32} /><h3>{feedType === 'following' ? 'Seu círculo começa com uma descoberta' : 'O primeiro relato pode ser seu'}</h3><p>{feedType === 'following' ? 'Encontre pessoas na busca e siga os diários que combinam com você.' : 'Conte uma experiência e ajude outras pessoas a escolher sua próxima parada.'}</p><button className="btn-primary" onClick={() => feedType === 'following' ? setActiveTab('search') : setIsNewPostOpen(true)}>{feedType === 'following' ? 'Encontrar pessoas' : 'Criar meu primeiro relato'}<ArrowRight size={16} /></button></div>}
          </>}
          {activeTab === 'search' && <SearchView />}
          {activeTab === 'profile' && selectedUser && <UserProfile key={selectedUser.id} user={selectedUser} onNewPost={() => setIsNewPostOpen(true)} />}
        </main>
      </div>
      <BottomNav onOpenNewPost={() => setIsNewPostOpen(true)} />
      <NewPostModal isOpen={isNewPostOpen} onClose={() => setIsNewPostOpen(false)} />
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      <Dialog open={!!expandedPhotoUrl} onClose={() => setExpandedPhotoUrl(null)} title="Foto do relato" className="photo-dialog">{expandedPhotoUrl && <img src={expandedPhotoUrl} alt="Foto do relato ampliada" />}</Dialog>
      {feedback}
    </div>
  );
}
export default App;
