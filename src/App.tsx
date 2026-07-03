import { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { PostCard } from './components/PostCard';
import { UserProfile } from './components/UserProfile';
import { NewPostModal } from './components/NewPostModal';
import { SearchView } from './components/SearchView';
import { AuthView } from './components/AuthView';
import { Compass, Users, Sparkles, MapPin } from 'lucide-react';

function App() {
  const { posts, activeTab, setActiveTab, selectedUser, currentUser, isSessionLoading } = useApp();
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [feedType, setFeedType] = useState<'global' | 'following'>('global');

  // Guard clause: show a loading screen during session recovery to prevent login view flash
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] dark:bg-[#090a0d] text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center gap-3">
        <Compass className="w-12 h-12 text-indigo-500 animate-spin-slow" />
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">
          Carregando Diário...
        </span>
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
    <div className="min-h-screen bg-[#f1f3f6] dark:bg-[#090a0d] text-slate-800 dark:text-slate-100 flex transition-colors duration-300">
      {/* Decorative gradient glowing blur elements in background */}
      <div className="fixed top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-pink-500/10 dark:bg-pink-500/5 blur-[120px] pointer-events-none z-0" />

      {/* Sidebar for Desktop */}
      <Sidebar onOpenNewPost={() => setIsNewPostOpen(true)} />

      {/* Main Layout Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative z-10 min-w-0 overflow-x-hidden">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 bg-white/50 dark:bg-[#090a0d]/50 backdrop-blur-md border-b border-white/20 dark:border-white/5 px-6 py-4 flex items-center justify-between z-30 transition-colors duration-300 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-4 md:h-16">
          <div className="flex items-center gap-2 md:hidden">
            <div className="bg-gradient-to-tr from-indigo-500 to-pink-500 p-1.5 rounded-lg">
              <Compass className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <span className="text-lg font-black bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent tracking-widest">
              TRIP
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Bem-vindo de volta ao seu diário de bordo!</span>
          </div>

        </header>

        {/* Content Container */}
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 pb-24 md:pb-8">
          
          {/* Feed View */}
          {activeTab === 'feed' && (
            <div className="space-y-6">
              {/* Feed Title & Toggles */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tight text-gray-800 dark:text-white">Linha do Tempo</h2>
                
                {/* Explorer vs Following Tab */}
                <div className="flex p-0.5 rounded-xl bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/5">
                  <button
                    onClick={() => setFeedType('global')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      feedType === 'global'
                        ? 'bg-white dark:bg-white/10 text-indigo-500 dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Explorar</span>
                  </button>
                  <button
                    onClick={() => setFeedType('following')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      feedType === 'following'
                        ? 'bg-white dark:bg-white/10 text-indigo-500 dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Seguindo</span>
                  </button>
                </div>
              </div>

              {/* Feed Posts List */}
              {displayedPosts.length > 0 ? (
                <div className="space-y-4">
                  {displayedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-3xl p-12 text-center text-gray-400 space-y-3">
                  <MapPin className="w-10 h-10 mx-auto text-indigo-500/40" />
                  <h3 className="font-extrabold text-sm text-gray-700 dark:text-gray-300">Nenhum relato por aqui</h3>
                  <p className="text-xs max-w-sm mx-auto font-normal">
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
            <SearchView />
          )}

          {/* Profile View */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Back to feed header on profiles - hide if viewing own profile */}
              {selectedUser && currentUser && selectedUser.id !== currentUser.id && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveTab('feed')}
                    className="text-xs font-bold text-indigo-500 hover:underline"
                  >
                    ← Voltar para a Linha do Tempo
                  </button>
                </div>
              )}

              {selectedUser && <UserProfile user={selectedUser} />}
            </div>
          )}

        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <BottomNav onOpenNewPost={() => setIsNewPostOpen(true)} />

      {/* New Post Dialog Modal */}
      <NewPostModal isOpen={isNewPostOpen} onClose={() => setIsNewPostOpen(false)} />
    </div>
  );
}

export default App;
