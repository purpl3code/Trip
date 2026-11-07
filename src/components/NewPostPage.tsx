import { useEffect, useState } from 'react';
import { useApp } from '../context/appState';
import { ThumbsUp, ThumbsDown, ImagePlus, X, Crop, Send, LoaderCircle } from 'lucide-react';
import { useObjectUrls } from '../hooks/useObjectUrls';
import { StarRating } from './StarRating';
import { usePostDraft } from '../hooks/usePostDraft';
import { errorMessage } from '../utils/errors';

export function NewPostPage({ active }: { active: boolean }) {
  const { addPost, notify, setActiveTab, currentUser } = useApp();
  const { draft, setField, clearDraft, ready, saveState } = usePostDraft(currentUser!.id);
  const { content, location, rating, verdict, files } = draft;
  const setContent = (value: string) => setField('content',value);
  const setLocation = (value: string) => setField('location',value);
  const setRating = (value: number) => setField('rating',value);
  const setVerdict = (value: 'Gostei' | 'Não gostei') => setField('verdict',value);
  const setFiles = (value: File[] | ((previous: File[]) => File[])) => setField('files',value);
  const urls = useObjectUrls(files);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const [cropOffset, setCropOffset] = useState(.5);
  const [landscape, setLandscape] = useState(true);
  const [cropping, setCropping] = useState(false);
  const busy = submitting || cropping || !ready;
  useEffect(() => {
    if (active) document.getElementById('new-post-title')?.focus({ preventScroll: true });
  }, [active]);
  const selectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length + incoming.length > 8) { setError('Adicione até 8 fotos por relato.'); return; }
    if (incoming.some(file => !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024)) { setError('Use fotos JPG, PNG ou WebP de até 10 MB cada.'); return; }
    setError(''); setFiles(previous => [...previous, ...incoming]);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (!location.trim() || !content.trim()) { setError("Preencha o local e conte como foi a experiência."); document.getElementById(!location.trim() ? "post-location" : "post-content")?.focus(); return; }
    if (!navigator.onLine) { setError('Você está sem conexão. Seu rascunho está guardado; conecte-se para publicar.'); return; }
    setSubmitting(true); setError('');
    try {
      await addPost(content.trim(), location.trim(), rating, verdict, [], files);
      await clearDraft();
      setActiveTab('feed'); notify('Sua descoberta foi publicada!');
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
      const outputSize = Math.min(size,1600);
      canvas.width = outputSize; canvas.height = outputSize;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Não foi possível recortar a foto.');
      context.fillStyle = "#ffffff"; context.fillRect(0,0,outputSize,outputSize);
      context.drawImage(image, (image.width-size)*cropOffset, (image.height-size)*cropOffset, size,size,0,0,outputSize,outputSize);
      const blob = await new Promise<Blob>((resolve,reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Não foi possível salvar o corte.')), 'image/jpeg',.9));
      const index = cropIndex;
      setFiles(previous => previous.map((file,i) => i === index ? new File([blob], 'foto-recortada.jpg', { type:'image/jpeg' }) : file));
      setCropIndex(null);
    } catch (err) { setError(errorMessage(err)); } finally { setCropping(false); }
  };
  return <section className="new-post-page" hidden={!active} aria-labelledby="new-post-title">
    <h1 id="new-post-title" className="sr-only" tabIndex={-1}>{cropIndex !== null ? 'Recortar foto' : 'Criar relato'}</h1>
    {cropIndex !== null ? <div className="composer-surface crop-form"><p className="muted">Ajuste a posição para recortar sua foto em um quadrado.</p><div className="crop-preview" style={{ backgroundImage: `url(${urls[cropIndex]})`, backgroundSize: landscape ? 'auto 100%' : '100% auto', backgroundPosition: landscape ? `${cropOffset*100}% center` : `center ${cropOffset*100}%` }} /><label className="field-label" htmlFor="crop-offset">Posição da foto</label><input id="crop-offset" type="range" min="0" max="1" step=".01" value={cropOffset} disabled={cropping} onChange={event => setCropOffset(Number(event.target.value))} /><div className="dialog-actions"><button className="btn-secondary" disabled={cropping} onClick={() => setCropIndex(null)}>Voltar</button><button className="btn-primary" disabled={cropping} onClick={() => void crop()}>{cropping ? 'Recortando…' : 'Aplicar corte'}</button></div>{error && <p className="form-error" role="alert">{error}</p>}</div> :
    <form className="composer-surface trip-form" onSubmit={submit}>
      <div className="form-field"><label htmlFor="post-location">Onde você esteve?</label><input id="post-location" name="location" autoComplete="off" required maxLength={120} placeholder="Nome do lugar ou estabelecimento" value={location} disabled={busy} onChange={event => setLocation(event.target.value)} /></div>
      <fieldset className="rating-field"><legend>Sua avaliação</legend><StarRating value={rating} onChange={setRating} disabled={busy} /></fieldset>
      <div className="verdict-picker"><button type="button" disabled={busy} aria-pressed={verdict === 'Gostei'} onClick={() => setVerdict('Gostei')}><ThumbsUp size={17} /> Gostei</button><button type="button" disabled={busy} aria-pressed={verdict === 'Não gostei'} onClick={() => setVerdict('Não gostei')}><ThumbsDown size={17} /> Não gostei</button></div>
      <div className="form-field"><label htmlFor="post-content">Como foi a experiência?</label><textarea id="post-content" name="content" aria-describedby="post-content-hint" required maxLength={5000} rows={4} placeholder="O que fez esse momento valer a pena? O que você recomendaria?" value={content} disabled={busy} onChange={event => setContent(event.target.value)} /><span id="post-content-hint" className="field-hint">{content.length}/5000 caracteres</span></div>
      <div className="photo-upload-heading"><div><strong>Fotos da descoberta</strong><p>Até 8 fotos · JPG, PNG ou WebP · 10 MB cada</p></div><label className="upload-button"><ImagePlus size={18} /><span>Adicionar</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} aria-label="Adicionar fotos ao relato" onChange={selectFiles} /></label></div>
      {files.length > 0 && <div className="upload-previews">{files.map((file,index) => <div key={index}><img src={urls[index]} alt={`Prévia da foto ${index+1}: ${file.name}`} onLoad={event => { if (cropIndex === index) setLandscape(event.currentTarget.naturalWidth >= event.currentTarget.naturalHeight); }} /><button type="button" className="preview-remove" disabled={busy} aria-label={`Remover foto ${index+1}`} onClick={() => setFiles(previous => previous.filter((_,i) => i !== index))}><X size={16} /></button><button type="button" className="preview-crop" disabled={busy} aria-label={`Recortar foto ${index+1}`} onClick={() => { const image = new Image(); image.onload = () => setLandscape(image.width >= image.height); image.src = urls[index]; setCropIndex(index); setCropOffset(.5); }}><Crop size={13} /> Recortar</button></div>)}</div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-submit"><span id="post-draft-hint">{!ready ? 'Abrindo seu rascunho…' : saveState === 'saving' ? 'Salvando rascunho…' : saveState === 'error' ? 'Rascunho mantido nesta sessão. O armazenamento do aparelho está indisponível.' : 'Rascunho salvo neste aparelho, incluindo suas fotos.'}</span><button type="submit" className="btn-primary" disabled={busy}>{submitting ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} />}{submitting ? 'Publicando…' : 'Publicar relato'}</button></div>
    </form>}
  </section>;
}
