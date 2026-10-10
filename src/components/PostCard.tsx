import { useState } from 'react';
import { useApp } from '../context/appState';
import type { Post } from '../mockData';
import { Heart, MessageCircle, MapPin, Star, ThumbsUp, ThumbsDown, Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { CommentSection } from './CommentSection';
import { Dialog } from './Dialog';
import { averageRating, ratingValues } from '../utils/discovery';
import { errorMessage } from '../utils/errors';

export function PostCard({ post }: { post: Post }) {
  const { currentUser, toggleLike, deletePost, setSelectedUser, setActiveTab, setExpandedPhotoUrl, notify } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const ratings = ratingValues(post);
  const average = averageRating(ratings).toFixed(1);
  const date = new Date(post.createdAt);
  const formattedDate = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  const activeIndex = Math.min(photoIndex, Math.max(0, post.photos.length - 1));
  const longContent = post.content.length > 350;
  const content = longContent && !expanded ? post.content.slice(0, 350).trimEnd() + '…' : post.content;
  const like = async () => {
    if (liking) return;
    setLiking(true);
    try { await toggleLike(post.id); } catch (error) { notify(errorMessage(error), 'error'); } finally { setLiking(false); }
  };
  const remove = async () => {
    setDeleting(true); setDeleteError('');
    try { await deletePost(post.id); setConfirmDelete(false); notify('Relato excluído.'); }
    catch (error) { setDeleteError(errorMessage(error)); }
    finally { setDeleting(false); }
  };
  return <article className="post-card">
    <header className="post-header">
      <button className="post-author" onClick={() => { setSelectedUser(post.user); setActiveTab('profile'); }}><img src={post.user.avatar} alt="" /><div><strong>{post.user.displayName}</strong><span>@{post.user.username}</span></div></button>
      <div className="post-meta"><time dateTime={post.createdAt} title={date.toLocaleString('pt-BR')}>{formattedDate}</time>{currentUser?.id === post.user.id && <button className="icon-button" aria-label="Excluir relato" onClick={() => setConfirmDelete(true)}><Trash2 size={17} /></button>}</div>
    </header>
    <div className="post-location"><div><MapPin size={16} /><h3>{post.location}</h3></div><span className="rating-badge" aria-label={`Nota média ${average} de 5`}><Star size={14} fill="currentColor" />{average}</span></div>
    <div className="post-verdict"><span className={post.verdict === 'Gostei' ? 'verdict-positive' : 'verdict-negative'}>{post.verdict === 'Gostei' ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}{post.verdict}</span><span>{ratings.length} {ratings.length === 1 ? 'avaliação' : 'avaliações'}</span></div>
    <p className="post-content">{content}</p>
    {longContent && <button className="text-button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Ler menos' : 'Continuar lendo'}</button>}
    {post.photos.length > 0 && <div className="post-photos">
      <div className="post-photo-frame">
        <button className="post-photo-open" aria-label={`Ampliar foto ${activeIndex + 1} de ${post.location}`} onClick={() => setExpandedPhotoUrl(post.photos[activeIndex])}><img src={post.photos[activeIndex]} alt={`Foto de ${post.location}`} loading="lazy" /></button>
        {post.photos.length > 1 && <><span className="photo-counter">{activeIndex + 1} / {post.photos.length}</span><button className="photo-arrow previous" aria-label="Foto anterior" onClick={() => setPhotoIndex((activeIndex + post.photos.length - 1) % post.photos.length)}><ChevronLeft size={21} /></button><button className="photo-arrow next" aria-label="Próxima foto" onClick={() => setPhotoIndex((activeIndex + 1) % post.photos.length)}><ChevronRight size={21} /></button></>}
      </div>
      {post.photos.length > 1 && <div className="photo-thumbnails">{post.photos.map((photo,index) => <button key={photo + index} aria-label={`Ver foto ${index + 1}`} aria-pressed={activeIndex === index} onClick={() => setPhotoIndex(index)}><img src={photo} alt="" loading="lazy" /></button>)}</div>}
    </div>}
    <footer className="post-actions">
      <button disabled={liking} aria-pressed={!!post.isLiked} aria-label={post.isLiked ? 'Descurtir relato' : 'Curtir relato'} className={post.isLiked ? 'liked' : ''} onClick={() => void like()}><Heart size={19} fill={post.isLiked ? 'currentColor' : 'none'} /><span>{post.likesCount}</span></button>
      <button aria-expanded={showComments} aria-label="Comentários do relato" onClick={() => setShowComments(!showComments)}><MessageCircle size={19} /><span>{post.comments.length}</span></button>
      <button className="post-reviews" aria-expanded={showComments} onClick={() => setShowComments(!showComments)}>{showComments ? 'Fechar conversa' : 'Ver conversa'}{showComments ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
    </footer>
    {showComments && <CommentSection post={post} />}
    <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Excluir este relato?" busy={deleting} className="confirm-dialog">
      <div className="dialog-content"><p>O relato e seus comentários serão removidos. Esta ação não pode ser desfeita.</p>{deleteError && <p className="form-error" role="alert">{deleteError}</p>}<div className="dialog-actions"><button className="btn-secondary" disabled={deleting} onClick={() => setConfirmDelete(false)}>Cancelar</button><button className="btn-danger" disabled={deleting} onClick={() => void remove()}>{deleting ? 'Excluindo…' : 'Excluir relato'}</button></div></div>
    </Dialog>
  </article>;
}
