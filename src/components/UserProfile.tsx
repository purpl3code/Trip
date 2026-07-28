import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { User } from '../mockData';
import { Star, MapPin, Grid, UserPlus, UserCheck, Calendar, LogOut, Pencil, Compass } from 'lucide-react';
import { PostCard } from './PostCard';

interface UserProfileProps {
  user: User;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { posts, currentUser, toggleFollow, handleSignOut, setIsEditProfileOpen } = useApp();
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
      <div className="glass-card-elevated rounded-3xl overflow-hidden border border-[var(--border-subtle)] animate-slide-up">
        {/* Banner */}
        <div className="h-36 md:h-48 w-full relative">
          <img src={user.banner} alt="Profile banner" className="w-full h-full object-cover" />
          {/* Mesh overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)]/80 via-[var(--bg-base)]/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--clr-primary)]/10 via-transparent to-[var(--clr-teal)]/10" />
        </div>

        {/* Profile Details Area */}
        <div className="px-6 pb-6 relative">
          {/* Avatar floating */}
          <div className="absolute -top-12 left-6">
            <div className="avatar-ring p-[3px] rounded-2xl shadow-xl">
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-24 h-24 object-cover rounded-[14px]"
              />
            </div>
          </div>

          {/* Follow Actions */}
          <div className="flex justify-end pt-4 min-h-[48px]">
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold btn-secondary"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Editar Perfil</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[var(--clr-danger)]/10 border border-[var(--clr-danger)]/25 text-[var(--clr-danger)] hover:bg-[var(--clr-danger)]/20 transition-all"
                  title="Sair da Conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* User Bio and Meta */}
          <div className="mt-4 space-y-3">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)] leading-tight">
                {user.displayName}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">@{user.username}</p>
            </div>

            <p className="text-sm text-[var(--text-secondary)] max-w-xl font-normal leading-relaxed">
              {user.bio}
            </p>

            {/* Followers / Posts Counts */}
            <div className="flex gap-6 text-xs font-bold pt-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--text-primary)] font-extrabold">{userPosts.length}</span>
                <span className="text-[var(--text-muted)] font-medium">Relatos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--text-primary)] font-extrabold">{user.followersCount}</span>
                <span className="text-[var(--text-muted)] font-medium">Seguidores</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--text-primary)] font-extrabold">{user.followingCount}</span>
                <span className="text-[var(--text-muted)] font-medium">Seguindo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-1 p-1 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] animate-slide-up stagger-2">
        <button
          onClick={() => setProfileTab('posts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex-1 justify-center ${
            profileTab === 'posts'
              ? 'bg-[var(--bg-elevated)] text-[var(--clr-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Relatos ({userPosts.length})</span>
        </button>
        <button
          onClick={() => setProfileTab('moments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex-1 justify-center ${
            profileTab === 'moments'
              ? 'bg-[var(--bg-elevated)] text-[var(--clr-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Momentos ({moments.length})</span>
        </button>
        <button
          onClick={() => setProfileTab('gallery')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex-1 justify-center ${
            profileTab === 'gallery'
              ? 'bg-[var(--bg-elevated)] text-[var(--clr-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Fotos ({allUserPhotos.length})</span>
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
                onClick={() => {
                  setProfileTab('posts');
                  setTimeout(() => {
                    const el = document.getElementById(`post-${item.post.id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      el.classList.add('ring-2', 'ring-[var(--clr-primary)]');
                      setTimeout(() => {
                        el.classList.remove('ring-2', 'ring-[var(--clr-primary)]');
                      }, 2000);
                    }
                  }, 100);
                }}
                className="relative aspect-square rounded-2xl overflow-hidden group shadow-md border border-[var(--border-subtle)] hover:shadow-lg transition-all duration-300 animate-scale-in focus:outline-none text-left"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <img
                  src={item.photo}
                  alt={`User photo ${idx}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <span className="text-[10px] text-white font-bold tracking-wider">
                    Visualizar Relato
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
