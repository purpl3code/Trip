import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { pullDistance, REFRESH_THRESHOLD } from '../utils/pullRefresh';

export function PullToRefresh({ onRefresh, isRefreshing, children }: {
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const refresh = useRef(onRefresh);
  const busy = useRef(isRefreshing);
  const [distance, setDistance] = useState(0);
  const [running, setRunning] = useState(false);
  const [failed, setFailed] = useState(false);
  refresh.current = onRefresh;
  const loading = isRefreshing || running;
  busy.current = loading;

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let gesture: { x: number; y: number; distance: number } | null = null;
    let suppressClickUntil = 0;
    let mounted = true;
    const html = document.documentElement;
    const hadClass = html.classList.contains('pull-refresh-enabled');
    html.classList.add('pull-refresh-enabled');
    const start = (event: TouchEvent) => {
      gesture = null;
      if (busy.current || event.touches.length !== 1 || window.scrollY > 1
        || (event.target as HTMLElement).closest('input,textarea,select,[contenteditable="true"]')) return;
      gesture = { x: event.touches[0].clientX, y: event.touches[0].clientY, distance: 0 };
    };
    const cancel = () => { gesture = null; setDistance(0); };
    const move = (event: TouchEvent) => {
      if (!gesture) return;
      if (busy.current || event.touches.length !== 1 || window.scrollY > 1) { cancel(); return; }
      const touch = event.touches[0];
      const dx = touch.clientX - gesture.x;
      const dy = touch.clientY - gesture.y;
      if (dy < -8 || Math.abs(dx) > Math.max(8, Math.abs(dy))) { cancel(); return; }
      const next = pullDistance(gesture.x,gesture.y,touch.clientX,touch.clientY,window.scrollY);
      gesture.distance = next;
      setDistance(next);
      if (next > 0) {
        if (!event.cancelable) { cancel(); return; }
        event.preventDefault();
        if (next > 8) suppressClickUntil = Date.now() + 700;
      }
    };
    const end = () => {
      const shouldRefresh = !!gesture && gesture.distance >= REFRESH_THRESHOLD && !busy.current;
      gesture = null; setDistance(0);
      if (!shouldRefresh) return;
      busy.current = true; setRunning(true); setFailed(false);
      void Promise.resolve().then(() => refresh.current()).catch(() => {
        if (mounted) setFailed(true);
      }).finally(() => {
        busy.current = false;
        if (mounted) setRunning(false);
      });
    };
    const click = (event: MouseEvent) => {
      if (Date.now() < suppressClickUntil) { event.preventDefault(); event.stopPropagation(); }
    };
    element.addEventListener('touchstart',start,{passive:true});
    element.addEventListener('touchmove',move,{passive:false});
    element.addEventListener('touchend',end,{passive:true});
    element.addEventListener('touchcancel',cancel,{passive:true});
    element.addEventListener('click',click,true);
    return () => {
      mounted = false;
      element.removeEventListener('touchstart',start);
      element.removeEventListener('touchmove',move);
      element.removeEventListener('touchend',end);
      element.removeEventListener('touchcancel',cancel);
      element.removeEventListener('click',click,true);
      if (!hadClass) html.classList.remove('pull-refresh-enabled');
    };
  },[]);

  const ready = distance >= REFRESH_THRESHOLD;
  const height = loading ? 48 : distance;
  return <div ref={root} className={`pull-to-refresh ${distance ? 'is-pulling' : ''}`}>
    <div className="pull-refresh-indicator" style={{height}} aria-hidden={!height}>
      <RefreshCw size={18} aria-hidden="true" className={loading ? 'animate-spin' : ''} style={loading ? undefined : {transform:`rotate(${distance * 2.5}deg)`}} />
      <span>{loading ? 'Atualizando relatos…' : ready ? 'Solte para atualizar' : 'Puxe para atualizar'}</span>
    </div>
    <span className="sr-only" role="status" aria-live="polite">{loading ? 'Atualizando relatos.' : failed ? 'Não foi possível atualizar. Tente novamente.' : ''}</span>
    {children}
  </div>;
}
