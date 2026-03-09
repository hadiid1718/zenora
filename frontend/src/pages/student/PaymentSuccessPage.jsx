import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, BookOpen, ArrowRight, ShoppingBag } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import { formatPrice } from '../../lib/utils';
import { useCartStore } from '../../store/cartStore';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const fetchCart = useCartStore((s) => s.fetchCart);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['order', sessionId],
    queryFn: () =>
      api.get(`/payments/order/${sessionId}`).then((r) => r.data.data),
    enabled: !!sessionId,
    retry: 3,
    retryDelay: 2000,
  });

  // Once order is verified & loaded, invalidate all related caches
  useEffect(() => {
    if (data?.order) {
      fetchCart();
      queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  }, [data, fetchCart, queryClient]);

  const order = data?.order;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-success-50 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-success-500" />
        </div>

        <h1 className="text-2xl font-bold text-surface-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-surface-800/60 mb-8">
          Thank you for your purchase. You can now start learning right away.
        </p>

        {/* Order details */}
        {isLoading ? (
          <div className="bg-surface-50 rounded-2xl p-6 mb-8 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-5 bg-surface-200 rounded animate-shimmer w-3/4 mx-auto" />
            ))}
          </div>
        ) : order ? (
          <div className="bg-surface-50 rounded-2xl border border-surface-200/60 p-6 mb-8 text-left">
            <h3 className="text-sm font-semibold text-surface-800/50 uppercase tracking-wider mb-4">
              Order Summary
            </h3>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <div className="w-12 h-8 rounded-lg bg-surface-200 overflow-hidden shrink-0">
                    {item.course?.thumbnail?.url && (
                      <img
                        src={item.course.thumbnail.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-sm text-surface-900 font-medium flex-1 truncate">
                    {item.course?.title}
                  </span>
                  <span className="text-sm text-surface-800/60">
                    {formatPrice(item.price)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-surface-200 mt-4 pt-4 flex justify-between">
              <span className="text-sm font-semibold text-surface-900">Total Paid</span>
              <span className="text-sm font-bold text-brand-600">
                {formatPrice(order.finalAmount)}
              </span>
            </div>
          </div>
        ) : null}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/my-courses">
            <Button icon={BookOpen}>Go to My Courses</Button>
          </Link>
          <Link to="/courses">
            <Button variant="outline" icon={ArrowRight}>Browse More Courses</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
