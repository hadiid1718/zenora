import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserX, UserCheck, Search } from 'lucide-react';
import api from '../../lib/api';
import DataTable, { Pagination } from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => {
      const params = new URLSearchParams({ page, limit: '10' });
      if (search) params.set('q', search);
      return api.get(`/admin/users?${params}`).then((r) => r.data.data);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (userId) => api.patch(`/admin/users/${userId}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={row.avatar?.url}
            firstName={row.firstName}
            lastName={row.lastName}
            size="sm"
          />
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
      key: 'role',
      label: 'Role',
      render: (row) => (
        <Badge variant={row.role === 'admin' ? 'brand' : row.role === 'instructor' ? 'accent' : 'default'}>
          {row.role}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'error'}>
          {row.isActive ? 'Active' : 'Suspended'}
        </Badge>
      ),
    },
    {
      key: 'joined',
      label: 'Joined',
      render: (row) => (
        <span className="text-sm text-surface-800/50">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) =>
        row.role !== 'admin' && (
          <button
            onClick={() => toggleMutation.mutate(row._id)}
            className={`p-1.5 rounded-lg transition-colors ${
              row.isActive
                ? 'text-surface-800/40 hover:text-error-600 hover:bg-error-50'
                : 'text-surface-800/40 hover:text-success-600 hover:bg-success-50'
            }`}
            title={row.isActive ? 'Suspend' : 'Activate'}
          >
            {row.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </button>
        ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Users</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/40" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.users || []}
        isLoading={isLoading}
        emptyMessage="No users found"
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

export default AdminUsers;
