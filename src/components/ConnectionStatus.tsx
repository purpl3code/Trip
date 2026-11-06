import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
export function ConnectionStatus() {
  const [online,setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online',on); window.addEventListener('offline',off);
    return () => { window.removeEventListener('online',on); window.removeEventListener('offline',off); };
  },[]);
  return online ? null : <div className="connection-status" role="status"><WifiOff size={16} aria-hidden="true" /><span>Sem conexão. Você pode continuar seu rascunho; para publicar, conecte-se novamente.</span></div>;
}
