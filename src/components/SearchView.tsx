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
  const uniqueLocationsMap = new Map<string, { ratingSum: number; count: number; samplePost: Post }>();
  posts.forEach((post) => {
    const loc = post.location;
    if (loc.toLowerCase().includes(cleanQuery)) {
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
    setSelectedUser(samplePost.user);
    setActiveTab('profile');
  };

  const filterTabs = [
    { id: 'all' as const, label: 'Tudo', icon: null, count: null },
    { id: 'locations' as const, label: 'Locais', icon: MapPin, count: cleanQuery ? matchedLocations.length : 0 },
    { id: 'posts' as const, label: 'Relatos', icon: FileText, count: cleanQuery ? matchedPosts.length : 0 },
    { id: 'people' as const, label: 'Pessoas', icon: Users, count: cleanQuery ? matchedPeople.length : 0 },
  ];

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Search Header */}
      <div className="animate-slide-up">
        <h2 className="text-xl font-black tracking-tight text-[var(--text-primary)]">Buscar</h2>
        <p className="text-xs text-[var(--text-muted)] font-medium">Procure por locais, relatos de viagem ou outros viajantes</p>
      </div>

      {/* Input Bar */}
      <div className="relative animate-slide-up stagger-1">
        <input
          type="text"
          placeholder="Lugares, comidas, pessoas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl glass-input text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)]"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 w-full max-w-full no-scrollbar animate-slide-up stagger-2">
        {filterTabs.map((tab) => {
          const isActive = filterType === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                isActive
                  ? 'btn-primary shadow-sm'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}{tab.count !== null ? ` (${tab.count})` : ''}</span>
            </button>
          );
        })}
      </div>

      {/* Results Display */}
      {!cleanQuery ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-3 animate-scale-in">
          <div className="relative inline-block">
            <Search className="w-10 h-10 mx-auto text-[var(--clr-primary)]/30" />
          </div>
          <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Pronto para explorar?</h3>
          <p className="text-xs max-w-sm mx-auto font-normal text-[var(--text-muted)]">
            Digite algo acima para pesquisar postagens de blog, parceiros de viagem ou novos destinos gastronômicos pelo mundo.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Locations Category */}
          {(filterType === 'all' || filterType === 'locations') && matchedLocations.length > 0 && (
            <div className="space-y-3 animate-slide-up">
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Locais Encontrados</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchedLocations.map((loc, idx) => (
                  <button
                    key={loc.name}
                    onClick={() => handleLocationClick(loc.samplePost)}
                    className="glass-card rounded-2xl p-4 border border-[var(--border-subtle)] flex justify-between items-center text-left transition-all hover:translate-y-[-2px] hover:shadow-lg animate-slide-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div>
                      <div className="flex items-center gap-2 text-[var(--clr-teal)] font-extrabold text-xs mb-1">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{loc.name}</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)]">Ver relatos deste local</p>
                    </div>

                    <div className="chip chip-amber">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="font-black">{loc.avgRating}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* People Category */}
          {(filterType === 'all' || filterType === 'people') && matchedPeople.length > 0 && (
            <div className="space-y-3 animate-slide-up">
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Viajantes Encontrados</h4>
              <div className="space-y-2">
                {matchedPeople.map((user, idx) => (
                  <div
                    key={user.id}
                    className="glass-card rounded-2xl p-4 border border-[var(--border-subtle)] flex items-center justify-between transition-all hover:shadow-md animate-slide-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <button
                      onClick={() => handleUserClick(user)}
                      className="flex items-center gap-3 text-left hover:opacity-85 min-w-0 flex-1 mr-3 group"
                    >
                      <div className="avatar-ring flex-shrink-0">
                        <img src={user.avatar} alt={user.displayName} className="w-9 h-9 object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-[var(--text-primary)] leading-tight truncate group-hover:text-[var(--clr-primary)] transition-colors">
                          {user.displayName}
                        </h4>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">@{user.username}</p>
                      </div>
                    </button>

                    {/* Follow button */}
                    {user.id !== users[0].id && (
                      <button
                        onClick={() => toggleFollow(user.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-bold transition-all duration-300 ${
                          user.isFollowing
                            ? 'btn-secondary'
                            : 'btn-primary text-xs'
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
            <div className="space-y-3 animate-slide-up">
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Relatos e Experiências</h4>
              <div className="space-y-4">
                {matchedPosts.map((post, idx) => (
                  <div key={post.id} className="animate-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty search matches */}
          {matchedPosts.length === 0 && matchedPeople.length === 0 && matchedLocations.length === 0 && (
            <div className="glass-card rounded-3xl p-12 text-center space-y-3 animate-scale-in">
              <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Nenhum resultado</h3>
              <p className="text-xs max-w-sm mx-auto font-normal text-[var(--text-muted)]">
                Não conseguimos encontrar nada correspondente a "{query}". Tente ajustar a busca.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
