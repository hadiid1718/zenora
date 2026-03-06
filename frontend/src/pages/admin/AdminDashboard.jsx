import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, Users, BookOpen, ShieldCheck, TrendingUp,
} from 'lucide-react';
import api from '../../lib/api';
import { formatPrice, formatNumber } from '../../lib/utils';
import StatCard from '../../components/ui/StatCard';
import { DashboardStatSkeleton } from '../../components/ui/Skeleton';

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-surface-900 mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <DashboardStatSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue || 0)}
          icon={DollarSign}
        />
        <StatCard
          label="Total Users"
          value={formatNumber(stats.totalUsers || 0)}
          icon={Users}
        />
        <StatCard
          label="Total Courses"
          value={formatNumber(stats.totalCourses || 0)}
          icon={BookOpen}
        />
        <StatCard
          label="Active Instructors"
          value={formatNumber(stats.totalInstructors || 0)}
          icon={ShieldCheck}
        />
      </div>

      {/* Monthly revenue chart placeholder */}
      {data?.monthlyRevenue?.length > 0 && (
        <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6 mb-8">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Monthly Revenue</h2>
          <div className="flex items-end gap-2 h-48">
            {data.monthlyRevenue.map((item, i) => {
              const maxVal = Math.max(...data.monthlyRevenue.map((m) => m.revenue));
              const height = maxVal > 0 ? (item.revenue / maxVal) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-surface-800/40">
                    {formatPrice(item.revenue)}
                  </span>
                  <div
                    className="w-full rounded-t-lg gradient-brand transition-all duration-300"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-xs text-surface-800/40">
                    {item.month}/{item.year}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6">
          <h3 className="text-sm font-semibold text-surface-900 mb-2">Pending Courses</h3>
          <p className="text-3xl font-bold text-warning-600">{stats.pendingCourses || 0}</p>
          <p className="text-xs text-surface-800/40 mt-1">Awaiting review</p>
        </div>
        <div className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6">
          <h3 className="text-sm font-semibold text-surface-900 mb-2">Pending Instructors</h3>
          <p className="text-3xl font-bold text-warning-600">{stats.pendingInstructors || 0}</p>
          <p className="text-xs text-surface-800/40 mt-1">Awaiting approval</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
