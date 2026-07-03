import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { User } from '../mockData';
import { Star, MapPin, Grid, UserPlus, UserCheck, Calendar, LogOut } from 'lucide-react';

interface UserProfileProps {
  user: User;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { posts, currentUser, toggleFollow, handleSignOut, setIsEditProfileOpen } = useApp();
  const [profileTab, setProfileTab] = useState<'moments' | 'gallery'>('moments');

  const isOwnProfile = user.id === currentUser?.id;

  // Filter posts created by this user
  const userPosts = posts.filter((post) => post.user.id === user.id);

  // Extract all photos uploaded by this user
  const allUserPhotos = userPosts.reduce<string[]>((acc, post) => {
    if (post.photos && post.photos.length > 0) {
      return [...acc, ...post.photos];
    }
    return acc;
  }, []);

  // Compute unique locations visited by this user and calculate statistics for each location
  // A location can appear multiple times if the user posted multiple times about it.
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
    // Find majority verdict
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
      <div className="glass-card rounded-3xl overflow-hidden border border-white/20 dark:border-white/5">
        {/* Banner */}
        <div className="h-36 md:h-48 w-full relative">
          <img src={user.banner} alt="Profile banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0f]/60 to-transparent" />
        </div>

        {/* Profile Details Area */}
        <div className="px-6 pb-6 relative">
          {/* Avatar floating */}
          <div className="absolute -top-12 left-6">
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-100 dark:border-[#0e1017] shadow-xl"
            />
          </div>

          {/* Follow Actions */}
          <div className="flex justify-end pt-4 min-h-[48px]">
            {!isOwnProfile ? (
              <button
                onClick={() => toggleFollow(user.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 shadow-md ${
                  user.isFollowing
                    ? 'bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 text-gray-800 dark:text-white hover:bg-rose-500/10 hover:border-rose-500 hover:text-rose-500'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20'
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
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 text-gray-800 dark:text-white hover:bg-white/35 dark:hover:bg-white/15 transition-all shadow-sm duration-300"
                >
                  <span>Editar Perfil</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/15 border border-rose-500/35 text-rose-500 hover:bg-rose-500/25 transition-all shadow-sm duration-300"
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
              <h2 className="text-xl font-extrabold text-gray-800 dark:text-white leading-tight">
                {user.displayName}
              </h2>
              <p className="text-xs text-gray-400">@{user.username}</p>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl font-normal leading-relaxed">
              {user.bio}
            </p>

            {/* Followers / Posts Counts */}
            <div className="flex gap-6 text-xs font-bold pt-2 text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-900 dark:text-white font-extrabold">{userPosts.length}</span>
                <span className="text-gray-400 font-medium">Relatos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-900 dark:text-white font-extrabold">{user.followersCount}</span>
                <span className="text-gray-400 font-medium">Seguidores</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-900 dark:text-white font-extrabold">{user.followingCount}</span>
                <span className="text-gray-400 font-medium">Seguindo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-white/5 pb-2">
        <button
          onClick={() => setProfileTab('moments')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-all ${
            profileTab === 'moments'
              ? 'border-indigo-500 text-indigo-500'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Momentos ({moments.length})</span>
        </button>
        <button
          onClick={() => setProfileTab('gallery')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-all ${
            profileTab === 'gallery'
              ? 'border-indigo-500 text-indigo-500'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Fotos ({allUserPhotos.length})</span>
        </button>
      </div>

      {/* Profile Panels */}
      {profileTab === 'moments' ? (
        /* Moments Panel: List of locations and ratings */
        moments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {moments.map((moment) => (
              <div
                key={moment.name}
                className="glass-card rounded-2xl p-5 border border-white/20 dark:border-white/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 font-extrabold text-sm mb-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{moment.name}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 text-xs text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{moment.avgRating}</span>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border ${
                        moment.verdict === 'Gostei'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      }`}
                    >
                      {moment.verdict}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Última visita: {formatDate(moment.lastVisited)}
                  </span>
                  <span>
                    {moment.visitCount} {moment.visitCount === 1 ? 'relato' : 'relatos'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-8 text-center text-gray-400">
            Nenhum momento registrado ainda. Compartilhe sua primeira viagem no feed!
          </div>
        )
      ) : (
        /* Gallery Panel: Grid of user photos */
        allUserPhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            {allUserPhotos.map((photo, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-2xl overflow-hidden group shadow-md border border-white/10 hover:scale-[1.01] hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={photo}
                  alt={`User photo ${idx}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none p-4">
                  <span className="text-[10px] text-white font-bold tracking-wider text-center">
                    Visualizar Relato
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-8 text-center text-gray-400">
            Nenhuma foto publicada ainda. Adicione fotos aos seus relatos!
          </div>
        )
      )}
    </div>
  );
};
