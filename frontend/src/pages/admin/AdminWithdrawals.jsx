import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../../lib/api';
import DataTable from '../../components/ui/DataTable';
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

  const { data, isLoading } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: () => api.get('/admin/withdrawals').then((r) => r.data.data),
  });

  const processMutation = useMutation({
    mutationFn: ({ id, status, note }) =>
      api.patch(`/admin/withdrawals/${id}/process`, { status, adminNote: note }),
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
                processMutation.mutate({ id: row._id, status: 'completed' })
              }
              className="p-1.5 rounded-lg text-success-600 hover:bg-success-50 transition-colors"
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const note = window.prompt('Rejection reason:');
                processMutation.mutate({
                  id: row._id,
                  status: 'rejected',
                  note: note || undefined,
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
    </div>
  );
};

export default AdminWithdrawals;
