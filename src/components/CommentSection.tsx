import { useId, useState } from 'react';
import { useApp } from '../context/appState';
import type { Post } from '../mockData';
import { Send, LoaderCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { RatingStar } from './RatingStar';
import { StarRating } from './StarRating';
import { errorMessage } from '../utils/errors';

export function CommentSection({ post }: { post: Post }) {
  const { addComment, setSelectedUser, setActiveTab } = useApp();
  const commentId = useId();
  const hintId = useId();
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
    <div className="comments-list">{post.comments.map(comment => <article className="comment" key={comment.id}><header><button onClick={() => { setSelectedUser(comment.user); setActiveTab('profile'); }}><img src={comment.user.avatar} alt="" /><div><strong>{comment.user.displayName}</strong><span>@{comment.user.username}</span></div></button>{comment.rating !== undefined && <span className="rating-badge"><RatingStar size={14} />{comment.rating}</span>}</header><p>{comment.content}</p><time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</time></article>)}</div>
    <form className="comment-form" onSubmit={submit} aria-busy={submitting}>
      <div className="comment-form-heading">
        <label className="comment-label" htmlFor={commentId}>Seu comentário</label>
        <button type="button" className="text-button" aria-pressed={hasRating} disabled={submitting} onClick={() => setHasRating(value => !value)}>{hasRating ? 'Remover avaliação' : '+ Avaliar o local'}</button>
      </div>
      {hasRating && <fieldset className="comment-rating">
        <legend>Sua avaliação do local</legend>
        <StarRating value={rating} onChange={setRating} disabled={submitting} label="Sua nota" />
        <div className="verdict-picker">
          <button type="button" disabled={submitting} aria-pressed={verdict === 'Gostei'} onClick={() => setVerdict('Gostei')}><ThumbsUp size={17} aria-hidden="true" />Gostei</button>
          <button type="button" disabled={submitting} aria-pressed={verdict === 'Não gostei'} onClick={() => setVerdict('Não gostei')}><ThumbsDown size={17} aria-hidden="true" />Não gostei</button>
        </div>
      </fieldset>}
      <div className="comment-input"><textarea id={commentId} name="comment" aria-describedby={hintId} placeholder="Compartilhe sua opinião…" required maxLength={2000} rows={3} value={content} disabled={submitting} onChange={event => setContent(event.target.value)} /></div>
      <div className="comment-submit-row">
        <span id={hintId} className="field-hint comment-character-count">{content.length}/2000 caracteres</span>
        <button className="btn-primary" type="submit" aria-label="Enviar comentário" disabled={submitting || !content.trim()}>{submitting ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} aria-hidden="true" />}{submitting ? 'Enviando…' : 'Enviar'}</button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  </section>;
}
