import React, { useState } from 'react';
import type { Post } from '../mockData';
import { useApp } from '../context/AppContext';
import { CommentSection } from './CommentSection';
import { Star, MapPin, Heart, MessageSquare, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { toggleLike, setSelectedUser, setActiveTab, currentUser, deletePost } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleUserClick = () => {
    setSelectedUser(post.user);
    setActiveTab('profile');
  };

  const handleLike = () => {
    setIsLikeAnimating(true);
    toggleLike(post.id);
    setTimeout(() => setIsLikeAnimating(false), 500);
  };

  // Calculate local average rating from author's rating + all comment ratings
  const ratings = [
    post.rating,
    ...post.comments
      .filter((c) => c.rating !== undefined)
      .map((c) => c.rating as number),
  ];
  
  const avgRating = (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1);
  const reviewCount = ratings.length;

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <article className="glass-card rounded-3xl p-5 md:p-6 transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]">
      
      {/* Header Info */}
      <div className="flex items-start justify-between mb-4">
        <button
          onClick={handleUserClick}
          className="flex items-center gap-3 hover:opacity-85 text-left transition-opacity group"
        >
          <div className="avatar-ring flex-shrink-0">
            <img
              src={post.user.avatar}
              alt={post.user.displayName}
              className="w-10 h-10 object-cover"
            />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[var(--text-primary)] leading-tight group-hover:text-[var(--clr-primary)] transition-colors">
              {post.user.displayName}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">@{post.user.username}</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-[var(--text-muted)]">
            {formatDate(post.createdAt)}
          </span>
          {currentUser && currentUser.id === post.user.id && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-xl text-[var(--clr-danger)] hover:bg-[var(--clr-danger)]/10 transition-colors"
              title="Excluir relato"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Location Bar with Crowd-Sourced Ratings */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 mb-4 rounded-2xl bg-[var(--clr-teal)]/5 border border-[var(--clr-teal)]/10">
        <div className="flex items-center gap-2 text-[var(--clr-teal)] font-bold text-xs">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>{post.location}</span>
        </div>

        {/* Dynamic Ratings Summary */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Average Stars */}
          <div className="chip chip-amber">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-black">{avgRating}</span>
          </div>

          {/* Verdict and review count */}
          <span className="text-[10px] text-[var(--text-muted)] font-semibold">
            ({reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'})
          </span>

          {/* Verdict Pill */}
          <span className={`chip ${
            post.verdict === 'Gostei' ? 'chip-success' : 'chip-danger'
          }`}>
            {post.verdict === 'Gostei' ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
            {post.verdict}
          </span>
        </div>
      </div>

      {/* Post Text */}
      <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4 font-normal whitespace-pre-line">
        {post.content}
      </p>

      {/* Photo Showcase */}
      {post.photos && post.photos.length > 0 && (
        <div className="mb-4 space-y-2.5">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-inner border border-[var(--border-subtle)] group cursor-zoom-in">
            <img
              src={post.photos[activePhotoIdx]}
              alt={`Trip photo ${activePhotoIdx + 1}`}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
              onClick={() => setIsZoomed(true)}
            />
            {/* Photo overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            {/* Multiple Photos indicator/dots */}
            {post.photos.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-[2]">
                {post.photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setActivePhotoIdx(idx); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activePhotoIdx ? 'bg-white w-5 shadow-md' : 'bg-white/50 w-1.5 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Small Thumbnails strip */}
          {post.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {post.photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === activePhotoIdx 
                      ? 'border-[var(--clr-primary)] scale-95 shadow-md' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions Row */}
      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-[var(--text-muted)]">
        <div className="flex items-center gap-6">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors group ${
              post.isLiked ? 'text-[var(--clr-danger)] font-bold' : 'hover:text-[var(--clr-danger)]'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                isLikeAnimating ? 'animate-heartbeat' : ''
              } ${
                post.isLiked ? 'fill-[var(--clr-danger)] text-[var(--clr-danger)]' : 'group-hover:scale-110'
              }`}
            />
            <span className="text-xs">{post.likesCount}</span>
          </button>

          {/* Toggle Comments Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 transition-colors ${
              showComments ? 'text-[var(--clr-primary)] font-bold' : 'hover:text-[var(--clr-primary)]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs">{post.comments.length}</span>
          </button>
        </div>

        {/* Details Dropdown Indicator */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-xs flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <span>{showComments ? 'Ocultar Resenhas' : 'Ver Resenhas'}</span>
          {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable comments thread */}
      {showComments && (
        <div className="animate-slide-up">
          <CommentSection post={post} />
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <button 
            className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all z-10"
            onClick={() => setIsZoomed(false)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <img
            src={post.photos[activePhotoIdx]}
            alt="Expanded trip"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl animate-scale-in"
          />
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card-elevated max-w-sm w-full p-6 rounded-3xl border border-[var(--border-subtle)] space-y-6 text-center shadow-2xl animate-scale-in">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--clr-danger)]/10 border border-[var(--clr-danger)]/20 flex items-center justify-center text-[var(--clr-danger)]">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-black text-[var(--text-primary)]">Excluir Relato</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Tem certeza de que deseja excluir este relato? Esta ação não pode ser desfeita e removerá permanentemente fotos, resenhas e comentários associados.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 px-4 py-3 rounded-2xl text-xs font-bold text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] transition-colors focus:outline-none"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setIsDeleteConfirmOpen(false);
                  await deletePost(post.id);
                }}
                className="flex-1 px-4 py-3 rounded-2xl text-xs font-bold bg-[var(--clr-danger)] text-white hover:opacity-90 shadow-md shadow-[var(--clr-danger)]/20 transition-all focus:outline-none"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
