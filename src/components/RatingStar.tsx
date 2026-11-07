import { useId } from 'react';
import { Star } from 'lucide-react';

export function RatingStar({ size = 20, filled = true, className = '' }: { size?: number; filled?: boolean; className?: string }) {
  const gradientId = useId();
  return <Star size={size} strokeWidth={1.35} aria-hidden="true" className={'rating-star ' + (filled ? 'is-filled ' : '') + className} fill={filled ? 'url(#' + gradientId + ')' : 'none'}>
    <defs><linearGradient id={gradientId} x1="0" y1="0" x2=".35" y2="1">
      <stop offset="0%" stopColor="#ffe8b2" /><stop offset="45%" stopColor="#ffc45d" /><stop offset="100%" stopColor="#efa01e" />
    </linearGradient></defs>
  </Star>;
}
