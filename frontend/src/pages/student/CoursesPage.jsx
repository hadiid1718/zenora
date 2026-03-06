import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../../lib/api';
import CourseCard from '../../components/ui/CourseCard';
import { CourseCardSkeleton } from '../../components/ui/Skeleton';
import { Pagination } from '../../components/ui/DataTable';
import Select from '../../components/ui/Select';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

const levelOptions = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const priceOptions = [
  { value: '', label: 'Any Price' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, setFiltersOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'newest';
  const category = searchParams.get('category') || '';
  const level = searchParams.get('level') || '';
  const price = searchParams.get('price') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['courses', { page, q, sort, category, level, price }],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', '12');
      if (q) params.set('q', q);
      if (sort) params.set('sort', sort);
      if (category) params.set('category', category);
      if (level) params.set('level', level);
      if (price === 'free') params.set('maxPrice', '0');
      if (price === 'paid') params.set('minPrice', '1');
      return api.get(`/courses?${params.toString()}`).then((r) => r.data.data);
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/courses/categories').then((r) => r.data.data),
  });

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams(q ? { q } : {});
  };

  const hasFilters = category || level || price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 mb-1">
          {q ? `Search results for "${q}"` : 'Browse Courses'}
        </h1>
        <p className="text-surface-800/50">
          {data?.pagination?.total
            ? `${data.pagination.total} courses found`
            : 'Discover courses to level up your skills'}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const val = e.target.elements.search.value.trim();
            updateParam('q', val);
          }}
          className="relative w-full sm:w-80"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/40" />
          <input
            name="search"
            defaultValue={q}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-surface-0 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
          />
        </form>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-surface-200 text-sm text-surface-800/70 hover:bg-surface-50 transition-colors sm:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
          <Select
            options={sortOptions}
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters (desktop) */}
        <aside className="hidden sm:block w-56 shrink-0 space-y-6">
          <FilterGroup title="Category">
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="w-full text-sm border border-surface-200 rounded-lg px-3 py-2 bg-surface-0 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="">All Categories</option>
              {categoriesData?.categories?.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </FilterGroup>

          <FilterGroup title="Level">
            {levelOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="level"
                  value={opt.value}
                  checked={level === opt.value}
                  onChange={() => updateParam('level', opt.value)}
                  className="text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-surface-800/70">{opt.label}</span>
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="Price">
            {priceOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  value={opt.value}
                  checked={price === opt.value}
                  onChange={() => updateParam('price', opt.value)}
                  className="text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-surface-800/70">{opt.label}</span>
              </label>
            ))}
          </FilterGroup>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-error-600 hover:text-error-700"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
        </aside>

        {/* Course Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)
              : data?.courses?.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
          </div>

          {!isLoading && data?.courses?.length === 0 && (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-surface-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-surface-900 mb-1">No courses found</h3>
              <p className="text-surface-800/50 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Clear all filters
              </button>
            </div>
          )}

          {data?.pagination?.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={data.pagination.totalPages}
              onPageChange={(p) => updateParam('page', String(p))}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const FilterGroup = ({ title, children }) => (
  <div>
    <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-800/40 mb-3">
      {title}
    </h4>
    <div className="space-y-2">{children}</div>
  </div>
);

export default CoursesPage;
