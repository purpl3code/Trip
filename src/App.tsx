import { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { PostCard } from './components/PostCard';
import { UserProfile } from './components/UserProfile';
import { NewPostModal } from './components/NewPostModal';
import { EditProfileModal } from './components/EditProfileModal';
import { SearchView } from './components/SearchView';
import { AuthView } from './components/AuthView';
import { Compass, Users, Sparkles, MapPin, X } from 'lucide-react';

function App() {
  const { posts, activeTab, selectedUser, currentUser, isSessionLoading, isEditProfileOpen, setIsEditProfileOpen, expandedPhotoUrl, setExpandedPhotoUrl } = useApp();
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [feedType, setFeedType] = useState<'global' | 'following'>('global');

  // Guard clause: show a loading screen during session recovery to prevent login view flash
  if (isSessionLoading) {
    return (
      <div className="min-h-screen mesh-bg flex flex-col items-center justify-center gap-5">
        {/* Logo pulse */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl animate-glow-pulse" />
          <div className="relative gradient-primary p-4 rounded-2xl shadow-lg">
            <Compass className="w-10 h-10 text-white animate-spin-slow" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl font-black tracking-widest gradient-primary-text">
            TRIP
          </span>
          <div className="loading-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>
    );
  }

  // Guard clause: enforce authentication
  if (!currentUser) {
    return <AuthView />;
  }

  // Filter posts based on active feed filter
  const displayedPosts = posts.filter((post) => {
    if (feedType === 'global') return true;
    // 'following' feed: posts by users Michael follows + Michael's own posts
    return post.user.isFollowing || post.user.id === currentUser.id;
  });

  return (
    <div className="min-h-screen mesh-bg flex transition-colors duration-500">

      {/* Sidebar for Desktop */}
      <Sidebar onOpenNewPost={() => setIsNewPostOpen(true)} />

      {/* Main Layout Area */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen relative z-10 min-w-0 overflow-x-hidden">
        
        {/* Top Header Bar with Solid Safe Area Top Cap */}
        <header className="sticky top-0 bg-[var(--bg-base)] border-b border-[var(--border-subtle)] px-6 pb-3 pt-[max(env(safe-area-inset-top),40px)] flex items-center justify-between z-40 transition-colors duration-300 md:pt-4 md:h-16 shadow-sm">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 md:hidden">
            <div className="gradient-primary p-1.5 rounded-xl shadow-md">
              <Compass className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black tracking-widest gradient-primary-text">
                TRIP
              </span>
            </div>
          </div>

          {/* Desktop welcome */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
            <Sparkles className="w-4 h-4 text-[var(--clr-primary)]" />
            <span>Bem-vindo de volta ao seu diário de bordo!</span>
          </div>

        </header>

        {/* Content Container */}
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 pb-24 md:pb-8">
          
          {/* Feed View */}
          {activeTab === 'feed' && (
            <div className="space-y-6 animate-fade-in">
              {/* Feed Title & Toggles */}
              <div className="flex items-center justify-between animate-slide-up">
                <h2 className="text-xl font-black tracking-tight text-[var(--text-primary)]">Linha do Tempo</h2>
                
                {/* Explorer vs Following Tab */}
                <div className="flex p-1 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                  <button
                    onClick={() => setFeedType('global')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                      feedType === 'global'
                        ? 'bg-[var(--bg-elevated)] text-[var(--clr-primary)] shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Explorar</span>
                  </button>
                  <button
                    onClick={() => setFeedType('following')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                      feedType === 'following'
                        ? 'bg-[var(--bg-elevated)] text-[var(--clr-primary)] shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Seguindo</span>
                  </button>
                </div>
              </div>

              {/* Feed Posts List */}
              {displayedPosts.length > 0 ? (
                <div className="space-y-5">
                  {displayedPosts.map((post, idx) => (
                    <div key={post.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(idx * 60, 400)}ms` }}>
                      <PostCard post={post} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-3xl p-12 text-center space-y-3 animate-scale-in">
                  <MapPin className="w-10 h-10 mx-auto text-[var(--clr-primary)]/40" />
                  <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Nenhum relato por aqui</h3>
                  <p className="text-xs max-w-sm mx-auto font-normal text-[var(--text-muted)]">
                    {feedType === 'following'
                      ? 'As pessoas que você segue ainda não postaram nada. Alterne para a aba "Explorar" para descobrir novos destinos!'
                      : 'Nenhuma postagem encontrada.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Search View */}
          {activeTab === 'search' && (
            <div className="animate-fade-in">
              <SearchView />
            </div>
          )}

          {/* Profile View */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              {selectedUser && <UserProfile user={selectedUser} />}
            </div>
          )}

        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <BottomNav onOpenNewPost={() => setIsNewPostOpen(true)} />

      {/* New Post Dialog Modal */}
      <NewPostModal isOpen={isNewPostOpen} onClose={() => setIsNewPostOpen(false)} />

      {/* Edit Profile Dialog Modal */}
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />

      {/* Global Fullscreen Lightbox Zoom Modal */}
      {expandedPhotoUrl && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[9999] flex items-center justify-center p-4 animate-fade-in cursor-zoom-out"
          onClick={() => setExpandedPhotoUrl(null)}
        >
          <button 
            className="absolute top-[max(env(safe-area-inset-top),1.5rem)] right-6 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all z-10 focus:outline-none"
            onClick={() => setExpandedPhotoUrl(null)}
            title="Fechar foto"
          >
            <X className="w-6 h-6" />
          </button>
          
          <img
            src={expandedPhotoUrl}
            alt="Foto expandida em tela cheia"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default App;
