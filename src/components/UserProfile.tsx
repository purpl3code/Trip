import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { User } from '../mockData';
import { Star, MapPin, Grid, UserPlus, UserCheck, Calendar, LogOut, Pencil, Compass } from 'lucide-react';
import { PostCard } from './PostCard';

interface UserProfileProps {
  user: User;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { posts, currentUser, toggleFollow, handleSignOut, setIsEditProfileOpen, setExpandedPhotoUrl } = useApp();
  const [profileTab, setProfileTab] = useState<'posts' | 'moments' | 'gallery'>('posts');

  const isOwnProfile = user.id === currentUser?.id;

  // Filter posts created by this user
  const userPosts = posts.filter((post) => post.user.id === user.id);

  // Extract all photos uploaded by this user with references to their posts
  const allUserPhotos = userPosts.reduce<{ photo: string; post: typeof posts[0] }[]>((acc, post) => {
    if (post.photos && post.photos.length > 0) {
      const postPhotos = post.photos.map((photo) => ({ photo, post }));
      return [...acc, ...postPhotos];
    }
    return acc;
  }, []);

  // Compute unique locations visited by this user and calculate statistics for each location
  const locationStats = userPosts.reduce<Record<string, { ratings: number[]; verdicts: string[]; lastVisited: string }>>(
    (acc, post) => {
      const loc = post.location;
      if (!acc[loc]) {
        acc[loc] = { ratings: [], verdicts: [], lastVisited: post.createdAt };
      }
      acc[loc].ratings.push(post.rating);
      acc[loc].verdicts.push(post.verdict);
      if (new Date(post.createdAt) > new Date(acc[loc].lastVisited)) {
        acc[loc].lastVisited = post.createdAt;
      }
      return acc;
    },
    {}
  );

  const moments = Object.entries(locationStats).map(([name, stats]) => {
    const avgRating = (stats.ratings.reduce((sum, r) => sum + r, 0) / stats.ratings.length).toFixed(1);
    const likesCount = stats.verdicts.filter((v) => v === 'Gostei').length;
    const verdict = likesCount >= stats.verdicts.length / 2 ? 'Gostei' : 'Não gostei';

    return {
      name,
      avgRating,
      verdict,
      visitCount: stats.ratings.length,
      lastVisited: stats.lastVisited,
    };
  });

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Profile Header Card */}
      <div className="glass-card-elevated rounded-3xl overflow-hidden border border-[var(--border-subtle)] animate-slide-up shadow-xl relative">
        {/* Vibrant Banner Image Header */}
        <div className="h-44 sm:h-56 w-full relative overflow-hidden">
          <img src={user.banner} alt="Profile banner" className="w-full h-full object-cover" />
          {/* Subtle gradient overlay fading softly into profile details */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-elevated)] via-[var(--bg-elevated)]/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent opacity-60" />
        </div>

        {/* Profile Details Area */}
        <div className="px-5 sm:px-6 pb-6 relative z-10 space-y-4">
          {/* Floating Avatar & Action Buttons Row */}
          <div className="flex items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-2">
            {/* Avatar */}
            <div className="avatar-ring p-[3px] rounded-2xl shadow-2xl bg-[var(--bg-elevated)] shrink-0 z-20">
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-[14px]"
              />
            </div>

            {/* Follow / Edit Actions */}
            <div className="flex items-center gap-2 mb-1">
              {!isOwnProfile ? (
                <button
                  onClick={() => toggleFollow(user.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    user.isFollowing
                      ? 'btn-secondary hover:bg-[var(--clr-danger)]/10 hover:border-[var(--clr-danger)] hover:text-[var(--clr-danger)]'
                      : 'btn-primary'
                  }`}
                >
                  {user.isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Seguindo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Seguir</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold btn-secondary shadow-sm"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Editar Perfil</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-[var(--clr-danger)]/10 border border-[var(--clr-danger)]/25 text-[var(--clr-danger)] hover:bg-[var(--clr-danger)]/20 transition-all shadow-sm"
                    title="Sair da Conta"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User Bio and Info */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-tight">
                {user.displayName}
              </h2>
              <p className="text-xs font-semibold text-[var(--text-muted)]">@{user.username}</p>
            </div>

            {user.bio && (
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl font-normal leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* 3-Column Stats Grid */}
            <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-[var(--bg-subtle)]/80 backdrop-blur-md border border-[var(--border-subtle)] text-center shadow-inner">
              <div className="flex flex-col items-center">
                <span className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-none">{userPosts.length}</span>
                <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mt-1.5">Relatos</span>
              </div>
              <div className="flex flex-col items-center border-x border-[var(--border-subtle)]">
                <span className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-none">{user.followersCount}</span>
                <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mt-1.5">Seguidores</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-base sm:text-lg font-black text-[var(--text-primary)] leading-none">{user.followingCount}</span>
                <span className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mt-1.5">Seguindo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher - Clean Labels without Numbers */}
      <div className="flex gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] animate-slide-up stagger-2">
        <button
          onClick={() => setProfileTab('posts')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 flex-1 whitespace-nowrap ${
            profileTab === 'posts'
              ? 'bg-[var(--bg-elevated)] text-[var(--clr-primary)] shadow-md border border-[var(--border-subtle)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <Compass className="w-4 h-4 shrink-0" />
          <span>Relatos</span>
        </button>

        <button
          onClick={() => setProfileTab('moments')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 flex-1 whitespace-nowrap ${
            profileTab === 'moments'
              ? 'bg-[var(--bg-elevated)] text-[var(--clr-primary)] shadow-md border border-[var(--border-subtle)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <MapPin className="w-4 h-4 shrink-0" />
          <span>Momentos</span>
        </button>

        <button
          onClick={() => setProfileTab('gallery')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 flex-1 whitespace-nowrap ${
            profileTab === 'gallery'
              ? 'bg-[var(--bg-elevated)] text-[var(--clr-primary)] shadow-md border border-[var(--border-subtle)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <Grid className="w-4 h-4 shrink-0" />
          <span>Fotos</span>
        </button>
      </div>

      {/* Profile Panels */}
      {profileTab === 'posts' ? (
        /* Posts Panel: List of user's posts */
        userPosts.length > 0 ? (
          <div className="space-y-5 animate-fade-in">
            {userPosts.map((post, idx) => (
              <div
                key={post.id}
                id={`post-${post.id}`}
                className="animate-slide-up transition-all duration-500 rounded-3xl"
                style={{ animationDelay: `${Math.min(idx * 60, 400)}ms` }}
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-8 text-center text-[var(--text-muted)] animate-scale-in">
            Nenhum relato publicado ainda. Compartilhe sua primeira viagem no feed!
          </div>
        )
      ) : profileTab === 'moments' ? (
        /* Moments Panel: List of locations and ratings */
        moments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {moments.map((moment, idx) => {
              const firstPost = userPosts.find((p) => p.location === moment.name);
              return (
                <button
                  key={moment.name}
                  onClick={() => {
                    if (firstPost) {
                      setProfileTab('posts');
                      setTimeout(() => {
                        const el = document.getElementById(`post-${firstPost.id}`);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          el.classList.add('ring-2', 'ring-[var(--clr-primary)]');
                          setTimeout(() => {
                            el.classList.remove('ring-2', 'ring-[var(--clr-primary)]');
                          }, 2000);
                        }
                      }, 100);
                    }
                  }}
                  className="glass-card rounded-2xl p-5 border border-[var(--border-subtle)] flex flex-col justify-between transition-all hover:shadow-lg hover:translate-y-[-2px] animate-slide-up text-left w-full focus:outline-none"
                  style={{ animationDelay: `${(idx + 1) * 60}ms` }}
                >
                  <div className="w-full">
                    <div className="flex items-center gap-2 text-[var(--clr-teal)] font-extrabold text-sm mb-2.5">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{moment.name}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="chip chip-amber">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-black">{moment.avgRating}</span>
                      </div>

                      <span className={`chip ${
                        moment.verdict === 'Gostei' ? 'chip-success' : 'chip-danger'
                      }`}>
                        {moment.verdict}
                      </span>
                    </div>
                  </div>

                  <div className="w-full flex items-center justify-between text-[10px] text-[var(--text-muted)] font-medium mt-4 pt-3 border-t border-[var(--border-subtle)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Última visita: {formatDate(moment.lastVisited)}
                    </span>
                    <span>
                      {moment.visitCount} {moment.visitCount === 1 ? 'relato' : 'relatos'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-8 text-center text-[var(--text-muted)] animate-scale-in">
            Nenhum momento registrado ainda. Compartilhe sua primeira viagem no feed!
          </div>
        )
      ) : (
        /* Gallery Panel: Grid of user photos */
        allUserPhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            {allUserPhotos.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setExpandedPhotoUrl(item.photo)}
                className="relative aspect-square rounded-2xl overflow-hidden group shadow-md border border-[var(--border-subtle)] hover:shadow-xl transition-all duration-300 animate-scale-in focus:outline-none text-left cursor-zoom-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <img
                  src={item.photo}
                  alt={`User photo ${idx}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                  <span className="text-[10px] text-white font-bold tracking-wider bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md">
                    Tela Cheia
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-8 text-center text-[var(--text-muted)] animate-scale-in">
            Nenhuma foto publicada ainda. Adicione fotos aos seus relatos!
          </div>
        )
      )}
    </div>
  );
};
