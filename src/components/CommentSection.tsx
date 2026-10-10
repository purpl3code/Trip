import { useState } from 'react';
import { useApp } from '../context/appState';
import type { Post } from '../mockData';
import { Star, Send, LoaderCircle } from 'lucide-react';
import { errorMessage } from '../utils/errors';

export function CommentSection({ post }: { post: Post }) {
  const { addComment, setSelectedUser, setActiveTab } = useApp();
  const [content, setContent] = useState('');
  const [hasRating, setHasRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [verdict, setVerdict] = useState<'Gostei' | 'Não gostei'>('Gostei');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true); setError('');
    try {
      await addComment(post.id, content.trim(), hasRating ? rating : undefined, hasRating ? verdict : undefined);
      setContent(''); setHasRating(false); setRating(5); setVerdict('Gostei');
    } catch (err) { setError(errorMessage(err)); } finally { setSubmitting(false); }
  };
  return <section className="comments-section" aria-label="Conversa sobre o relato">
    <h4>Sobre essa descoberta</h4>
    <div className="comments-list">{post.comments.map(comment => <article className="comment" key={comment.id}><header><button onClick={() => { setSelectedUser(comment.user); setActiveTab('profile'); }}><img src={comment.user.avatar} alt="" /><div><strong>{comment.user.displayName}</strong><span>@{comment.user.username}</span></div></button>{comment.rating !== undefined && <span className="rating-badge"><Star size={12} fill="currentColor" />{comment.rating}</span>}</header><p>{comment.content}</p><time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</time></article>)}</div>
    {!post.comments.length && <p className="muted">Essa conversa pode começar com você.</p>}
    <form onSubmit={submit}>
      <button type="button" className="text-button" aria-pressed={hasRating} disabled={submitting} onClick={() => setHasRating(!hasRating)}>{hasRating ? 'Remover minha avaliação' : '+ Também quero avaliar o local'}</button>
      {hasRating && <div className="comment-rating"><div className="star-picker" aria-label="Sua avaliação">{[1,2,3,4,5].map(star => <button type="button" key={star} disabled={submitting} aria-label={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`} aria-pressed={rating === star} onClick={() => setRating(star)}><Star size={21} fill={star <= rating ? 'currentColor' : 'none'} /></button>)}</div><select aria-label="Veredito da avaliação" disabled={submitting} value={verdict} onChange={event => setVerdict(event.target.value as typeof verdict)}><option>Gostei</option><option>Não gostei</option></select></div>}
      <div className="comment-input"><textarea aria-label="Seu comentário" placeholder="Compartilhe sua opinião…" required maxLength={2000} rows={2} value={content} disabled={submitting} onChange={event => setContent(event.target.value)} /><button className="btn-primary" type="submit" aria-label="Enviar comentário" disabled={submitting || !content.trim()}>{submitting ? <LoaderCircle size={19} className="animate-spin" /> : <Send size={19} />}</button></div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  </section>;
}
