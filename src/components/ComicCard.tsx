import { Star } from 'lucide-react';
import { Comic } from '../lib/supabase';

type Props = {
  comic: Comic;
  onClick: () => void;
};

export default function ComicCard({ comic, onClick }: Props) {
  return (
    <div onClick={onClick}
      className="group cursor-pointer rounded-lg overflow-hidden bg-[#1A1A1A] border border-[#222] hover:border-[#F5C518]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#F5C518]/5 hover:-translate-y-1">
      <div className="relative aspect-[2/3] overflow-hidden bg-[#222]">
        {comic.cover_url ? (
          <img src={comic.cover_url} alt={comic.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#222]">
            <span className="text-gray-600 text-xs text-center px-3">{comic.title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        {/* Rating badge */}
        {comic.avg_rating > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md">
            <Star size={11} className="text-[#F5C518] fill-[#F5C518]" />
            <span className="text-[#F5C518] text-[10px] font-bold">{comic.avg_rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="p-2.5">
        <h3 className="text-white text-xs font-semibold leading-tight line-clamp-2 group-hover:text-[#F5C518] transition-colors">
          {comic.title}
        </h3>
      </div>
    </div>
  );
}
