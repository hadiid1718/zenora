import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({ columns, data, isLoading, emptyMessage = 'No data found' }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-surface-200/60 bg-surface-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-50 border-b border-surface-200/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-800/50',
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 rounded bg-surface-100 animate-shimmer w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data?.length > 0 ? (
            data.map((row, i) => (
              <tr
                key={row._id || i}
                className="hover:bg-surface-50/60 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 text-surface-800', col.cellClassName)}>
                    {col.render ? col.render(row, i) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-surface-800/40">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 2;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg text-surface-800/60 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-surface-800/40 text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
              page === p
                ? 'gradient-brand text-white shadow-sm'
                : 'text-surface-800/60 hover:bg-surface-100'
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg text-surface-800/60 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default DataTable;
