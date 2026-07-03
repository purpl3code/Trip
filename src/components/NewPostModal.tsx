import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Star, MapPin, ThumbsUp, ThumbsDown, Image as ImageIcon, Link as LinkIcon, Upload } from 'lucide-react';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Preset images for easy mock testing
const PRESET_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=400&q=80', label: 'Montanhas' },
  { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80', label: 'Floresta' },
  { url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80', label: 'Paris' },
  { url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80', label: 'Tóquio' },
  { url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80', label: 'Ramen' },
  { url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=400&q=80', label: 'Cafeteria' },
];

export const NewPostModal: React.FC<NewPostModalProps> = ({ isOpen, onClose }) => {
  const { addPost } = useApp();
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [verdict, setVerdict] = useState<'Gostei' | 'Não gostei'>('Gostei');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !location.trim()) return;

    setIsSubmitting(true);
    try {
      await addPost(content, location, rating, verdict, selectedPhotos, photoFiles);
      
      // Reset form
      setContent('');
      setLocation('');
      setRating(5);
      setVerdict('Gostei');
      setSelectedPhotos([]);
      setPhotoFiles([]);
      setCustomPhotoUrl('');
      setShowCustomInput(false);
      onClose();
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePresetImage = (url: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(url) ? prev.filter((p) => p !== url) : [...prev, url]
    );
  };

  const handleAddCustomPhoto = () => {
    if (customPhotoUrl.trim()) {
      setSelectedPhotos((prev) => [...prev, customPhotoUrl.trim()]);
      setCustomPhotoUrl('');
      setShowCustomInput(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setPhotoFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setSelectedPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setPhotoFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Card */}
      <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 dark:border-white/5">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Relatar Nova Experiência</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full hover:bg-white/20 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Location */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              Onde você esteve?
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder="Ex: Trattoria da Nonna, Roma ou Praia de Copacabana"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass-input focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-gray-800 dark:text-white transition-all placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
            />
          </div>

          {/* Rating & Verdict */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rating Stars */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Sua Avaliação (1 a 5 estrelas)
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform active:scale-90 disabled:opacity-50"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300 dark:text-gray-600 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Verdict */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Veredito Rápido
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setVerdict('Gostei')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-bold transition-all duration-300 ${
                    verdict === 'Gostei'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-md shadow-emerald-500/5'
                      : 'border-white/10 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-white/5'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Gostei
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setVerdict('Não gostei')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-bold transition-all duration-300 ${
                    verdict === 'Não gostei'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-500 shadow-md shadow-rose-500/5'
                      : 'border-white/10 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-white/5'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  Não Gostei
                </button>
              </div>
            </div>
          </div>

          {/* Description Content */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              O que achou da experiência?
            </label>
            <textarea
              required
              rows={3}
              disabled={isSubmitting}
              placeholder="Escreva um breve resumo da sua visita... Detalhes da comida, do ambiente ou de momentos marcantes!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass-input focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-gray-800 dark:text-white transition-all placeholder-gray-400 dark:placeholder-gray-500 resize-none disabled:opacity-50"
            />
          </div>

          {/* Photo Attachments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                Adicionar Fotos ({selectedPhotos.length + photoFiles.length})
              </label>
              
              <div className="flex items-center gap-3">
                {/* Upload Image File Button */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isSubmitting}
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="text-xs text-indigo-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </label>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="text-xs text-indigo-500 hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <LinkIcon className="w-3 h-3" />
                  Inserir Link
                </button>
              </div>
            </div>

            {/* Custom URL Input */}
            {showCustomInput && (
              <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                <input
                  type="url"
                  placeholder="Cole o link direto da imagem aqui..."
                  value={customPhotoUrl}
                  onChange={(e) => setCustomPhotoUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl glass-input focus:outline-none text-gray-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomPhoto}
                  className="px-3 py-2 bg-indigo-500 text-white rounded-xl text-xs font-bold hover:bg-indigo-600"
                >
                  Adicionar
                </button>
              </div>
            )}

            {/* Selection Grid for Preset Images */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                Toque nos presets abaixo para simular fotos da sua viagem:
              </p>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_IMAGES.map((img) => {
                  const isSelected = selectedPhotos.includes(img.url);
                  return (
                    <button
                      key={img.url}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => togglePresetImage(img.url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-indigo-500 scale-95 shadow-md shadow-indigo-500/25'
                          : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                      } disabled:opacity-50`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/10" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Display Attached Photos List (Presets and Files) */}
            {(selectedPhotos.length > 0 || photoFiles.length > 0) && (
              <div className="flex gap-2 overflow-x-auto py-1">
                {/* Render Presets */}
                {selectedPhotos.map((url, idx) => (
                  <div key={`preset-${idx}`} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/20 flex-shrink-0">
                    <img src={url} alt="Preset attached preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {/* Render Custom Files */}
                {photoFiles.map((file, idx) => {
                  const fileUrl = URL.createObjectURL(file);
                  return (
                    <div key={`file-${idx}`} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/20 flex-shrink-0">
                      <img src={fileUrl} alt="File attached preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleRemoveFile(idx)}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim() || !location.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  <span>Enviando relato...</span>
                </>
              ) : (
                <>
                  <span>Publicar Relato 🚀</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
