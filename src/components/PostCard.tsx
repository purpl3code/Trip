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

  const handleDelete = async () => {
    if (window.confirm('Tem certeza de que deseja excluir este relato?')) {
      await deletePost(post.id);
    }
  };

  const handleUserClick = () => {
    setSelectedUser(post.user);
    setActiveTab('profile');
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
    <article className="glass-card rounded-3xl p-5 md:p-6 mb-5 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:translate-y-[-2px]">
      
      {/* Header Info */}
      <div className="flex items-start justify-between mb-4">
        <button
          onClick={handleUserClick}
          className="flex items-center gap-3 hover:opacity-85 text-left transition-opacity"
        >
          <img
            src={post.user.avatar}
            alt={post.user.displayName}
            className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/20"
          />
          <div>
            <h3 className="font-extrabold text-sm text-gray-800 dark:text-white leading-tight">
              {post.user.displayName}
            </h3>
            <p className="text-xs text-gray-400">@{post.user.username}</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-gray-400">
            {formatDate(post.createdAt)}
          </span>
          {currentUser && currentUser.id === post.user.id && (
            <button
              onClick={handleDelete}
              className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Excluir relato"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Location Bar with Crowd-Sourced Ratings */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 mb-4 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10">
        <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 font-bold text-xs">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>{post.location}</span>
        </div>

        {/* Dynamic Ratings Summary */}
        <div className="flex items-center gap-2">
          {/* Average Stars */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 text-xs text-amber-500 font-black">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{avgRating}</span>
          </div>

          {/* Verdict and review count */}
          <span className="text-[10px] text-gray-400 font-semibold">
            ({reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'})
          </span>

          {/* Verdict Pill */}
          <span
            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1 ${
              post.verdict === 'Gostei'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
            }`}
          >
            {post.verdict === 'Gostei' ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
            {post.verdict}
          </span>
        </div>
      </div>

      {/* Post Text */}
      <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed mb-4 font-normal whitespace-pre-line">
        {post.content}
      </p>

      {/* Photo Showcase */}
      {post.photos && post.photos.length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-inner border border-white/10 group cursor-zoom-in">
            <img
              src={post.photos[activePhotoIdx]}
              alt={`Trip photo ${activePhotoIdx + 1}`}
              className="w-full h-full object-cover transition-all duration-500 hover:scale-[1.03]"
              onClick={() => setIsZoomed(true)}
            />
            {/* Multiple Photos indicator/dots */}
            {post.photos.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-[2]">
                {post.photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === activePhotoIdx ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Small Thumbnails strip */}
          {post.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {post.photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === activePhotoIdx ? 'border-indigo-500 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
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
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-3 text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-6">
          {/* Like Button */}
          <button
            onClick={() => toggleLike(post.id)}
            className={`flex items-center gap-2 hover:text-rose-500 transition-colors group ${
              post.isLiked ? 'text-rose-500 font-bold' : ''
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform group-active:scale-125 ${
                post.isLiked ? 'fill-rose-500 text-rose-500' : 'group-hover:scale-110'
              }`}
            />
            <span className="text-xs">{post.likesCount}</span>
          </button>

          {/* Toggle Comments Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 hover:text-indigo-500 transition-colors ${
              showComments ? 'text-indigo-500 font-bold' : ''
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs">{post.comments.length}</span>
          </button>
        </div>

        {/* Details Dropdown Indicator */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-xs flex items-center gap-1 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
        >
          <span>{showComments ? 'Ocultar Resenhas' : 'Ver Resenhas'}</span>
          {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable comments thread */}
      {showComments && <CommentSection post={post} />}

      {/* Lightbox Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          <button 
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
            onClick={() => setIsZoomed(false)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <img
            src={post.photos[activePhotoIdx]}
            alt="Expanded trip"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl animate-in zoom-in-95 duration-200"
          />
        </div>
      )}
    </article>
  );
};
