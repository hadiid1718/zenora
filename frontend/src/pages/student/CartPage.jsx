import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, Tag } from 'lucide-react';
import api from '../../lib/api';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../lib/utils';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { useState } from 'react';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, fetchCart, removeFromCart } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
  });

  const handleRemove = async (courseId) => {
    try {
      await removeFromCart(courseId);
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);
    try {
      const payload = {
        items: items.map((item) => ({ courseId: item.course._id || item.course })),
      };
      if (couponCode.trim()) payload.couponCode = couponCode.trim();

      const { data } = await api.post('/payments/checkout', payload);
      window.location.href = data.data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
      setIsCheckingOut(false);
    }
  };

  if (!isLoading && items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse our courses and add some to your cart"
          action={{ label: 'Browse Courses', to: '/courses' }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-surface-100 rounded-xl animate-shimmer" />
            ))
          ) : (
            items.map((item) => {
              const course = item.course;
              return (
                <div
                  key={course._id}
                  className="flex gap-4 bg-surface-0 rounded-xl border border-surface-200/60 p-4"
                >
                  <Link to={`/course/${course.slug}`} className="shrink-0">
                    <div className="w-28 h-20 rounded-lg bg-surface-100 overflow-hidden">
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
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-surface-900">
                        {formatPrice(course.discountPrice || course.price)}
                      </span>
                      <button
                        onClick={() => handleRemove(course._id)}
                        className="p-1.5 rounded-lg text-surface-800/40 hover:text-error-600 hover:bg-error-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-surface-0 rounded-xl border border-surface-200/60 p-5 lg:sticky lg:top-24">
            <h3 className="text-sm font-semibold text-surface-900 mb-4">Order Summary</h3>

            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-800/40" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
            </div>

            <div className="border-t border-surface-100 pt-4 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-surface-800/60">{items.length} course(s)</span>
                <span className="font-semibold text-surface-900">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              isLoading={isCheckingOut}
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
