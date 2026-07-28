import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Star, MapPin, ThumbsUp, ThumbsDown, Image as ImageIcon, Upload, Sparkles } from 'lucide-react';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPostModal: React.FC<NewPostModalProps> = ({ isOpen, onClose }) => {
  const { addPost } = useApp();
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [verdict, setVerdict] = useState<'Gostei' | 'Não gostei'>('Gostei');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for Image Cropping
  const [croppingIdx, setCroppingIdx] = useState<number | null>(null);
  const [cropOffset, setCropOffset] = useState(0.5);
  const [imgIsLandscape, setImgIsLandscape] = useState(true);
  const [croppingImgUrl, setCroppingImgUrl] = useState<string | null>(null);

  const croppingFile = croppingIdx !== null ? photoFiles[croppingIdx] : null;

  useEffect(() => {
    if (croppingFile) {
      const url = URL.createObjectURL(croppingFile);
      setCroppingImgUrl(url);
      setCropOffset(0.5);
      return () => URL.revokeObjectURL(url);
    } else {
      setCroppingImgUrl(null);
    }
  }, [croppingFile]);

  useEffect(() => {
    if (croppingImgUrl) {
      const img = new Image();
      img.src = croppingImgUrl;
      img.onload = () => {
        setImgIsLandscape(img.width > img.height);
      };
    }
  }, [croppingImgUrl]);

  const applyCrop = () => {
    if (croppingIdx === null || !croppingFile) return;

    const img = new Image();
    img.src = URL.createObjectURL(croppingFile);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let sx = 0;
      let sy = 0;

      if (img.width > img.height) {
        const maxOffset = img.width - img.height;
        sx = maxOffset * cropOffset;
      } else {
        const maxOffset = img.height - img.width;
        sy = maxOffset * cropOffset;
      }

      ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], croppingFile.name, {
            type: 'image/png',
            lastModified: Date.now(),
          });
          setPhotoFiles((prev) => {
            const updated = [...prev];
            updated[croppingIdx] = croppedFile;
            return updated;
          });
          setCroppingIdx(null);
        }
      }, 'image/png');
    };
  };

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
      await addPost(content, location, rating, verdict, [], photoFiles);
      
      // Reset form
      setContent('');
      setLocation('');
      setRating(5);
      setVerdict('Gostei');
      setPhotoFiles([]);
      onClose();
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setPhotoFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setPhotoFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
      {/* Modal Card */}
      <div className="glass-panel w-full max-w-lg md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden animate-modal flex flex-col max-h-[90vh]">
        
        {croppingIdx !== null ? (
          /* Cropper View */
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Recortar Imagem</h2>
              <button
                type="button"
                onClick={() => setCroppingIdx(null)}
                className="p-1.5 rounded-xl hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 flex flex-col justify-center items-center space-y-6 overflow-y-auto">
              <div 
                className="w-64 h-64 rounded-2xl border-2 border-[var(--clr-primary)] shadow-2xl overflow-hidden relative"
                style={{
                  backgroundImage: `url(${croppingImgUrl})`,
                  backgroundPosition: imgIsLandscape ? `${cropOffset * 100}% center` : `center ${cropOffset * 100}%`,
                  backgroundSize: imgIsLandscape ? 'auto 100%' : '100% auto',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: 'var(--bg-subtle)'
                }}
              />

              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-xs font-bold text-[var(--text-muted)]">
                  <span>Ajustar área de corte (1:1)</span>
                  <span>{(cropOffset * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={cropOffset} 
                  onChange={(e) => setCropOffset(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[var(--clr-primary)]"
                  style={{ background: `linear-gradient(to right, var(--clr-primary) ${cropOffset * 100}%, var(--bg-subtle) ${cropOffset * 100}%)` }}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex gap-3 bg-[var(--bg-subtle)]/50">
              <button
                type="button"
                onClick={() => setCroppingIdx(null)}
                className="flex-1 py-3 btn-secondary rounded-2xl text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={applyCrop}
                className="flex-1 py-3 btn-primary rounded-2xl text-sm"
              >
                Confirmar Corte
              </button>
            </div>
          </div>
        ) : (
          /* Normal Post Form View */
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <div className="gradient-primary p-1.5 rounded-xl">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Relatar Nova Experiência</h2>
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="p-1.5 rounded-xl hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Location */}
              <div className="space-y-2 animate-slide-up stagger-1">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[var(--clr-teal)]" />
                  Onde você esteve?
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="Nome do local ou estabelecimento"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] disabled:opacity-50"
                />
              </div>

              {/* Rating & Verdict */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up stagger-2">
                {/* Rating Stars */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Sua Avaliação (1 a 5 estrelas)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setRating(star)}
                        className="p-1 transition-all active:scale-90 disabled:opacity-50 hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors duration-200 ${
                            star <= rating
                              ? 'fill-[var(--clr-primary)] text-[var(--clr-primary)]'
                              : 'text-[var(--text-muted)] hover:text-[var(--clr-primary-light)]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verdict */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Veredito Rápido
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setVerdict('Gostei')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-bold transition-all duration-300 ${
                        verdict === 'Gostei'
                          ? 'bg-[var(--clr-success)]/15 border-[var(--clr-success)] text-[var(--clr-success)] shadow-sm'
                          : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Gostei
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setVerdict('Não gostei')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-bold transition-all duration-300 ${
                        verdict === 'Não gostei'
                          ? 'bg-[var(--clr-danger)]/15 border-[var(--clr-danger)] text-[var(--clr-danger)] shadow-sm'
                          : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Não Gostei
                    </button>
                  </div>
                </div>
              </div>

              {/* Description Content */}
              <div className="space-y-2 animate-slide-up stagger-3">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  O que achou da experiência?
                </label>
                <textarea
                  required
                  rows={3}
                  disabled={isSubmitting}
                  placeholder="Como foi a sua experiência?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] resize-none disabled:opacity-50"
                />
              </div>

              {/* Photo Attachments */}
              <div className="space-y-3 animate-slide-up stagger-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[var(--clr-primary)]" />
                    Adicionar Fotos ({photoFiles.length})
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
                      className="text-xs text-[var(--clr-primary)] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload
                    </label>
                  </div>
                </div>

                {/* Display Attached Photos List (Files only) */}
                {photoFiles.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                    {/* Render Custom Files */}
                    {photoFiles.map((file, idx) => {
                      const fileUrl = URL.createObjectURL(file);
                      return (
                        <div key={`file-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[var(--border-subtle)] flex-shrink-0 group">
                          <img src={fileUrl} alt="File attached preview" className="w-full h-full object-cover" />
                          
                          {/* Crop Button */}
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => setCroppingIdx(idx)}
                            className="absolute bottom-1 left-1 bg-black/70 hover:bg-[var(--clr-primary)] text-white rounded-lg px-1.5 py-0.5 text-[10px] font-bold transition-colors"
                          >
                            Cortar
                          </button>

                          {/* Remove Button */}
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleRemoveFile(idx)}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-[var(--clr-danger)] transition-colors"
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
              <div className="pt-2 animate-slide-up stagger-5">
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim() || !location.trim()}
                  className="w-full py-3.5 btn-primary rounded-2xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                      <span>Enviando relato...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Publicar Relato</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
