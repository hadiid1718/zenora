import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BookOpen, Award, Clock, Settings, Mail,
  Globe, Star,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { formatDate } from '../../lib/utils';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';

const ProfilePage = () => {
  const { user } = useAuthStore();

  const { data: enrollmentsData } = useQuery({
    queryKey: ['my-enrollments-profile'],
    queryFn: () => api.get('/student/courses?limit=6').then((r) => r.data.data),
  });

  const { data: certificatesData } = useQuery({
    queryKey: ['my-certificates-profile'],
    queryFn: () => api.get('/student/certificates').then((r) => r.data.data),
  });

  const enrollments = enrollmentsData?.enrollments || [];
  const certificates = certificatesData?.certificates || [];

  const stats = [
    {
      label: 'Enrolled Courses',
      value: enrollmentsData?.pagination?.totalItems || enrollments.length,
      icon: BookOpen,
      color: 'text-brand-600 bg-brand-50',
    },
    {
      label: 'Certificates',
      value: certificates.length,
      icon: Award,
      color: 'text-success-600 bg-success-50',
    },
    {
      label: 'Completed',
      value: enrollments.filter((e) => e.isCompleted).length,
      icon: Star,
      color: 'text-warning-600 bg-warning-50',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-surface-0 rounded-2xl border border-surface-200/60 overflow-hidden shadow-card">
        <div className="h-32 gradient-hero" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <Avatar
              src={user?.avatar?.url}
              firstName={user?.firstName}
              lastName={user?.lastName}
              size="xl"
              className="ring-4 ring-surface-0"
            />
            <div className="flex-1 sm:pb-1">
              <h1 className="text-2xl font-bold text-surface-900">
                {user?.firstName} {user?.lastName}
              </h1>
              {user?.headline && (
                <p className="text-sm text-surface-800/60 mt-0.5">{user.headline}</p>
              )}
            </div>
            <Link to="/settings">
              <Button variant="outline" size="sm" icon={Settings}>
                Edit Profile
              </Button>
            </Link>
          </div>

          {/* Bio & info */}
          <div className="mt-6 space-y-3">
            {user?.bio && (
              <p className="text-sm text-surface-800/70 leading-relaxed">{user.bio}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-surface-800/50">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {user?.email}
              </span>
              {user?.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-brand-600 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Joined {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-0 rounded-2xl border border-surface-200/60 p-5 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
              <p className="text-xs text-surface-800/50">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Enrolled Courses */}
      {enrollments.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-surface-900">My Learning</h2>
            <Link to="/my-courses" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.map((enrollment) => (
              <Link
                key={enrollment._id}
                to={`/learn/${enrollment.course?._id}`}
                className="bg-surface-0 rounded-2xl border border-surface-200/60 overflow-hidden hover:shadow-card-hover transition-shadow group"
              >
                <div className="aspect-video bg-surface-100 relative">
                  <img
                    src={enrollment.course?.thumbnail?.url || '/placeholder-course.jpg'}
                    alt={enrollment.course?.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-surface-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
                    {enrollment.course?.title}
                  </h3>
                  <p className="text-xs text-surface-800/50 mt-1">
                    {enrollment.course?.instructor?.firstName} {enrollment.course?.instructor?.lastName}
                  </p>
                  <div className="mt-3">
                    <ProgressBar
                      value={enrollment.progress?.percentage || 0}
                      size="sm"
                      color="brand"
                    />
                    <p className="text-xs text-surface-800/50 mt-1">
                      {Math.round(enrollment.progress?.percentage || 0)}% complete
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-surface-900">Certificates</h2>
            <Link to="/certificates" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certificates.slice(0, 4).map((cert) => (
              <div
                key={cert._id}
                className="bg-surface-0 rounded-2xl border border-surface-200/60 p-5 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-warning-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-surface-900 truncate">
                    {cert.course?.title}
                  </h3>
                  <p className="text-xs text-surface-800/50 mt-0.5">
                    Issued {formatDate(cert.issuedAt || cert.createdAt)}
                  </p>
                </div>
                <Badge variant="success" className="shrink-0">Earned</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
