import { useState } from 'react';
import { RatingStar } from './RatingStar';

export function StarRating({ value, onChange, disabled = false, label = 'Sua avaliação' }: {
  value: number; onChange: (value: number) => void; disabled?: boolean; label?: string;
}) {
  const [preview,setPreview] = useState<number | null>(null);
  const [pulse,setPulse] = useState({ star:0,tick:0 });
  const displayed = preview ?? value;
  return <div className="star-picker rating-picker" role="group" aria-label={label} onPointerLeave={() => setPreview(null)}>
    {[1,2,3,4,5].map(star => <button type="button" className={'rating-star-button' + (displayed === star ? ' is-current' : '')} key={star} disabled={disabled} aria-label={star + (star === 1 ? ' estrela' : ' estrelas')} aria-pressed={value === star}
      onPointerEnter={event => { if (event.pointerType === 'mouse' && !disabled) setPreview(star); }}
      onBlur={() => setPreview(null)}
      onClick={() => { setPreview(null); setPulse(previous => ({ star,tick:previous.tick+1 })); onChange(star); }}>
      <RatingStar key={pulse.star === star ? pulse.tick : 0} size={28} filled={star <= displayed} className={pulse.star === star ? 'star-pop' : ''} />
    </button>)}
    <output className="star-rating-value" aria-label="Nota selecionada">{displayed}<span>/5</span></output>
  </div>;
}
