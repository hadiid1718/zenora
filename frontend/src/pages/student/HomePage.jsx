import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Play, BookOpen, Users, Award, TrendingUp,
  Search, Star, Zap, GraduationCap, ChevronRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatNumber } from '../../lib/utils';
import Button from '../../components/ui/Button';
import CourseCard from '../../components/ui/CourseCard';
import { CourseCardSkeleton } from '../../components/ui/Skeleton';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: () => api.get('/courses/featured').then((r) => r.data.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/courses/categories').then((r) => r.data.data),
  });

  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ['popular-courses'],
    queryFn: () => api.get('/courses?sort=popular&limit=8').then((r) => r.data.data),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-brand-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur text-sm font-medium text-brand-200 mb-6">
                <Zap className="w-4 h-4" />
                100,000+ students already learning
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              Learn without limits,{' '}
              <span className="bg-gradient-to-r from-accent-300 to-accent-400 bg-clip-text text-transparent">
                grow without boundaries
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="text-lg text-brand-200/70 mb-8 max-w-2xl mx-auto"
            >
              Access thousands of expert-led courses, earn certificates, and advance your career
              with the most engaging online learning platform.
            </motion.p>

            <motion.form
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              onSubmit={handleSearch}
              className="flex items-center max-w-xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-1.5 border border-white/10"
            >
              <Search className="w-5 h-5 text-brand-200/50 ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to learn?"
                className="flex-1 bg-transparent px-4 py-3 text-white placeholder:text-brand-200/40 focus:outline-none text-sm"
              />
              <Button type="submit" size="md" className="shrink-0">
                Search
              </Button>
            </motion.form>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-brand-200/50"
            >
              <span>Popular:</span>
              {['JavaScript', 'Python', 'React', 'UI/UX Design'].map((tag) => (
                <Link
                  key={tag}
                  to={`/courses?q=${encodeURIComponent(tag)}`}
                  className="hover:text-white transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 56" fill="none" className="w-full">
            <path d="M0 56h1440V28C1220 0 880 56 720 56S220 0 0 28v28z" fill="var(--color-surface-50)" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, label: 'Total Courses', value: '500+' },
              { icon: Users, label: 'Active Students', value: '100K+' },
              { icon: Award, label: 'Expert Instructors', value: '200+' },
              { icon: TrendingUp, label: 'Completion Rate', value: '94%' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="flex items-center gap-4 p-4"
              >
                <div className="p-3 rounded-xl bg-brand-50">
                  <stat.icon className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-surface-900">{stat.value}</p>
                  <p className="text-sm text-surface-800/50">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Featured Courses"
            subtitle="Hand-picked courses by our team for maximum impact"
            linkTo="/courses?sort=featured"
            linkLabel="Browse all"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredLoading
              ? Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)
              : featuredData?.courses?.slice(0, 4).map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categoriesData?.categories?.length > 0 && (
        <section className="py-16 lg:py-20 bg-surface-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              title="Browse by Category"
              subtitle="Find the perfect course for your learning goals"
              linkTo="/categories"
              linkLabel="All categories"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoriesData.categories.slice(0, 8).map((cat, i) => (
                <motion.div
                  key={cat._id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
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
          </div>
        </section>
      )}

      {/* Popular Courses */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Most Popular"
            subtitle="Courses loved by thousands of learners"
            linkTo="/courses?sort=popular"
            linkLabel="See more"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularLoading
              ? Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)
              : popularData?.courses?.slice(0, 4).map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 sm:p-12 lg:p-16 text-center">
            <div className="absolute inset-0">
              <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to start teaching?
              </h2>
              <p className="text-lg text-brand-200/70 mb-8">
                Share your expertise with millions of learners worldwide. Start creating
                your first course today and earn while making an impact.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button
                  onClick={() => navigate('/teach')}
                  variant="accent"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Become an Instructor
                </Button>
                <Button
                  onClick={() => navigate('/courses')}
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/10"
                >
                  Explore Courses
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const SectionHeader = ({ title, subtitle, linkTo, linkLabel }) => (
  <div className="flex items-end justify-between mb-8">
    <div>
      <h2 className="text-2xl font-bold text-surface-900 mb-1">{title}</h2>
      {subtitle && <p className="text-surface-800/50">{subtitle}</p>}
    </div>
    {linkTo && (
      <Link
        to={linkTo}
        className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        {linkLabel} <ChevronRight className="w-4 h-4" />
      </Link>
    )}
  </div>
);

export default HomePage;
