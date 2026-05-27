import { Star } from 'lucide-react';

type Props = {
  rating: number;
  count?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (stars: number) => void;
  hovered?: number;
  onHover?: (stars: number) => void;
};

export default function StarRating({ rating, count, size = 14, interactive = false, onRate, hovered, onHover }: Props) {
  const displayRating = hovered !== undefined && hovered > 0 ? hovered : rating;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => {
          const filled = star <= Math.round(displayRating);
          return (
            <button key={star} type="button" disabled={!interactive}
              onClick={() => interactive && onRate?.(star)}
              onMouseEnter={() => interactive && onHover?.(star)}
              onMouseLeave={() => interactive && onHover?.(0)}
              className={`${interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'} transition-transform`}>
              <Star size={size}
                className={filled ? 'text-[#F5C518] fill-[#F5C518]' : 'text-[#333] fill-transparent'} />
            </button>
          );
        })}
      </div>
      {count !== undefined && <span className="text-gray-500 text-xs">({count})</span>}
      {rating > 0 && count === undefined && <span className="text-[#F5C518] text-xs font-bold">{rating.toFixed(1)}</span>}
    </div>
  );
}
