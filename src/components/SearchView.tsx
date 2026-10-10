import { useState } from 'react';
import { useApp } from '../context/appState';
import { PostCard } from './PostCard';
import { Search, MapPin, Users, Star, ArrowUpRight, ArrowLeft, X, UserPlus, UserCheck } from 'lucide-react';
import type { User } from '../mockData';
import { normalizeSearch, groupLocations } from '../utils/discovery';
import { errorMessage } from '../utils/errors';

export function SearchView() {
  const { posts, users, currentUser, setSelectedUser, setActiveTab, toggleFollow, notify } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'locations' | 'posts' | 'people'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const clean = normalizeSearch(query);
  const locations = groupLocations(posts);
  const matchedLocations = locations.filter(location => normalizeSearch(location.name).includes(clean));
  const matchedPosts = posts.filter(post => [post.location, post.content, post.user.displayName, post.user.username].some(value => normalizeSearch(value).includes(clean)));
  const matchedPeople = users.filter(user => [user.displayName, user.username, user.bio].some(value => normalizeSearch(value).includes(clean)));
  const visibleLocations = filter === 'all' || filter === 'locations';
  const visiblePeople = filter === 'all' || filter === 'people';
  const visiblePosts = filter === 'all' || filter === 'posts';
  const empty = !(visibleLocations && matchedLocations.length || visiblePeople && matchedPeople.length || visiblePosts && matchedPosts.length);
  const openUser = (user: User) => { setSelectedUser(user); setActiveTab('profile'); };
  const follow = async (user: User) => {
    setPending(user.id);
    try { await toggleFollow(user.id); } catch (error) { notify(errorMessage(error), 'error'); } finally { setPending(null); }
  };
  const locationPosts = selectedLocation ? posts.filter(post => normalizeSearch(post.location) === selectedLocation) : [];
  const locationName = locations.find(location => normalizeSearch(location.name) === selectedLocation)?.name;

  if (selectedLocation) return <section className="search-page">
    <button className="back-link" onClick={() => setSelectedLocation(null)}><ArrowLeft size={18} /> Voltar à busca</button>
    <div className="page-heading"><span className="eyebrow">LUGAR DESCOBERTO</span><h1>{locationName}</h1><p>{locationPosts.length} {locationPosts.length === 1 ? 'experiência compartilhada' : 'experiências compartilhadas'} neste local.</p></div>
    <div className="post-list">{locationPosts.map(post => <PostCard key={post.id} post={post} />)}</div>
  </section>;

  return <section className="search-page">
    <div className="page-heading"><span className="eyebrow">SIGA SUA CURIOSIDADE</span><h1>Qual é a próxima parada?</h1><p>Lugares, sabores e pessoas com histórias para contar.</p></div>
    <div className="search-input"><Search size={20} aria-hidden="true" /><input type="search" aria-label="Buscar lugares, relatos ou pessoas" placeholder="Busque um lugar, uma comida ou alguém" value={query} onChange={event => setQuery(event.target.value)} />{query && <button className="icon-button" aria-label="Limpar busca" onClick={() => setQuery('')}><X size={18} /></button>}</div>
    <div className="segmented-control search-filters" aria-label="Filtrar resultados">{([['all','Tudo'],['locations','Lugares'],['posts','Relatos'],['people','Pessoas']] as const).map(([id,label]) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div>
    {!clean && <div className="discovery-intro"><CompassIllustration /><div><h2>Boas descobertas estão por perto.</h2><p>Explore os lugares da comunidade ou encontre alguém para acompanhar.</p></div></div>}
    {visibleLocations && matchedLocations.length > 0 && <div><div className="section-heading"><h2>{clean ? 'Lugares encontrados' : 'Lugares da comunidade'}</h2><span>{matchedLocations.length}</span></div><div className="location-grid">{matchedLocations.map(location => <button key={location.name} className="location-card" onClick={() => setSelectedLocation(normalizeSearch(location.name))}><div className="location-card-icon"><MapPin size={22} /></div><div><h3>{location.name}</h3><p>{location.posts.length} {location.posts.length === 1 ? 'relato' : 'relatos'} · <Star size={12} fill="currentColor" /> {location.rating.toFixed(1)}</p></div><ArrowUpRight size={18} /></button>)}</div></div>}
    {visiblePeople && matchedPeople.length > 0 && <div><div className="section-heading"><h2>{clean ? 'Pessoas encontradas' : 'Diários para acompanhar'}</h2><span>{matchedPeople.length}</span></div><div className="people-list">{matchedPeople.map(user => <div className="person-card" key={user.id}><button className="person-info" onClick={() => openUser(user)}><img src={user.avatar} alt="" /><div><strong>{user.displayName}</strong><span>@{user.username}</span></div></button>{user.id !== currentUser?.id && <button className={user.isFollowing ? 'btn-secondary follow-button' : 'btn-primary follow-button'} disabled={pending !== null} aria-pressed={user.isFollowing} onClick={() => void follow(user)}>{user.isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}{pending === user.id ? 'Aguarde…' : user.isFollowing ? 'Seguindo' : 'Seguir'}</button>}</div>)}</div></div>}
    {visiblePosts && clean && matchedPosts.length > 0 && <div><div className="section-heading"><h2>Relatos encontrados</h2><span>{matchedPosts.length}</span></div><div className="post-list">{matchedPosts.map(post => <PostCard key={post.id} post={post} />)}</div></div>}
    {(empty || (!clean && filter === 'posts')) && <div className="empty-state"><Search size={32} /><h3>{!clean ? 'Encontre uma experiência' : 'Ainda não encontramos por aqui'}</h3><p>{!clean ? 'Digite um local, uma comida ou uma palavra do relato para começar.' : 'Tente outro termo ou mude o filtro da busca.'}</p>{clean && <button className="btn-secondary" onClick={() => { setQuery(''); setFilter('all'); }}>Limpar filtros</button>}</div>}
  </section>;
}
function CompassIllustration() { return <div className="discovery-icon"><Users size={28} /></div>; }
