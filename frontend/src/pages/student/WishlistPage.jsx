import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import EmptyState from '../../components/ui/EmptyState';
import { useCartStore } from '../../store/cartStore';
import StarRating from '../../components/ui/StarRating';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const queryClient = useQueryClient();
  const { addToCart } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/student/wishlist').then((r) => r.data.data),
  });

  const removeMutation = useMutation({
    mutationFn: (courseId) => api.post(`/student/wishlist/${courseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    },
  });

  const handleMoveToCart = async (courseId) => {
    try {
      await addToCart(courseId);
      removeMutation.mutate(courseId);
      toast.success('Moved to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (!isLoading && (!data?.wishlist || data.wishlist.length === 0)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save courses you're interested in to your wishlist"
          action={{ label: 'Browse Courses', to: '/courses' }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-surface-900 mb-6">My Wishlist</h1>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface-100 rounded-xl animate-shimmer" />
          ))
        ) : (
          data.wishlist.map((course) => (
            <div
              key={course._id}
              className="flex gap-4 bg-surface-0 rounded-xl border border-surface-200/60 p-4"
            >
              <Link to={`/course/${course.slug}`} className="shrink-0">
                <div className="w-32 h-20 rounded-lg bg-surface-100 overflow-hidden">
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/course/${course.slug}`}
                  className="text-sm font-semibold text-surface-900 hover:text-brand-700 line-clamp-1"
                >
                  {course.title}
                </Link>
                <p className="text-xs text-surface-800/50 mt-0.5">
                  {course.instructor?.firstName} {course.instructor?.lastName}
                </p>
                {course.averageRating > 0 && (
                  <StarRating rating={course.averageRating} size="sm" showValue />
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-sm font-bold text-surface-900">
                  {formatPrice(course.discountPrice || course.price)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveToCart(course._id)}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Move to Cart
                  </button>
                  <button
                    onClick={() => removeMutation.mutate(course._id)}
                    className="p-1 text-surface-800/40 hover:text-error-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
