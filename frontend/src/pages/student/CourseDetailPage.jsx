import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Play, Clock, BarChart3, Users, Globe, Award, BookOpen,
  ChevronDown, ChevronUp, Heart, ShoppingCart, Check,
  Star, Lock, FileText,
} from 'lucide-react';
import api from '../../lib/api';
import { formatPrice, formatDuration, formatNumber, formatDate } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import StarRating from '../../components/ui/StarRating';
import Badge from '../../components/ui/Badge';
import { CourseCardSkeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const CourseDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const { addToCart } = useCartStore();

  const [expandedModules, setExpandedModules] = useState(new Set([0]));

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => api.get(`/courses/slug/${slug}`).then((r) => r.data.data.course),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['course-reviews', course?._id],
    queryFn: () => api.get(`/student/reviews/${course._id}`).then((r) => r.data.data),
    enabled: !!course?._id,
  });

  const wishlistMutation = useMutation({
    mutationFn: () => api.post(`/student/wishlist/${course._id}`),
    onSuccess: () => {
      toast.success('Wishlist updated');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const handleAddToCart = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      await addToCart(course._id);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      const { data } = await api.post('/payments/checkout', {
        items: [{ courseId: course._id }],
      });
      window.location.href = data.data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    }
  };

  const toggleModule = (index) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface-200 rounded w-2/3" />
          <div className="h-4 bg-surface-100 rounded w-1/2" />
          <div className="h-64 bg-surface-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-surface-900">Course not found</h2>
        <Link to="/courses" className="text-brand-600 mt-2 inline-block">Browse courses</Link>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  const isOwner = user?._id === course.instructor?._id;

  return (
    <div>
      {/* Header banner */}
      <section className="gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="accent">{course.level}</Badge>
              {course.category && (
                <Link
                  to={`/courses?category=${course.category._id}`}
                  className="text-sm text-brand-200/60 hover:text-white transition-colors"
                >
                  {course.category.name}
                </Link>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
              {course.title}
            </h1>
            <p className="text-brand-200/70 text-lg mb-4">{course.subtitle}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-brand-200/60 mb-4">
              {course.averageRating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-warning-500 fill-warning-500" />
                  <span className="font-semibold text-warning-400">
                    {course.averageRating.toFixed(1)}
                  </span>
                  ({formatNumber(course.totalReviews)} reviews)
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {formatNumber(course.totalStudents)} students
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {formatDuration(course.totalDuration)}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" /> {course.language || 'English'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Avatar
                src={course.instructor?.avatar?.url}
                firstName={course.instructor?.firstName}
                lastName={course.instructor?.lastName}
                size="sm"
              />
              <div>
                <p className="text-sm font-medium text-white">
                  {course.instructor?.firstName} {course.instructor?.lastName}
                </p>
                <p className="text-xs text-brand-200/50">Instructor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column */}
          <div className="flex-1 space-y-8">
            {/* What you'll learn */}
            {course.learningOutcomes?.length > 0 && (
              <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6">
                <h2 className="text-lg font-bold text-surface-900 mb-4">What you'll learn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.learningOutcomes.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-surface-800/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course content / curriculum */}
            <div>
              <h2 className="text-lg font-bold text-surface-900 mb-4">
                Course Content
                <span className="text-sm font-normal text-surface-800/50 ml-2">
                  {course.modules?.length || 0} sections &middot; {totalLessons} lessons &middot; {formatDuration(course.totalDuration)}
                </span>
              </h2>
              <div className="border border-surface-200/60 rounded-2xl overflow-hidden">
                {course.modules?.map((mod, mi) => (
                  <div key={mi} className="border-b border-surface-200/60 last:border-b-0">
                    <button
                      onClick={() => toggleModule(mi)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {expandedModules.has(mi) ? (
                          <ChevronUp className="w-4 h-4 text-surface-800/40" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-surface-800/40" />
                        )}
                        <span className="text-sm font-medium text-surface-900">{mod.title}</span>
                      </div>
                      <span className="text-xs text-surface-800/40">
                        {mod.lessons?.length || 0} lessons
                      </span>
                    </button>
                    {expandedModules.has(mi) && (
                      <div className="pb-2">
                        {mod.lessons?.map((lesson, li) => (
                          <div
                            key={li}
                            className="flex items-center gap-3 px-5 py-2.5 hover:bg-surface-50/50"
                          >
                            {lesson.type === 'video' ? (
                              <Play className="w-3.5 h-3.5 text-surface-800/40" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-surface-800/40" />
                            )}
                            <span className="flex-1 text-sm text-surface-800/70">{lesson.title}</span>
                            {lesson.isFreePreview && (
                              <span className="text-xs text-brand-600 font-medium">Preview</span>
                            )}
                            {lesson.duration > 0 && (
                              <span className="text-xs text-surface-800/40">
                                {formatDuration(lesson.duration)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            {course.requirements?.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-surface-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-surface-800/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-surface-300 mt-2 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="text-lg font-bold text-surface-900 mb-4">About this course</h2>
              <div className="prose prose-sm max-w-none text-surface-800/70 leading-relaxed">
                {course.description}
              </div>
            </div>

            {/* Reviews */}
            {reviewsData?.reviews?.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-surface-900 mb-4">Student Reviews</h2>
                <div className="space-y-4">
                  {reviewsData.reviews.slice(0, 5).map((review) => (
                    <div
                      key={review._id}
                      className="bg-surface-0 rounded-xl border border-surface-200/60 p-5"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <Avatar
                          firstName={review.student?.firstName}
                          lastName={review.student?.lastName}
                          size="sm"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-surface-900">
                            {review.student?.firstName} {review.student?.lastName}
                          </p>
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-xs text-surface-800/40">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-surface-800/70">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar — sticky purchase card */}
          <div className="lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-24">
              <div className="bg-surface-0 rounded-2xl border border-surface-200/60 overflow-hidden shadow-card">
                {/* Thumbnail */}
                {course.thumbnail?.url && (
                  <div className="aspect-video bg-surface-100 relative">
                    <img
                      src={course.thumbnail.url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-5 h-5 text-surface-900 ml-0.5" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-4">
                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-surface-900">
                      {formatPrice(course.discountPrice || course.price)}
                    </span>
                    {course.discountPrice > 0 && course.discountPrice < course.price && (
                      <span className="text-sm text-surface-800/40 line-through">
                        {formatPrice(course.price)}
                      </span>
                    )}
                  </div>

                  {!isOwner && (
                    <>
                      <Button onClick={handleBuyNow} className="w-full" size="lg">
                        {course.price === 0 ? 'Enroll for Free' : 'Buy Now'}
                      </Button>
                      <Button
                        onClick={handleAddToCart}
                        variant="outline"
                        className="w-full"
                        icon={ShoppingCart}
                      >
                        Add to Cart
                      </Button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      if (!isAuthenticated) return navigate('/login');
                      wishlistMutation.mutate();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2 text-sm text-surface-800/60 hover:text-brand-600 transition-colors"
                  >
                    <Heart className="w-4 h-4" /> Add to Wishlist
                  </button>

                  <div className="border-t border-surface-100 pt-4 space-y-3 text-sm text-surface-800/60">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(course.totalDuration)} total</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>{course.level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
