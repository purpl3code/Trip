import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/appState';
import { Camera, Check, LoaderCircle } from 'lucide-react';
import { Dialog } from './Dialog';
import { useObjectUrls } from '../hooks/useObjectUrls';
import { errorMessage } from '../utils/errors';

export function EditProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { currentUser, updateProfile, notify } = useApp();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<File | undefined>();
  const [banner, setBanner] = useState<File | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const files = useMemo(() => [avatar,banner].filter((file): file is File => !!file), [avatar,banner]);
  const urls = useObjectUrls(files);
  useEffect(() => {
    if (!isOpen || !currentUser) return;
    setDisplayName(currentUser.displayName); setBio(currentUser.bio); setAvatar(undefined); setBanner(undefined); setError('');
  }, [isOpen, currentUser]);
  const chooseImage = (event: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'banner') => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 10*1024*1024) { setError('Escolha uma foto JPG, PNG ou WebP de até 10 MB.'); return; }
    setError(''); if (target === 'avatar') setAvatar(file); else setBanner(file);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || !displayName.trim()) return;
    setSubmitting(true); setError('');
    try { await updateProfile(displayName.trim(),bio.trim(),avatar,banner); onClose(); notify('Seu perfil foi atualizado.'); }
    catch (err) { setError(errorMessage(err)); } finally { setSubmitting(false); }
  };
  const avatarUrl = avatar ? urls[0] : currentUser?.avatar;
  const bannerUrl = banner ? urls[avatar ? 1 : 0] : currentUser?.banner;
  return <Dialog open={isOpen && !!currentUser} onClose={onClose} title="Seu diário, sua identidade" busy={submitting}>
    <form className="dialog-content trip-form" onSubmit={submit}>
      <div className="edit-cover"><img src={bannerUrl} alt="Prévia da capa" /><label className="upload-button"><Camera size={17} /> Alterar capa<input type="file" aria-label="Alterar foto de capa" accept="image/jpeg,image/png,image/webp" disabled={submitting} onChange={event => chooseImage(event,'banner')} /></label></div>
      <div className="edit-avatar-row"><img src={avatarUrl} alt="Prévia da foto de perfil" /><div><strong>Foto de perfil</strong><label className="upload-button"><Camera size={16} /> Escolher foto<input type="file" aria-label="Alterar foto de perfil" accept="image/jpeg,image/png,image/webp" disabled={submitting} onChange={event => chooseImage(event,'avatar')} /></label></div></div>
      <div className="form-field"><label htmlFor="profile-name">Nome de exibição</label><input id="profile-name" autoComplete="name" required maxLength={60} value={displayName} disabled={submitting} onChange={event => setDisplayName(event.target.value)} /></div>
      <div className="form-field"><label htmlFor="profile-bio">Sobre você</label><textarea id="profile-bio" rows={3} maxLength={300} value={bio} disabled={submitting} placeholder="Que lugares e sabores movem você?" onChange={event => setBio(event.target.value)} /><span className="field-hint">{bio.length}/300 caracteres</span></div>
      {error && <p role="alert" className="form-error">{error}</p>}
      <div className="dialog-actions"><button type="button" className="btn-secondary" disabled={submitting} onClick={onClose}>Cancelar</button><button type="submit" className="btn-primary" disabled={submitting || !displayName.trim()}>{submitting ? <LoaderCircle size={18} className="animate-spin" /> : <Check size={18} />}{submitting ? 'Salvando…' : 'Salvar alterações'}</button></div>
    </form>
  </Dialog>;
}
