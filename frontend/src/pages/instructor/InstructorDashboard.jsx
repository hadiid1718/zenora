import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  DollarSign, Users, BookOpen, Star, TrendingUp, ArrowUpRight,
} from 'lucide-react';
import api from '../../lib/api';
import { formatPrice, formatNumber } from '../../lib/utils';
import StatCard from '../../components/ui/StatCard';
import { DashboardStatSkeleton } from '../../components/ui/Skeleton';

const InstructorDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['instructor-dashboard'],
    queryFn: () => api.get('/instructor/dashboard').then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-surface-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <DashboardStatSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue || 0)}
          icon={DollarSign}
          trend={stats.revenueTrend}
          trendLabel={stats.revenueTrend ? `${stats.revenueTrend}% this month` : undefined}
        />
        <StatCard
          label="Total Students"
          value={formatNumber(stats.totalStudents || 0)}
          icon={Users}
        />
        <StatCard
          label="Active Courses"
          value={stats.totalCourses || 0}
          icon={BookOpen}
        />
        <StatCard
          label="Average Rating"
          value={stats.averageRating?.toFixed(1) || '0.0'}
          icon={Star}
        />
      </div>

      {/* Recent enrollments */}
      {data?.recentEnrollments?.length > 0 && (
        <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Recent Enrollments</h2>
          <div className="space-y-3">
            {data.recentEnrollments.map((enrollment) => (
              <div
                key={enrollment._id}
                className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0"
              >
                <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
                  {enrollment.student?.firstName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-900 truncate">
                    {enrollment.student?.firstName} {enrollment.student?.lastName}
                  </p>
                  <p className="text-xs text-surface-800/50 truncate">
                    enrolled in {enrollment.course?.title}
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-success-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
