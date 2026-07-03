import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Camera, User } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useApp();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [bannerFile, setBannerFile] = useState<File | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize fields
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName);
      setBio(currentUser.bio);
      setAvatarFile(undefined);
      setBannerFile(undefined);
    }
  }, [currentUser, isOpen]);

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

  if (!isOpen || !currentUser) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsSubmitting(true);
    try {
      await updateProfile(displayName.trim(), bio.trim(), avatarFile, bannerFile);
      onClose();
    } catch (error) {
      console.error('Error saving profile changes:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create preview URLs for local state files
  const avatarPreview = avatarFile ? URL.createObjectURL(avatarFile) : currentUser.avatar;
  const bannerPreview = bannerFile ? URL.createObjectURL(bannerFile) : currentUser.banner;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Box */}
      <div className="glass-panel w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 dark:border-white/5">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Editar Perfil</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full hover:bg-white/20 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Banner Edit */}
          <div className="space-y-2 relative">
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Imagem de Capa
            </label>
            <div className="h-28 w-full rounded-2xl overflow-hidden relative border border-white/10">
              <img src={bannerPreview} alt="Capa" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <input
                  type="file"
                  id="banner-file"
                  accept="image/*"
                  disabled={isSubmitting}
                  onChange={handleBannerChange}
                  className="hidden"
                />
                <label
                  htmlFor="banner-file"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black/50 hover:bg-black/70 text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 border border-white/10"
                >
                  <Camera className="w-4 h-4" />
                  <span>Alterar Capa</span>
                </label>
              </div>
            </div>
          </div>

          {/* Avatar Edit */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={avatarPreview}
                alt="Foto de perfil"
                className="w-16 h-16 rounded-2xl object-cover border border-white/20 shadow-md"
              />
              <input
                type="file"
                id="avatar-file"
                accept="image/*"
                disabled={isSubmitting}
                onChange={handleAvatarChange}
                className="hidden"
              />
              <label
                htmlFor="avatar-file"
                className="absolute -bottom-1.5 -right-1.5 bg-indigo-500 hover:bg-indigo-600 text-white p-1 rounded-lg cursor-pointer transition-all active:scale-90 border border-white/20 shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" />
              </label>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-white">Foto de Perfil</h4>
              <p className="text-[10px] text-gray-400">Formatos recomendados: JPG, PNG</p>
            </div>
          </div>

          {/* Display Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              Nome de Exibição
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder="Digite seu nome completo"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass-input focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-gray-800 dark:text-white transition-all disabled:opacity-50"
            />
          </div>

          {/* Bio Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Biografia
            </label>
            <textarea
              rows={3}
              disabled={isSubmitting}
              placeholder="Fale um pouco sobre você..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass-input focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-gray-800 dark:text-white transition-all resize-none disabled:opacity-50"
            />
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !displayName.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  <span>Salvando alterações...</span>
                </>
              ) : (
                <span>Salvar Alterações</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
