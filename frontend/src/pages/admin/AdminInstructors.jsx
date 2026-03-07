import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, ShieldCheck } from 'lucide-react';
import api from '../../lib/api';
import DataTable, { Pagination } from '../../components/ui/DataTable';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

const AdminInstructors = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-instructors', page],
    queryFn: () => api.get('/admin/instructors/pending', { params: { page, limit: 10 } }).then((r) => r.data.data),
  });

  const approveMutation = useMutation({
    mutationFn: (userId) => api.put(`/admin/instructors/${userId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-instructors'] });
      toast.success('Instructor approved');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: (userId) => api.patch(`/admin/instructors/${userId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-instructors'] });
      toast.success('Application rejected');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const columns = [
    {
      key: 'user',
      label: 'Applicant',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={row.firstName} lastName={row.lastName} size="sm" />
          <div>
            <p className="text-sm font-medium text-surface-900">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-xs text-surface-800/40">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'bio',
      label: 'Bio',
      render: (row) => (
        <p className="text-sm text-surface-800/60 max-w-xs truncate">{row.bio || '—'}</p>
      ),
    },
    {
      key: 'expertise',
      label: 'Expertise',
      render: (row) => (
        <p className="text-sm text-surface-800/60 max-w-xs truncate">
          {row.expertise?.join(', ') || '—'}
        </p>
      ),
    },
    {
      key: 'applied',
      label: 'Applied',
      render: (row) => (
        <span className="text-sm text-surface-800/50">{formatDate(row.instructorAppliedAt || row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => approveMutation.mutate(row._id)}
            className="p-1.5 rounded-lg text-success-600 hover:bg-success-50 transition-colors"
            title="Approve"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => rejectMutation.mutate(row._id)}
            className="p-1.5 rounded-lg text-error-600 hover:bg-error-50 transition-colors"
            title="Reject"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (!isLoading && (!data?.instructors || data.instructors.length === 0)) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-surface-900 mb-6">Instructor Applications</h1>
        <EmptyState
          icon={ShieldCheck}
          title="No pending applications"
          description="All instructor applications have been processed"
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Instructor Applications</h1>
      <DataTable
        columns={columns}
        data={data?.instructors || []}
        isLoading={isLoading}
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

export default AdminInstructors;
