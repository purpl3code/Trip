import { MapPin, Star, ArrowUpRight } from 'lucide-react';
import { groupLocations } from '../utils/discovery';

type Location = ReturnType<typeof groupLocations>[number];

export function LocationCard({ location, onOpen }: { location: Location; onOpen: () => void }) {
  const photo = location.posts.flatMap(post => post.photos)[0];
  return <button className={`location-card ${photo ? 'has-photo' : ''}`} onClick={onOpen}>
    {photo ? <div className="location-card-photo"><img src={photo} alt="" loading="lazy" /><span><MapPin size={16} /></span></div> : <div className="location-card-icon"><MapPin size={22} /></div>}
    <div className="location-card-copy"><h3>{location.name}</h3><p><span>{location.posts.length} {location.posts.length === 1 ? 'relato' : 'relatos'}</span><span className="location-rating"><Star size={13} fill="currentColor" />{location.rating.toFixed(1)}</span></p></div>
    <ArrowUpRight className="location-card-arrow" size={18} aria-hidden="true" />
  </button>;
}
