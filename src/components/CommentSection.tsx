import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Post } from '../mockData';
import { Star, ThumbsUp, ThumbsDown, Send } from 'lucide-react';

interface CommentSectionProps {
  post: Post;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ post }) => {
  const { addComment, setSelectedUser, setActiveTab } = useApp();
  const [content, setContent] = useState('');
  const [hasRating, setHasRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [verdict, setVerdict] = useState<'Gostei' | 'Não gostei'>('Gostei');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addComment(
      post.id,
      content,
      hasRating ? rating : undefined,
      hasRating ? verdict : undefined
    );

    setContent('');
    setHasRating(false);
    setRating(5);
    setVerdict('Gostei');
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setActiveTab('profile');
  };

  return (
    <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] space-y-4">
      {/* Comments List */}
      {post.comments.length > 0 ? (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {post.comments.map((comment, idx) => (
            <div
              key={comment.id}
              className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs animate-slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex justify-between items-start mb-2">
                <button
                  onClick={() => handleUserClick(comment.user)}
                  className="flex items-center gap-2 hover:opacity-85 text-left group"
                >
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.displayName}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-[var(--clr-primary)]/20"
                  />
                  <div>
                    <h5 className="font-bold text-[var(--text-primary)] leading-tight group-hover:text-[var(--clr-primary)] transition-colors">
                      {comment.user.displayName}
                    </h5>
                    <p className="text-[9px] text-[var(--text-muted)]">@{comment.user.username}</p>
                  </div>
                </button>

                {/* Optional Comment Rating */}
                {comment.rating !== undefined && (
                  <div className="flex items-center gap-1.5 chip chip-amber">
                    <div className="flex">
                      {Array.from({ length: comment.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 fill-current text-[var(--clr-primary)]" />
                      ))}
                    </div>
                    {comment.verdict && (
                      <span className={`text-[9px] font-bold ${
                        comment.verdict === 'Gostei' ? 'text-[var(--clr-success)]' : 'text-[var(--clr-danger)]'
                      }`}>
                        {comment.verdict === 'Gostei' ? 'Gostou' : 'Não Gostou'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <p className="text-[var(--text-secondary)] leading-relaxed font-normal">
                {comment.content}
              </p>
              <span className="block mt-1.5 text-[8px] text-[var(--text-muted)] text-right">
                {new Date(comment.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--text-muted)] text-center py-4">Nenhum comentário. Seja o primeiro a opinar!</p>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Toggle Option to Rate the Location */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setHasRating(!hasRating)}
            className={`text-[10px] font-bold py-1.5 px-3 rounded-xl border transition-all duration-300 ${
              hasRating
                ? 'bg-[var(--clr-primary)]/15 border-[var(--clr-primary)] text-[var(--clr-primary)]'
                : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            {hasRating ? '✓ Adicionando Nota' : '+ Dar sua nota a este local'}
          </button>
        </div>

        {/* Rating selectors if enabled */}
        {hasRating && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--clr-primary)]/5 border border-[var(--clr-primary)]/10 animate-slide-down">
            {/* Stars */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-0.5 active:scale-90 transition-transform"
                >
                  <Star
                    className={`w-4 h-4 transition-colors ${
                      star <= rating ? 'fill-[var(--clr-primary)] text-[var(--clr-primary)]' : 'text-[var(--text-muted)]'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Verdict */}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setVerdict('Gostei')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-xl border text-[10px] font-bold transition-all duration-300 ${
                  verdict === 'Gostei'
                    ? 'bg-[var(--clr-success)]/15 border-[var(--clr-success)] text-[var(--clr-success)]'
                    : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
                Gostei
              </button>
              <button
                type="button"
                onClick={() => setVerdict('Não gostei')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-xl border text-[10px] font-bold transition-all duration-300 ${
                  verdict === 'Não gostei'
                    ? 'bg-[var(--clr-danger)]/15 border-[var(--clr-danger)] text-[var(--clr-danger)]'
                    : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <ThumbsDown className="w-3 h-3" />
                Não
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            required
            placeholder={hasRating ? "Opine sobre o local..." : "Escreva um comentário..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="p-2.5 btn-primary rounded-xl flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all duration-150"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
