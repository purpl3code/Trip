import symbol from '../assets/trip-symbol.svg';
import wordmark from '../assets/trip-wordmark.svg';

export function Brand() {
  return <div className="trip-brand" role="img" aria-label="Trip"><span className="trip-brand-mark"><img src={symbol} width="33" height="33" alt="" aria-hidden="true" /></span><img className="trip-brand-wordmark" src={wordmark} width="78" height="25" alt="" aria-hidden="true" /></div>;
}
