import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i, duration: 0.4, ease: 'easeOut' },
  }),
};

const CategoriesPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/courses/categories').then((r) => r.data.data),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-surface-900 mb-2">All Categories</h1>
      <p className="text-surface-800/60 mb-8">Find the perfect course for your learning goals</p>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-surface-100 animate-pulse" />
          ))}
        </div>
      ) : !data?.categories?.length ? (
        <p className="text-surface-800/50 text-center py-12">No categories available</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.categories.map((cat, i) => (
            <motion.div
              key={cat._id}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i * 0.05}
            >
              <Link
                to={`/courses?category=${cat._id}`}
                className="group flex items-center gap-3 p-4 rounded-xl border border-surface-200/60 bg-surface-0 hover:border-brand-200 hover:shadow-card-hover transition-all"
              >
                <div className="p-2.5 rounded-lg bg-brand-50 group-hover:bg-brand-100 transition-colors">
                  <GraduationCap className="w-5 h-5 text-brand-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{cat.name}</p>
                  <p className="text-xs text-surface-800/40">{cat.courseCount || 0} courses</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
