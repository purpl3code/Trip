import { useState } from 'react';
import { useApp } from '../context/appState';
import type { User } from '../mockData';
import { Star, MapPin, Grid2X2, UserPlus, UserCheck, LogOut, Pencil, BookOpen, ArrowLeft, Plus, ArrowUpRight } from 'lucide-react';
import { PostCard } from './PostCard';
import { groupLocations, normalizeSearch } from '../utils/discovery';
import { errorMessage } from '../utils/errors';

export function UserProfile({ user, onNewPost }: { user: User; onNewPost: () => void }) {
  const { posts, currentUser, toggleFollow, handleSignOut, setIsEditProfileOpen, setExpandedPhotoUrl, setActiveTab, notify } = useApp();
  const [tab, setTab] = useState<'posts' | 'locations' | 'photos'>('posts');
  const [pending, setPending] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const own = user.id === currentUser?.id;
  const userPosts = posts.filter(post => post.user.id === user.id);
  const photos = userPosts.flatMap(post => post.photos.map(photo => ({ photo, location: post.location })));
  const locations = groupLocations(userPosts);
  const filteredPosts = selectedLocation ? userPosts.filter(post => normalizeSearch(post.location) === selectedLocation) : userPosts;
  const follow = async () => {
    setPending(true);
    try { await toggleFollow(user.id); } catch (error) { notify(errorMessage(error), 'error'); } finally { setPending(false); }
  };
  return <section className="profile-page">
    <button className="back-link" onClick={() => setActiveTab('feed')}><ArrowLeft size={17} /> Voltar a explorar</button>
    <div className="profile-card">
      <div className="profile-cover"><img src={user.banner} alt={`Capa do diário de ${user.displayName}`} /></div>
      <div className="profile-details">
        <div className="profile-avatar-row"><img className="profile-avatar" src={user.avatar} alt={user.displayName} /><div className="profile-buttons">{own ? <><button className="btn-secondary" onClick={() => setIsEditProfileOpen(true)}><Pencil size={16} /> Editar perfil</button><button className="icon-button" aria-label="Sair da conta" onClick={() => void handleSignOut()}><LogOut size={18} /></button></> : <button className={user.isFollowing ? 'btn-secondary' : 'btn-primary'} disabled={pending} aria-pressed={user.isFollowing} onClick={() => void follow()}>{user.isFollowing ? <UserCheck size={17} /> : <UserPlus size={17} />}{pending ? 'Aguarde…' : user.isFollowing ? 'Seguindo' : 'Seguir diário'}</button>}</div></div>
        <h1>{user.displayName}</h1><p className="profile-handle">@{user.username}</p>{user.bio && <p className="profile-bio">{user.bio}</p>}
        <div className="profile-stats"><div><strong>{userPosts.length}</strong><span>Relatos</span></div><div><strong>{locations.length}</strong><span>Lugares</span></div><div><strong>{user.followersCount}</strong><span>Seguidores</span></div><div><strong>{user.followingCount}</strong><span>Seguindo</span></div></div>
      </div>
    </div>
    <div className="segmented-control profile-tabs" aria-label="Conteúdo do diário">{([['posts','Relatos',BookOpen],['locations','Lugares',MapPin],['photos','Fotos',Grid2X2]] as const).map(([id,label,Icon]) => <button key={id} aria-pressed={tab === id} onClick={() => { setTab(id); setSelectedLocation(null); }}><Icon size={17} />{label}</button>)}</div>
    {tab === 'posts' && <>{selectedLocation && <div className="location-filter"><span><MapPin size={16} />{locations.find(location => normalizeSearch(location.name) === selectedLocation)?.name}</span><button className="text-button" onClick={() => setSelectedLocation(null)}>Ver todos os relatos</button></div>}<div className="post-list">{filteredPosts.map(post => <PostCard key={post.id} post={post} />)}</div></>}
    {tab === 'locations' && <div className="location-grid">{locations.map(location => <button key={location.name} className="location-card" onClick={() => { setSelectedLocation(normalizeSearch(location.name)); setTab('posts'); }}><div className="location-card-icon"><MapPin size={21} /></div><div><h3>{location.name}</h3><p>{location.posts.length} {location.posts.length === 1 ? 'visita' : 'visitas'} · <Star size={12} fill="currentColor" />{location.rating.toFixed(1)}</p></div><ArrowUpRight size={18} /></button>)}</div>}
    {tab === 'photos' && <div className="profile-gallery">{photos.map(({photo,location},index) => <button key={photo+index} aria-label={`Ampliar foto de ${location}`} onClick={() => setExpandedPhotoUrl(photo)}><img src={photo} alt={`Foto de ${location}`} loading="lazy" /><span>{location}</span></button>)}</div>}
    {((tab === 'posts' && !userPosts.length) || (tab === 'locations' && !locations.length) || (tab === 'photos' && !photos.length)) && <div className="empty-state"><BookOpen size={32} /><h2>{own ? 'Seu diário está esperando a primeira história' : 'Novas histórias estão por vir'}</h2><p>{own ? 'Compartilhe um lugar ou sabor que marcou seu dia. Suas descobertas vão aparecer aqui.' : 'Este diário ainda não tem conteúdo nesta seção.'}</p>{own && <button className="btn-primary" onClick={onNewPost}><Plus size={18} />Criar meu primeiro relato</button>}</div>}
  </section>;
}
