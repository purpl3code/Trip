import { useState } from 'react';
import { useApp } from '../context/appState';
import type { Post } from '../mockData';
import { Heart, MessageCircle, MapPin, ThumbsUp, ThumbsDown, Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { CommentSection } from './CommentSection';
import { PostDescription } from './PostDescription';
import { Dialog } from './Dialog';
import { RatingStar } from './RatingStar';
import { MediaImage } from './MediaImage';
import { averageRating, ratingValues } from '../utils/discovery';
import { errorMessage } from '../utils/errors';

export function PostCard({ post }: { post: Post }) {
  const { currentUser, toggleLike, deletePost, setSelectedUser, setActiveTab, setExpandedPhotoUrl, notify } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [liking, setLiking] = useState(false);
  const [likePulse, setLikePulse] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const ratings = ratingValues(post);
  const average = averageRating(ratings).toFixed(1);
  const date = new Date(post.createdAt);
  const formattedDate = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  const activeIndex = Math.min(photoIndex, Math.max(0, post.photos.length - 1));
  const like = async () => {
    if (liking) return;
    setLiking(true);
    setLikePulse(previous => post.isLiked ? 0 : previous + 1);
    try { await toggleLike(post.id); } catch (error) { setLikePulse(0); notify(errorMessage(error), 'error'); } finally { setLiking(false); }
  };
  const remove = async () => {
    setDeleting(true); setDeleteError('');
    try { await deletePost(post.id); setConfirmDelete(false); notify('Relato excluído.'); }
    catch (error) { setDeleteError(errorMessage(error)); }
    finally { setDeleting(false); }
  };
  return <article className={`post-card ${post.photos.length ? "has-photos" : ""}`}>
    <header className="post-header">
      <button className="post-author" onClick={() => { setSelectedUser(post.user); setActiveTab('profile'); }}><img src={post.user.avatar} alt="" /><div><strong>{post.user.displayName}</strong><span>@{post.user.username}</span></div></button>
      {currentUser?.id === post.user.id && <div className="post-meta"><button className="icon-button" aria-label="Excluir relato" onClick={() => setConfirmDelete(true)}><Trash2 size={17} /></button></div>}
    </header>
    {post.photos.length > 0 && <div className="post-photos">
      <div className="post-photo-frame">
        <button className="post-photo-open" aria-label={`Ampliar foto ${activeIndex + 1} de ${post.location}`} onClick={() => setExpandedPhotoUrl(post.photos[activeIndex])}><MediaImage src={post.photos[activeIndex]} alt={`Foto de ${post.location}`} loading="lazy" /></button>
        {post.photos.length > 1 && <><span className="photo-counter">{activeIndex + 1} / {post.photos.length}</span><button className="photo-arrow previous" aria-label="Foto anterior" onClick={() => setPhotoIndex((activeIndex + post.photos.length - 1) % post.photos.length)}><ChevronLeft size={21} /></button><button className="photo-arrow next" aria-label="Próxima foto" onClick={() => setPhotoIndex((activeIndex + 1) % post.photos.length)}><ChevronRight size={21} /></button></>}
      </div>
      {post.photos.length > 1 && <div className="photo-thumbnails">{post.photos.map((photo,index) => <button key={photo + index} aria-label={`Ver foto ${index + 1}`} aria-pressed={activeIndex === index} onClick={() => setPhotoIndex(index)}><MediaImage src={photo} alt="" loading="lazy" /></button>)}</div>}
    </div>}
    <div className="post-location"><div><MapPin size={16} /><h2>{post.location}</h2></div><span className="rating-badge" aria-label={`Nota média ${average} de 5`}><RatingStar size={16} />{average}</span></div>
    <div className="post-verdict"><span className={post.verdict === 'Gostei' ? 'verdict-positive' : 'verdict-negative'}>{post.verdict === 'Gostei' ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}{post.verdict}</span><span>{ratings.length} {ratings.length === 1 ? 'avaliação' : 'avaliações'}</span><time className="post-date" dateTime={post.createdAt} title={date.toLocaleString('pt-BR')}>Publicado em {formattedDate}</time></div>
    <PostDescription text={post.content} />
    <footer className="post-actions">
      <button disabled={liking} aria-busy={liking} aria-pressed={!!post.isLiked} aria-label={post.isLiked ? 'Descurtir relato' : 'Curtir relato'} className={post.isLiked ? 'post-like liked' : 'post-like'} onClick={() => void like()}><span key={likePulse} className={likePulse ? 'like-icon is-pulsing' : 'like-icon'} aria-hidden="true"><Heart size={19} fill={post.isLiked ? 'currentColor' : 'none'} /></span><span>{post.likesCount}</span></button>
      <button aria-expanded={showComments} aria-label="Comentários do relato" onClick={() => setShowComments(!showComments)}><MessageCircle size={19} /><span>{post.comments.length}</span></button>
      <button className="post-reviews" aria-expanded={showComments} onClick={() => setShowComments(!showComments)}>{showComments ? 'Fechar conversa' : 'Ver conversa'}{showComments ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
    </footer>
    {showComments && <CommentSection post={post} />}
    <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir este relato?" busy={deleting} className="confirm-dialog">
      <div className="dialog-content"><p>O relato e seus comentários serão removidos. Esta ação não pode ser desfeita.</p>{deleteError && <p className="form-error" role="alert">{deleteError}</p>}<div className="dialog-actions"><button className="btn-secondary" disabled={deleting} onClick={() => setConfirmDelete(false)}>Cancelar</button><button className="btn-danger" disabled={deleting} onClick={() => void remove()}>{deleting ? 'Excluindo…' : 'Excluir relato'}</button></div></div>
    </Dialog>
  </article>;
}
