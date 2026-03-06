import { useQuery } from '@tanstack/react-query';
import {
  Users, BookOpen, Star, DollarSign, TrendingUp, BarChart3,
} from 'lucide-react';
import api from '../../lib/api';
import { formatPrice, formatNumber } from '../../lib/utils';
import StatCard from '../../components/ui/StatCard';
import { DashboardStatSkeleton } from '../../components/ui/Skeleton';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const InstructorAnalytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['instructor-analytics'],
    queryFn: () => api.get('/instructor/analytics').then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-surface-900 mb-6">Analytics</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <DashboardStatSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const overview = data?.overview || {};
  const enrollmentsByMonth = data?.enrollmentsByMonth || [];
  const revenueByMonth = data?.revenueByMonth || [];
  const ratingDistribution = data?.ratingDistribution || [];
  const topCourses = data?.topCourses || [];

  // Prepare chart-like data (last 6 months)
  const enrollmentData = [...enrollmentsByMonth].reverse().slice(-6);
  const revenueData = [...revenueByMonth].reverse().slice(-6);
  const maxEnrollment = Math.max(...enrollmentData.map((d) => d.count), 1);
  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue), 1);

  // Rating distribution
  const totalRatings = ratingDistribution.reduce((s, r) => s + r.count, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Analytics</h1>
        <p className="text-sm text-surface-800/50 mt-1">
          Track your teaching performance and growth
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Total Revenue"
          value={formatPrice(overview.totalRevenue || 0)}
          icon={DollarSign}
        />
        <StatCard
          label="Total Students"
          value={formatNumber(overview.totalStudents || 0)}
          icon={Users}
        />
        <StatCard
          label="Published Courses"
          value={`${overview.publishedCourses || 0} / ${overview.totalCourses || 0}`}
          icon={BookOpen}
        />
        <StatCard
          label="Average Rating"
          value={overview.averageRating?.toFixed(1) || '0.0'}
          icon={Star}
        />
        <StatCard
          label="Total Reviews"
          value={formatNumber(overview.totalReviews || 0)}
          icon={TrendingUp}
        />
        <StatCard
          label="Total Courses"
          value={overview.totalCourses || 0}
          icon={BarChart3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Enrollment Trend */}
        <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Enrollment Trend</h2>
          {enrollmentData.length === 0 ? (
            <p className="text-sm text-surface-800/50 py-8 text-center">No enrollment data yet</p>
          ) : (
            <div className="space-y-3">
              {enrollmentData.map((item) => (
                <div key={`${item._id.year}-${item._id.month}`} className="flex items-center gap-3">
                  <span className="text-xs text-surface-800/50 w-16 shrink-0">
                    {MONTHS[item._id.month - 1]} {item._id.year}
                  </span>
                  <div className="flex-1 h-7 bg-surface-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-lg flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${Math.max((item.count / maxEnrollment) * 100, 8)}%` }}
                    >
                      <span className="text-xs font-medium text-white">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue Trend */}
        <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Revenue Trend</h2>
          {revenueData.length === 0 ? (
            <p className="text-sm text-surface-800/50 py-8 text-center">No revenue data yet</p>
          ) : (
            <div className="space-y-3">
              {revenueData.map((item) => (
                <div key={`${item._id.year}-${item._id.month}`} className="flex items-center gap-3">
                  <span className="text-xs text-surface-800/50 w-16 shrink-0">
                    {MONTHS[item._id.month - 1]} {item._id.year}
                  </span>
                  <div className="flex-1 h-7 bg-surface-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-accent-500 rounded-lg flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${Math.max((item.revenue / maxRevenue) * 100, 8)}%` }}
                    >
                      <span className="text-xs font-medium text-white">{formatPrice(item.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Rating Distribution</h2>
          {totalRatings === 0 ? (
            <p className="text-sm text-surface-800/50 py-8 text-center">No ratings yet</p>
          ) : (
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const entry = ratingDistribution.find((r) => r._id === star);
                const count = entry?.count || 0;
                const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12 shrink-0">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm text-surface-800/70">{star}</span>
                    </div>
                    <div className="flex-1 h-5 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                    <span className="text-xs text-surface-800/50 w-12 text-right">
                      {count} ({Math.round(pct)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Courses */}
        <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Top Courses</h2>
          {topCourses.length === 0 ? (
            <p className="text-sm text-surface-800/50 py-8 text-center">No published courses yet</p>
          ) : (
            <div className="space-y-3">
              {topCourses.map((course, idx) => (
                <div
                  key={course._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200/40"
                >
                  <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 truncate">
                      {course.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-surface-800/50">
                        {formatNumber(course.totalStudents)} students
                      </span>
                      {course.averageRating > 0 && (
                        <span className="text-xs text-surface-800/50 flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {course.averageRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-surface-900">
                    {formatPrice(course.price)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorAnalytics;
