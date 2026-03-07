import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, Download } from 'lucide-react';
import api from '../../lib/api';
import EmptyState from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/DataTable';
import { formatDate } from '../../lib/utils';

const CertificatesPage = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['certificates', page],
    queryFn: () => api.get('/student/certificates', { params: { page, limit: 10 } }).then((r) => r.data.data),
  });

  if (!isLoading && (!data?.certificates || data.certificates.length === 0)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete a course to earn your first certificate"
          action={{ label: 'My Learning', to: '/my-courses' }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-surface-900 mb-6">My Certificates</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-44 bg-surface-100 rounded-xl animate-shimmer" />
            ))
          : data.certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-surface-0 rounded-2xl border border-surface-200/60 p-6 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-brand-50 shrink-0">
                    <Award className="w-6 h-6 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-surface-900 mb-1 line-clamp-2">
                      {cert.course?.title}
                    </h3>
                    <p className="text-xs text-surface-800/50 mb-3">
                      Completed on {formatDate(cert.issuedAt)}
                    </p>
                    <p className="text-xs text-surface-800/40 mb-3">
                      Certificate #{cert.certificateNumber}
                    </p>
                    {cert.pdfUrl && (
                      <a
                        href={cert.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        <Download className="w-3.5 h-3.5" /> Download PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
      </div>

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

export default CertificatesPage;
