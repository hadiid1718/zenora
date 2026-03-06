import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award } from 'lucide-react';
import api from '../../lib/api';
import ProgressBar from '../../components/ui/ProgressBar';
import EmptyState from '../../components/ui/EmptyState';
import { CourseCardSkeleton } from '../../components/ui/Skeleton';


const MyCoursesPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['enrolled-courses'],
    queryFn: () => api.get('/student/courses').then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-surface-900 mb-6">My Learning</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-surface-900 mb-6">My Learning</h1>

      {!data?.enrollments?.length ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Start learning by enrolling in a course"
          action={{ label: 'Browse Courses', to: '/courses' }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.enrollments.map((enrollment) => (
            <Link
              key={enrollment._id}
              to={`/learn/${enrollment.course?._id}`}
              className="group bg-surface-0 rounded-2xl border border-surface-200/60 overflow-hidden hover:shadow-card-hover transition-all"
            >
              <div className="aspect-video bg-surface-100 relative overflow-hidden">
                {enrollment.course?.thumbnail?.url && (
                  <img
                    src={enrollment.course.thumbnail.url}
                    alt={enrollment.course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                {enrollment.progress === 100 && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-success-500 text-white text-xs font-medium">
                    <Award className="w-3 h-3" /> Completed
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-surface-900 mb-2 line-clamp-2 group-hover:text-brand-700 transition-colors">
                  {enrollment.course?.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-surface-800/50 mb-3">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {enrollment.completedLessons?.length || 0} / {enrollment.course?.totalLessons || 0} lessons
                  </span>
                </div>
                <ProgressBar value={enrollment.progress || 0} size="sm" showLabel />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
