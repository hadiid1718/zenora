import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import DataTable, { Pagination } from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { formatDate, formatPrice } from '../../lib/utils';
import toast from 'react-hot-toast';

const AdminCourses = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-courses', page],
    queryFn: () => api.get('/admin/courses/pending', { params: { page, limit: 10 } }).then((r) => r.data.data),
  });

  const approveMutation = useMutation({
    mutationFn: (courseId) => api.put(`/admin/courses/${courseId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-courses'] });
      toast.success('Course approved');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ courseId, reason }) =>
      api.put(`/admin/courses/${courseId}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-courses'] });
      toast.success('Course rejected');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const columns = [
    {
      key: 'course',
      label: 'Course',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-16 h-10 rounded-lg bg-surface-100 overflow-hidden shrink-0">
            {row.thumbnail?.url && (
              <img src={row.thumbnail.url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-surface-900 truncate max-w-xs">{row.title}</p>
            <p className="text-xs text-surface-800/40">{row.level}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'instructor',
      label: 'Instructor',
      render: (row) => (
        <span className="text-sm text-surface-800/70">
          {row.instructor?.firstName} {row.instructor?.lastName}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => <span className="text-sm">{formatPrice(row.price)}</span>,
    },
    {
      key: 'submitted',
      label: 'Submitted',
      render: (row) => (
        <span className="text-sm text-surface-800/50">{formatDate(row.updatedAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/course/${row.slug}`}
            target="_blank"
            className="p-1.5 rounded-lg text-surface-800/40 hover:text-brand-600 hover:bg-brand-50 transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => approveMutation.mutate(row._id)}
            className="p-1.5 rounded-lg text-success-600 hover:bg-success-50 transition-colors"
            title="Approve"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const reason = window.prompt('Rejection reason (optional):');
              rejectMutation.mutate({ courseId: row._id, reason: reason || undefined });
            }}
            className="p-1.5 rounded-lg text-error-600 hover:bg-error-50 transition-colors"
            title="Reject"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Course Approvals</h1>
      <DataTable
        columns={columns}
        data={data?.courses || []}
        isLoading={isLoading}
        emptyMessage="No courses pending approval"
      />

      {data?.pagination?.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default AdminCourses;
