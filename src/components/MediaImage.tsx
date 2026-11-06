import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';

export function MediaImage({ src, alt, className = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failedSrc,setFailedSrc] = useState<string | undefined>();
  if (src && failedSrc === src) return <span className={`media-unavailable ${className}`} role="img" aria-label={alt || 'Imagem indisponível'}><ImageOff size={24} aria-hidden="true" /><span>Imagem indisponível</span></span>;
  return <img {...props} src={src} alt={alt || ''} className={className} onError={event => { setFailedSrc(src); props.onError?.(event); }} />;
}
