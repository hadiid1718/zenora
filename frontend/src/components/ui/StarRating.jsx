import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

const StarRating = ({ rating = 0, maxRating = 5, size = 'md', interactive = false, onChange, showValue = false }) => {
  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-5.5 h-5.5',
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(i + 1)}
              className={cn(
                'relative transition-colors',
                interactive && 'cursor-pointer hover:scale-110',
                !interactive && 'cursor-default'
              )}
            >
              {/* Background star */}
              <Star className={cn(sizes[size], 'text-surface-200')} />
              {/* Filled overlay */}
              {(filled || partial) && (
                <Star
                  className={cn(sizes[size], 'absolute inset-0 text-warning-500 fill-warning-500')}
                  style={partial ? { clipPath: `inset(0 ${(1 - (rating % 1)) * 100}% 0 0)` } : undefined}
                />
              )}
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-surface-800/70 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
