import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, Plus, ArrowDownRight } from 'lucide-react';
import api from '../../lib/api';
import { formatPrice, formatDate } from '../../lib/utils';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';
import toast from 'react-hot-toast';

const statusVariant = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  completed: 'brand',
};

const InstructorWithdrawals = () => {
  const queryClient = useQueryClient();
  const [showRequest, setShowRequest] = useState(false);
  const [amount, setAmount] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['instructor-withdrawals'],
    queryFn: () => api.get('/instructor/withdrawals').then((r) => r.data.data),
  });

  const requestMutation = useMutation({
    mutationFn: (amount) => api.post('/instructor/withdrawals', { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-withdrawals'] });
      setShowRequest(false);
      setAmount('');
      toast.success('Withdrawal requested');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Request failed'),
  });

  const columns = [
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => <span className="text-sm font-medium">{formatPrice(row.amount)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={statusVariant[row.status]}>{row.status}</Badge>,
    },
    {
      key: 'createdAt',
      label: 'Requested',
      render: (row) => <span className="text-sm text-surface-800/50">{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'processedAt',
      label: 'Processed',
      render: (row) => (
        <span className="text-sm text-surface-800/50">
          {row.processedAt ? formatDate(row.processedAt) : '—'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Withdrawals</h1>
        <Button icon={ArrowDownRight} onClick={() => setShowRequest(true)}>
          Request Withdrawal
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Available Balance"
          value={formatPrice(data?.balance || 0)}
          icon={Wallet}
        />
        <StatCard
          label="Total Withdrawn"
          value={formatPrice(data?.totalWithdrawn || 0)}
          icon={ArrowDownRight}
        />
        <StatCard
          label="Pending"
          value={formatPrice(data?.pendingAmount || 0)}
          icon={Wallet}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.withdrawals || []}
        isLoading={isLoading}
        emptyMessage="No withdrawal requests"
      />

      <Modal isOpen={showRequest} onClose={() => setShowRequest(false)} title="Request Withdrawal">
        <div className="space-y-4">
          <p className="text-sm text-surface-800/60">
            Available balance: <strong>{formatPrice(data?.balance || 0)}</strong>
          </p>
          <Input
            label="Amount (USD)"
            type="number"
            min="1"
            step="0.01"
            placeholder="50.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => requestMutation.mutate(Number(amount))}
              isLoading={requestMutation.isPending}
            >
              Submit Request
            </Button>
            <Button variant="ghost" onClick={() => setShowRequest(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InstructorWithdrawals;
