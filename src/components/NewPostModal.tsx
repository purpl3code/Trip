import { useState } from 'react';
import { useApp } from '../context/appState';
import { Star, ThumbsUp, ThumbsDown, ImagePlus, X, Crop, Send, LoaderCircle } from 'lucide-react';
import { Dialog } from './Dialog';
import { useObjectUrls } from '../hooks/useObjectUrls';
import { errorMessage } from '../utils/errors';

export function NewPostModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addPost, notify, setActiveTab } = useApp();
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [verdict, setVerdict] = useState<'Gostei' | 'Não gostei'>('Gostei');
  const [files, setFiles] = useState<File[]>([]);
  const urls = useObjectUrls(files);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const [cropOffset, setCropOffset] = useState(.5);
  const [landscape, setLandscape] = useState(true);
  const [cropping, setCropping] = useState(false);
  const busy = submitting || cropping;
  const selectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length + incoming.length > 8) { setError('Adicione até 8 fotos por relato.'); return; }
    if (incoming.some(file => !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024)) { setError('Use fotos JPG, PNG ou WebP de até 10 MB cada.'); return; }
    setError(''); setFiles(previous => [...previous, ...incoming]);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || !content.trim() || !location.trim()) return;
    setSubmitting(true); setError('');
    try {
      await addPost(content.trim(), location.trim(), rating, verdict, [], files);
      setContent(''); setLocation(''); setRating(5); setVerdict('Gostei'); setFiles([]);
      setActiveTab('feed'); onClose(); notify('Sua descoberta foi publicada!');
    } catch (err) { setError(errorMessage(err)); } finally { setSubmitting(false); }
  };
  const crop = async () => {
    if (cropIndex === null || !urls[cropIndex]) return;
    setCropping(true);
    try {
      const image = new Image();
      await new Promise<void>((resolve,reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('Não foi possível abrir a foto.')); image.src = urls[cropIndex]; });
      const canvas = document.createElement('canvas');
      const size = Math.min(image.width,image.height);
      canvas.width = size; canvas.height = size;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Não foi possível recortar a foto.');
      context.drawImage(image, (image.width-size)*cropOffset, (image.height-size)*cropOffset, size,size,0,0,size,size);
      const blob = await new Promise<Blob>((resolve,reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Não foi possível salvar o corte.')), 'image/png'));
      const index = cropIndex;
      setFiles(previous => previous.map((file,i) => i === index ? new File([blob], 'foto-recortada.png', { type:'image/png' }) : file));
      setCropIndex(null);
    } catch (err) { setError(errorMessage(err)); } finally { setCropping(false); }
  };
  return <Dialog open={isOpen} onClose={() => cropIndex !== null ? setCropIndex(null) : onClose()} title={cropIndex !== null ? 'Encontre o melhor enquadramento' : 'Uma nova descoberta'} busy={busy}>
    {cropIndex !== null ? <div className="dialog-content crop-form"><p className="muted">Ajuste a posição para recortar sua foto em um quadrado.</p><div className="crop-preview" style={{ backgroundImage: `url(${urls[cropIndex]})`, backgroundSize: landscape ? 'auto 100%' : '100% auto', backgroundPosition: landscape ? `${cropOffset*100}% center` : `center ${cropOffset*100}%` }} /><label className="field-label" htmlFor="crop-offset">Posição da foto</label><input id="crop-offset" type="range" min="0" max="1" step=".01" value={cropOffset} disabled={cropping} onChange={event => setCropOffset(Number(event.target.value))} /><div className="dialog-actions"><button className="btn-secondary" disabled={cropping} onClick={() => setCropIndex(null)}>Voltar</button><button className="btn-primary" disabled={cropping} onClick={() => void crop()}>{cropping ? 'Recortando…' : 'Aplicar corte'}</button></div>{error && <p className="form-error" role="alert">{error}</p>}</div> :
    <form className="dialog-content trip-form" onSubmit={submit}>
      <p className="form-intro">Um lugar, um sabor, uma experiência. Conte do seu jeito.</p>
      <div className="form-field"><label htmlFor="post-location">Onde você esteve?</label><input id="post-location" required maxLength={120} placeholder="Nome do lugar ou estabelecimento" value={location} disabled={busy} onChange={event => setLocation(event.target.value)} /></div>
      <fieldset className="rating-field"><legend>Sua avaliação</legend><div className="star-picker">{[1,2,3,4,5].map(star => <button type="button" disabled={busy} key={star} aria-label={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`} aria-pressed={rating === star} onClick={() => setRating(star)}><Star size={28} fill={star <= rating ? 'currentColor' : 'none'} /></button>)}<span>{rating}/5</span></div></fieldset>
      <div className="verdict-picker"><button type="button" disabled={busy} aria-pressed={verdict === 'Gostei'} onClick={() => setVerdict('Gostei')}><ThumbsUp size={17} /> Gostei</button><button type="button" disabled={busy} aria-pressed={verdict === 'Não gostei'} onClick={() => setVerdict('Não gostei')}><ThumbsDown size={17} /> Não gostei</button></div>
      <div className="form-field"><label htmlFor="post-content">Como foi a experiência?</label><textarea id="post-content" required maxLength={5000} rows={4} placeholder="O que fez esse momento valer a pena? O que você recomendaria?" value={content} disabled={busy} onChange={event => setContent(event.target.value)} /><span className="field-hint">{content.length}/5000 caracteres</span></div>
      <div className="photo-upload-heading"><div><strong>Fotos da descoberta</strong><p>Até 8 fotos · JPG, PNG ou WebP · 10 MB cada</p></div><label className="upload-button"><ImagePlus size={18} /><span>Adicionar</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} aria-label="Adicionar fotos ao relato" onChange={selectFiles} /></label></div>
      {files.length > 0 && <div className="upload-previews">{files.map((file,index) => <div key={index}><img src={urls[index]} alt={`Prévia da foto ${index+1}: ${file.name}`} onLoad={event => { if (cropIndex === index) setLandscape(event.currentTarget.naturalWidth >= event.currentTarget.naturalHeight); }} /><button type="button" className="preview-remove" disabled={busy} aria-label={`Remover foto ${index+1}`} onClick={() => setFiles(previous => previous.filter((_,i) => i !== index))}><X size={16} /></button><button type="button" className="preview-crop" disabled={busy} aria-label={`Recortar foto ${index+1}`} onClick={() => { const image = new Image(); image.onload = () => setLandscape(image.width >= image.height); image.src = urls[index]; setCropIndex(index); setCropOffset(.5); }}><Crop size={13} /> Recortar</button></div>)}</div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-submit"><span>Seu rascunho fica aqui ao fechar.</span><button type="submit" className="btn-primary" disabled={busy || !content.trim() || !location.trim()}>{submitting ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} />}{submitting ? 'Publicando…' : 'Publicar relato'}</button></div>
    </form>}
  </Dialog>;
}
