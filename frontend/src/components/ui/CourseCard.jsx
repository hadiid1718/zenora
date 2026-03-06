import { Link } from 'react-router-dom';
import { Star, Clock, Users, Heart } from 'lucide-react';
import { cn, formatPrice, formatDuration, formatNumber } from '../../lib/utils';
import { motion } from 'framer-motion';

const CourseCard = ({ course, onWishlist, isWishlisted, className }) => {
  const {
    title,
    slug,
    thumbnail,
    price,
    originalPrice,
    instructor,
    averageRating,
    totalRatings,
    totalStudents,
    totalDuration,
    level,
    isBestseller,
  } = course;

  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group relative bg-surface-0 rounded-2xl overflow-hidden',
        'border border-surface-200/60 shadow-card hover:shadow-card-hover',
        'transition-all duration-300',
        className
      )}
    >
      {/* Thumbnail */}
      <Link to={`/courses/${slug}`} className="block relative overflow-hidden aspect-video">
        <img
          src={thumbnail?.url || '/placeholder-course.jpg'}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isBestseller && (
            <span className="px-2.5 py-1 bg-warning-500 text-white text-xs font-bold rounded-lg shadow-md">
              Bestseller
            </span>
          )}
          {discount > 0 && (
            <span className="px-2.5 py-1 bg-error-500 text-white text-xs font-bold rounded-lg shadow-md">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist button */}
        {onWishlist && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWishlist(course._id);
            }}
            className={cn(
              'absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200',
              'hover:scale-110 active:scale-95',
              isWishlisted
                ? 'bg-error-500 text-white'
                : 'bg-white/80 text-surface-800 hover:bg-white'
            )}
          >
            <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} />
          </button>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Link to={`/courses/${slug}`}>
          <h3 className="font-semibold text-surface-900 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
            {title}
          </h3>
        </Link>

        {/* Instructor */}
        <p className="text-sm text-surface-800/60">
          {instructor?.firstName} {instructor?.lastName}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-warning-600">
              {averageRating?.toFixed(1) || '0.0'}
            </span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'w-3.5 h-3.5',
                    star <= Math.round(averageRating || 0)
                      ? 'text-warning-500 fill-warning-500'
                      : 'text-surface-200'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-surface-800/50">
              ({formatNumber(totalRatings || 0)})
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-surface-800/50">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(totalDuration)}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {formatNumber(totalStudents)}
          </div>
          <span className="capitalize px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md font-medium">
            {level}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 pt-1 border-t border-surface-100">
          <span className="text-lg font-bold text-surface-900">
            {formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-surface-800/40 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
