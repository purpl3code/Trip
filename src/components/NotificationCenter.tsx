import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Download, RefreshCw, CheckCircle2, ExternalLink, AlertCircle, LoaderCircle } from 'lucide-react';
import { Dialog } from './Dialog';
import { AppUpdater, supportsNativeUpdates } from '../native/appUpdater';
import type { UpdateInfo } from '../native/appUpdater';
import { errorMessage } from '../utils/errors';

type Phase = 'idle' | 'downloading' | 'permission' | 'installer';
export function NotificationCenter() {
  const [open,setOpen] = useState(false);
  const [info,setInfo] = useState<UpdateInfo | null>(null);
  const [checking,setChecking] = useState(false);
  const [phase,setPhase] = useState<Phase>('idle');
  const [progress,setProgress] = useState(-1);
  const [error,setError] = useState('');
  const checkingRef = useRef(false);
  const lastCheck = useRef(0);
  const native = supportsNativeUpdates();
  const downloading = phase === 'downloading';
  const check = useCallback(async () => {
    if (!native || checkingRef.current) return;
    checkingRef.current = true; setChecking(true); setError('');
    try { setInfo(await AppUpdater.check()); lastCheck.current = Date.now(); }
    catch (error) { setError(errorMessage(error,'Não foi possível buscar atualizações. Tente novamente.')); }
    finally { checkingRef.current = false; setChecking(false); }
  },[native]);
  useEffect(() => {
    if (!native) return;
    void check();
    const onVisible = () => { if (document.visibilityState === 'visible' && Date.now()-lastCheck.current > 600000) void check(); };
    document.addEventListener('visibilitychange',onVisible);
    const timer = window.setInterval(onVisible,1800000);
    return () => { document.removeEventListener('visibilitychange',onVisible); clearInterval(timer); };
  },[native,check]);
  const install = async () => {
    if (downloading || checking) return;
    setError(''); setProgress(-1);
    const previous = phase;
    let listener: Awaited<ReturnType<typeof AppUpdater.addListener>> | undefined;
    try {
      setPhase('downloading');
      listener = await AppUpdater.addListener('downloadProgress', event => setProgress(event.percent));
      const result = previous === 'permission' || previous === 'installer'
        ? await AppUpdater.installDownloaded() : await AppUpdater.downloadAndInstall();
      setPhase(result.status === 'permissionRequired' ? 'permission' : 'installer');
    } catch (error) { setPhase('idle'); setError(errorMessage(error)); }
    finally { await listener?.remove(); }
  };
  const available = !!info?.available;
  return <>
    <button type="button" className="icon-button header-notifications" aria-label={available ? 'Notificações: atualização disponível' : 'Notificações e atualizações'} aria-haspopup="dialog" onClick={() => setOpen(true)}><Bell size={21} aria-hidden="true" />{available && <span className="notification-dot" />}</button>
    <Dialog open={open} onClose={() => setOpen(false)} title="Notificações" className="notifications-dialog" busy={downloading}>
      <div className="dialog-content notification-content">
        <div className="notification-section-label"><span>Atualizações do Trip</span>{info && <span>Versão {info.currentVersion}</span>}</div>
        {!native ? <div className="update-card"><span className="update-icon"><Download size={24} /></span><h3>O Trip sempre com você</h3><p>A atualização pelo app está disponível no APK Android com o atualizador integrado. No navegador, acesse a versão publicada no GitHub.</p><a className="btn-secondary update-link" href="https://github.com/purpl3code/Trip/releases/latest" target="_blank" rel="noreferrer">Ver versão no GitHub <ExternalLink size={16} /></a></div> : <>
          <div className={`update-card ${available ? 'update-available' : ''}`}>
            <span className="update-icon">{checking ? <LoaderCircle className="animate-spin" size={24} /> : available ? <Download size={24} /> : <CheckCircle2 size={24} />}</span>
            <h3>{checking && !info ? 'Buscando atualizações…' : available ? `Trip ${info.latestVersion} disponível` : info ? 'Seu Trip está atualizado' : 'Confira as novidades do Trip'}</h3>
            <p>{available ? info.notes : 'As novas versões aparecem aqui. Você escolhe quando baixar e instalar.'}</p>
            {available && <button className="btn-primary" disabled={downloading || checking} onClick={() => void install()}>{downloading ? <LoaderCircle className="animate-spin" size={18} /> : <Download size={18} />}{downloading ? progress >= 0 ? `Baixando… ${progress}%` : 'Preparando atualização…' : phase === 'permission' ? 'Continuar instalação' : phase === 'installer' ? 'Abrir instalador novamente' : 'Baixar e atualizar'}</button>}
            {downloading && <progress aria-label="Download da atualização" max={100} value={progress >= 0 ? progress : undefined} />}
            {phase === 'permission' && <p className="update-guidance" role="status">Autorize o Trip a instalar atualizações na tela do Android. Depois volte aqui e toque em “Continuar instalação”.</p>}
            {phase === 'installer' && <p className="update-guidance" role="status">Confirme a atualização no instalador do Android. Se cancelar, você pode abrir o instalador novamente.</p>}
          </div>
          <button className="btn-secondary update-check" disabled={checking || downloading} onClick={() => void check()}><RefreshCw size={16} className={checking ? 'animate-spin' : ''} />{checking ? 'Verificando…' : 'Verificar atualizações'}</button>
        </>}
        {error && <div className="form-error" role="alert"><AlertCircle size={17} /><span>{error}</span></div>}
        {native && <p className="notification-footnote">O Android pede sua confirmação para instalar. Seus relatos e sua conta continuam no app.</p>}
      </div>
    </Dialog>
  </>;
}
