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
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
      {/* Comments List */}
      {post.comments.length > 0 ? (
        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
          {post.comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3.5 rounded-2xl bg-white/20 dark:bg-white/5 border border-white/25 dark:border-white/5 text-xs text-gray-800 dark:text-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <button
                  onClick={() => handleUserClick(comment.user)}
                  className="flex items-center gap-2 hover:opacity-85 text-left"
                >
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.displayName}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/20"
                  />
                  <div>
                    <h5 className="font-bold text-gray-800 dark:text-white leading-tight">
                      {comment.user.displayName}
                    </h5>
                    <p className="text-[9px] text-gray-400">@{comment.user.username}</p>
                  </div>
                </button>

                {/* Optional Comment Rating */}
                {comment.rating !== undefined && (
                  <div className="flex items-center gap-1.5 bg-indigo-500/10 dark:bg-indigo-500/5 px-2 py-1 rounded-lg border border-indigo-500/20">
                    <div className="flex text-amber-400">
                      {Array.from({ length: comment.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    {comment.verdict && (
                      <span
                        className={`text-[9px] font-bold ${
                          comment.verdict === 'Gostei' ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {comment.verdict === 'Gostei' ? 'Gostou' : 'Não Gostou'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                {comment.content}
              </p>
              <span className="block mt-1.5 text-[8px] text-gray-400 text-right">
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
        <p className="text-xs text-gray-400 text-center py-4">Nenhum comentário. Seja o primeiro a opinar!</p>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Toggle Option to Rate the Location */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setHasRating(!hasRating)}
            className={`text-[10px] font-bold py-1 px-2.5 rounded-lg border transition-all ${
              hasRating
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-500'
                : 'border-white/20 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:bg-white/20'
            }`}
          >
            {hasRating ? '✓ Adicionando Nota' : '+ Dar sua nota a este local'}
          </button>
        </div>

        {/* Rating selectors if enabled */}
        {hasRating && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 animate-in slide-in-from-top-1 duration-200">
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
                    className={`w-4 h-4 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'
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
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border text-[10px] font-bold transition-all ${
                  verdict === 'Gostei'
                    ? 'bg-emerald-500/25 border-emerald-500 text-emerald-500'
                    : 'border-white/10 text-gray-500 hover:bg-white/10'
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
                Gostei
              </button>
              <button
                type="button"
                onClick={() => setVerdict('Não gostei')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border text-[10px] font-bold transition-all ${
                  verdict === 'Não gostei'
                    ? 'bg-rose-500/25 border-rose-500 text-rose-500'
                    : 'border-white/10 text-gray-500 hover:bg-white/10'
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
            className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="p-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors active:scale-95 duration-150"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
