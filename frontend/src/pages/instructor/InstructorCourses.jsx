import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Edit, Eye, MoreHorizontal } from 'lucide-react';
import api from '../../lib/api';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable, { Pagination } from '../../components/ui/DataTable';
import { formatPrice, formatDate, formatNumber } from '../../lib/utils';

const statusVariant = {
  draft: 'default',
  pending: 'warning',
  approved: 'success',
  published: 'brand',
  rejected: 'error',
};

const InstructorCourses = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['instructor-courses', page],
    queryFn: () => api.get('/courses/instructor/my-courses', { params: { page, limit: 10 } }).then((r) => r.data.data),
  });

  const columns = [
    {
      key: 'title',
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
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={statusVariant[row.status]}>{row.status}</Badge>,
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => <span className="text-sm">{formatPrice(row.price)}</span>,
    },
    {
      key: 'totalStudents',
      label: 'Students',
      render: (row) => <span className="text-sm">{formatNumber(row.totalStudents || 0)}</span>,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => <span className="text-sm text-surface-800/50">{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/course/${row.slug}`}
            className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-800/40 hover:text-surface-900 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            to={`/instructor/courses/${row._id}/edit`}
            className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-800/40 hover:text-surface-900 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-900">My Courses</h1>
        <Link to="/instructor/courses/new">
          <Button icon={Plus}>Create Course</Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data?.courses || []}
        isLoading={isLoading}
        emptyMessage="No courses created yet"
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

export default InstructorCourses;
