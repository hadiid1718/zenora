import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Ticket, Copy, Check } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable, { Pagination } from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { formatDate, formatPrice } from '../../lib/utils';
import toast from 'react-hot-toast';

const InstructorCoupons = () => {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxUses: '',
    expiresAt: '',
    applicableCourses: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['instructor-coupons', page],
    queryFn: () => api.get('/instructor/coupons', { params: { page, limit: 10 } }).then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/instructor/coupons', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-coupons'] });
      setShowCreate(false);
      toast.success('Coupon created');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create coupon'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/instructor/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-coupons'] });
      toast.success('Coupon deleted');
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const payload = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
    };
    if (form.maxUses) payload.maxUses = Number(form.maxUses);
    if (form.expiresAt) payload.expiresAt = form.expiresAt;
    createMutation.mutate(payload);
  };

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (row) => (
        <span className="font-mono text-sm font-medium text-surface-900">{row.code}</span>
      ),
    },
    {
      key: 'discount',
      label: 'Discount',
      render: (row) => (
        <span className="text-sm">
          {row.discountType === 'percentage' ? `${row.discountValue}%` : formatPrice(row.discountValue)}
        </span>
      ),
    },
    {
      key: 'used',
      label: 'Used',
      render: (row) => (
        <span className="text-sm">
          {row.usedCount || 0}{row.maxUses ? ` / ${row.maxUses}` : ''}
        </span>
      ),
    },
    {
      key: 'expires',
      label: 'Expires',
      render: (row) => (
        <span className="text-sm text-surface-800/50">
          {row.expiresAt ? formatDate(row.expiresAt) : 'Never'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <button
          onClick={() => deleteMutation.mutate(row._id)}
          className="p-1.5 rounded-lg text-surface-800/40 hover:text-error-600 hover:bg-error-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Coupons</h1>
        <Button icon={Plus} onClick={() => setShowCreate(true)}>
          Create Coupon
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.coupons || []}
        isLoading={isLoading}
        emptyMessage="No coupons created yet"
      />

      {data?.pagination?.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Coupon"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Coupon Code"
            placeholder="SAVE20"
            value={form.code}
            onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Discount Type"
              options={[
                { value: 'percentage', label: 'Percentage' },
                { value: 'fixed', label: 'Fixed Amount' },
              ]}
              value={form.discountType}
              onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))}
            />
            <Input
              label="Value"
              type="number"
              placeholder={form.discountType === 'percentage' ? '20' : '10.00'}
              value={form.discountValue}
              onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Uses (optional)"
              type="number"
              placeholder="100"
              value={form.maxUses}
              onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
            />
            <Input
              label="Expires At (optional)"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" isLoading={createMutation.isPending}>Create</Button>
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InstructorCoupons;
