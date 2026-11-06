import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useApp } from './context/appState';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { PostCard } from './components/PostCard';
import { UserProfile } from './components/UserProfile';
import { NewPostPage } from './components/NewPostPage';
import { EditProfileModal } from './components/EditProfileModal';
import { SearchView } from './components/SearchView';
import { AuthView } from './components/AuthView';
import { Brand } from './components/Brand';
import { PageHeading } from './components/PageHeading';
import { NotificationCenter } from './components/NotificationCenter';
import { Dialog } from './components/Dialog';
import { ArrowRight, RefreshCw, MapPin, Search, Moon, Sun, CheckCircle2, AlertCircle, X } from 'lucide-react';

function App() {
  const { posts, activeTab, currentUser, selectedUser, setSelectedUser, setActiveTab, isSessionLoading, isEditProfileOpen, setIsEditProfileOpen, expandedPhotoUrl, setExpandedPhotoUrl, notice, dismissNotice, dataError, refreshData, isRefreshing, theme, toggleTheme } = useApp();
  const [feedType, setFeedType] = useState<'global' | 'following'>('global');
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [activeTab, selectedUser?.id]);

  const feedback = notice && <div className={`trip-toast ${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>{notice.kind === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}<span>{notice.message}</span><button className="icon-button" aria-label="Dispensar mensagem" onClick={dismissNotice}><X size={18} /></button></div>;
  const retry = dataError && <div className="data-error" role="alert"><AlertCircle size={20} /><span>{dataError}</span><button onClick={() => void refreshData()} disabled={isRefreshing}>{isRefreshing ? 'Atualizando…' : 'Tentar novamente'}</button></div>;
  if (isSessionLoading) return <div className="session-loading"><Brand /><span className="loading-dots"><span /><span /><span /></span><p>Preparando seu diário…</p></div>;
  if (!currentUser) return <>{retry}<AuthView />{feedback}</>;

  const displayedPosts = feedType === 'global' ? posts : posts.filter(post => post.user.id === currentUser.id || post.user.isFollowing);
  const openProfile = () => { setSelectedUser(currentUser); setActiveTab('profile'); };
  return (
    <div className={`app-shell ${Capacitor.isNativePlatform() ? 'native-app' : ''}`}>
      <a className="skip-link" href="#main-content">Ir para o conteúdo</a>
      <Sidebar onOpenNewPost={() => setActiveTab('create')} />
      <div className="app-body">
        <header className="app-header">
          <Brand />
          <span className="header-context">{activeTab === 'feed' ? 'Seu diário de descobertas' : activeTab === 'search' ? 'Encontre sua próxima parada' : activeTab === 'create' ? 'Uma nova descoberta' : 'Histórias que ficam'}</span>
          <button className="header-search" onClick={() => setActiveTab("search")}><Search size={17} /><span>Buscar no Trip</span><ArrowRight size={15} /></button>
          <div className="header-actions">
            <NotificationCenter />
            <button className="icon-button header-theme" type="button" aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'} title={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'} onClick={toggleTheme}>{theme === 'dark' ? <Sun size={21} aria-hidden="true" /> : <Moon size={21} aria-hidden="true" />}</button>
            <button className="header-avatar" onClick={openProfile} aria-label="Abrir meu perfil"><img src={currentUser.avatar} alt="" /></button>
          </div>
        </header>
        <main id="main-content" className="app-content">
          {retry}
          {activeTab === 'feed' && <>
            <PageHeading title="Seu próximo destino começa aqui" description="Experiências reais de quem esteve lá." action={<button className="icon-button" aria-label="Atualizar relatos" onClick={() => void refreshData()} disabled={isRefreshing}><RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} /></button>} />
            <div className="segmented-control feed-filter" aria-label="Filtrar relatos"><button aria-pressed={feedType === 'global'} onClick={() => setFeedType('global')}>Explorar</button><button aria-pressed={feedType === 'following'} onClick={() => setFeedType('following')}>Seguindo</button></div>
            <div className="post-list">{displayedPosts.map(post => <PostCard key={post.id} post={post} />)}</div>
            {!displayedPosts.length && <div className="empty-state"><MapPin size={32} /><h2>{feedType === 'following' ? 'Seu círculo começa com uma descoberta' : 'O primeiro relato pode ser seu'}</h2><p>{feedType === 'following' ? 'Encontre pessoas na busca e siga os diários que combinam com você.' : 'Conte uma experiência e ajude outras pessoas a escolher sua próxima parada.'}</p><button className="btn-primary" onClick={() => feedType === 'following' ? setActiveTab('search') : setActiveTab('create')}>{feedType === 'following' ? 'Encontrar pessoas' : 'Criar meu primeiro relato'}<ArrowRight size={16} /></button></div>}
          </>}
          <NewPostPage active={activeTab === 'create'} />
          {activeTab === 'search' && <SearchView />}
          {activeTab === 'profile' && selectedUser && <UserProfile key={selectedUser.id} user={selectedUser} onNewPost={() => setActiveTab('create')} />}
        </main>
      </div>
      <BottomNav onOpenNewPost={() => setActiveTab('create')} />
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      <Dialog open={!!expandedPhotoUrl} onClose={() => setExpandedPhotoUrl(null)} title="Foto do relato" className="photo-dialog">{expandedPhotoUrl && <img src={expandedPhotoUrl} alt="Foto do relato ampliada" />}</Dialog>
      {feedback}
    </div>
  );
}
export default App;
