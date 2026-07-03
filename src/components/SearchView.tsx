import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';
import { Search, MapPin, Users, FileText, Star, UserPlus, UserCheck } from 'lucide-react';
import type { User, Post } from '../mockData';

export const SearchView: React.FC = () => {
  const { posts, users, setSelectedUser, setActiveTab, toggleFollow } = useApp();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'locations' | 'posts' | 'people'>('all');

  const cleanQuery = query.toLowerCase().trim();

  // 1. Search for posts
  const matchedPosts = posts.filter((post) => {
    return (
      post.location.toLowerCase().includes(cleanQuery) ||
      post.content.toLowerCase().includes(cleanQuery) ||
      post.user.displayName.toLowerCase().includes(cleanQuery) ||
      post.user.username.toLowerCase().includes(cleanQuery)
    );
  });

  // 2. Search for people
  const matchedPeople = users.filter((user) => {
    return (
      user.displayName.toLowerCase().includes(cleanQuery) ||
      user.username.toLowerCase().includes(cleanQuery) ||
      user.bio.toLowerCase().includes(cleanQuery)
    );
  });

  // 3. Search for unique locations
  // We extract matching locations from the posts list
  const uniqueLocationsMap = new Map<string, { ratingSum: number; count: number; samplePost: Post }>();
  posts.forEach((post) => {
    const loc = post.location;
    if (loc.toLowerCase().includes(cleanQuery)) {
      // Calculate this post's current ratings (author + comments)
      const postRatings = [
        post.rating,
        ...post.comments.filter((c) => c.rating !== undefined).map((c) => c.rating as number),
      ];
      const avg = postRatings.reduce((a, b) => a + b, 0) / postRatings.length;
      
      const existing = uniqueLocationsMap.get(loc);
      if (existing) {
        existing.ratingSum += avg;
        existing.count += 1;
      } else {
        uniqueLocationsMap.set(loc, { ratingSum: avg, count: 1, samplePost: post });
      }
    }
  });

  const matchedLocations = Array.from(uniqueLocationsMap.entries()).map(([name, data]) => {
    const avgRating = (data.ratingSum / data.count).toFixed(1);
    return {
      name,
      avgRating,
      samplePost: data.samplePost,
    };
  });

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setActiveTab('profile');
  };

  const handleLocationClick = (samplePost: Post) => {
    // To view location details, we can simply focus on the sample post in the feed
    setSelectedUser(samplePost.user);
    setActiveTab('profile');
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div>
        <h2 className="text-xl font-black tracking-tight text-gray-800 dark:text-white">Buscar</h2>
        <p className="text-xs text-gray-400 font-medium">Procure por locais, relatos de viagem ou outros viajantes</p>
      </div>

      {/* Input Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Lugares, comidas, pessoas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl glass-input focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-gray-800 dark:text-white transition-all shadow-inner placeholder-gray-400 dark:placeholder-gray-500"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'all'
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white/30 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-white/50'
          }`}
        >
          Tudo
        </button>
        <button
          onClick={() => setFilterType('locations')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'locations'
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white/30 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-white/50'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Locais ({cleanQuery ? matchedLocations.length : 0})</span>
        </button>
        <button
          onClick={() => setFilterType('posts')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'posts'
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white/30 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-white/50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Relatos ({cleanQuery ? matchedPosts.length : 0})</span>
        </button>
        <button
          onClick={() => setFilterType('people')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterType === 'people'
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
              : 'bg-white/30 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-white/50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Pessoas ({cleanQuery ? matchedPeople.length : 0})</span>
        </button>
      </div>

      {/* Results Display */}
      {!cleanQuery ? (
        <div className="glass-card rounded-3xl p-12 text-center text-gray-400 space-y-3">
          <Search className="w-10 h-10 mx-auto text-indigo-500/30" />
          <h3 className="font-extrabold text-sm text-gray-700 dark:text-gray-300">Pronto para explorar?</h3>
          <p className="text-xs max-w-sm mx-auto font-normal">
            Digite algo acima para pesquisar postagens de blog, parceiros de viagem ou novos destinos gastronômicos pelo mundo.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Locations Category */}
          {(filterType === 'all' || filterType === 'locations') && matchedLocations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Locais Encontrados</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchedLocations.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => handleLocationClick(loc.samplePost)}
                    className="glass-card rounded-2xl p-4 border border-white/20 dark:border-white/5 flex justify-between items-center text-left transition-all hover:scale-[1.01] hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 font-extrabold text-xs mb-1">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{loc.name}</span>
                      </div>
                      <p className="text-[10px] text-gray-400">Ver relatos deste local</p>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg text-[10px] text-amber-500 font-bold border border-amber-500/20">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{loc.avgRating}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* People Category */}
          {(filterType === 'all' || filterType === 'people') && matchedPeople.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Viajantes Encontrados</h4>
              <div className="space-y-2">
                {matchedPeople.map((user) => (
                  <div
                    key={user.id}
                    className="glass-card rounded-2xl p-4 border border-white/20 dark:border-white/5 flex items-center justify-between transition-all hover:shadow-sm"
                  >
                    <button
                      onClick={() => handleUserClick(user)}
                      className="flex items-center gap-3 text-left hover:opacity-85 min-w-0 flex-1 mr-3"
                    >
                      <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-gray-800 dark:text-white leading-tight truncate">
                          {user.displayName}
                        </h4>
                        <p className="text-[10px] text-gray-400 truncate">@{user.username}</p>
                      </div>
                    </button>

                    {/* Follow button */}
                    {user.id !== users[0].id && (
                      <button
                        onClick={() => toggleFollow(user.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 ${
                          user.isFollowing
                            ? 'bg-white/20 dark:bg-white/5 border border-white/30 dark:border-white/10 text-gray-800 dark:text-white'
                            : 'bg-indigo-500 text-white'
                        }`}
                      >
                        {user.isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                        <span>{user.isFollowing ? 'Seguindo' : 'Seguir'}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Category */}
          {(filterType === 'all' || filterType === 'posts') && matchedPosts.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Relatos e Experiências</h4>
              <div className="space-y-4">
                {matchedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* Empty search matches */}
          {matchedPosts.length === 0 && matchedPeople.length === 0 && matchedLocations.length === 0 && (
            <div className="glass-card rounded-3xl p-12 text-center text-gray-400 space-y-3">
              <h3 className="font-extrabold text-sm text-gray-700 dark:text-gray-300">Nenhum resultado</h3>
              <p className="text-xs max-w-sm mx-auto font-normal">
                Não conseguimos encontrar nada correspondente a "{query}". Tente ajustar a busca.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
