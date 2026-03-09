import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../../lib/api';
import DataTable, { Pagination } from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { formatDate, formatPrice } from '../../lib/utils';
import toast from 'react-hot-toast';

const statusMap = {
  pending: 'warning',
  completed: 'green',
  rejected: 'red',
};

const AdminWithdrawals = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-withdrawals', page],
    queryFn: () => api.get('/admin/withdrawals', { params: { page, limit: 10 } }).then((r) => r.data.data),
  });

  const processMutation = useMutation({
    mutationFn: ({ id, action, reason }) =>
      api.put(`/admin/withdrawals/${id}/process`, { action, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      toast.success('Withdrawal processed');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const columns = [
    {
      key: 'instructor',
      label: 'Instructor',
      render: (row) => (
        <span className="text-sm font-medium text-surface-900">
          {row.instructor?.firstName} {row.instructor?.lastName}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => <span className="text-sm font-semibold">{formatPrice(row.amount)}</span>,
    },
    {
      key: 'method',
      label: 'Method',
      render: (row) => <span className="text-sm text-surface-800/70 capitalize">{row.method}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusMap[row.status] || 'default'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'date',
      label: 'Requested',
      render: (row) => (
        <span className="text-sm text-surface-800/50">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) =>
        row.status === 'pending' && (
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                processMutation.mutate({ id: row._id, action: 'approve' })
              }
              className="p-1.5 rounded-lg text-success-600 hover:bg-success-50 transition-colors"
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const reason = window.prompt('Rejection reason:');
                processMutation.mutate({
                  id: row._id,
                  action: 'reject',
                  reason: reason || undefined,
                });
              }}
              className="p-1.5 rounded-lg text-error-600 hover:bg-error-50 transition-colors"
              title="Reject"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Withdrawals</h1>
      <DataTable
        columns={columns}
        data={data?.withdrawals || []}
        isLoading={isLoading}
        emptyMessage="No withdrawal requests"
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

export default AdminWithdrawals;
