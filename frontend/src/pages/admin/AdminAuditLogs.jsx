import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import api from '../../lib/api';
import DataTable from '../../components/ui/DataTable';
import { Pagination } from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';

const actionColors = {
  create: 'green',
  update: 'blue',
  delete: 'red',
  approve: 'green',
  reject: 'red',
  login: 'default',
};

const AdminAuditLogs = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', page],
    queryFn: () =>
      api.get('/admin/audit-logs', { params: { page, limit: 20 } }).then((r) => r.data.data),
    keepPreviousData: true,
  });

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (row) => (
        <span className="text-sm font-medium text-surface-900">
          {row.user?.firstName} {row.user?.lastName}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <Badge variant={actionColors[row.action] || 'default'}>
          {row.action}
        </Badge>
      ),
    },
    {
      key: 'resource',
      label: 'Resource',
      render: (row) => (
        <span className="text-sm text-surface-800/70 capitalize">{row.resource}</span>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      render: (row) => (
        <span className="text-sm text-surface-800/50 truncate max-w-xs block">
          {row.details || '—'}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => (
        <span className="text-sm text-surface-800/50">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-brand-50">
          <Shield className="w-5 h-5 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-surface-900">Audit Logs</h1>
      </div>

      <DataTable
        columns={columns}
        data={data?.logs || []}
        isLoading={isLoading}
        emptyMessage="No audit logs yet"
      />

      {data?.pagination && data.pagination.pages > 1 && (
        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={data.pagination.pages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
