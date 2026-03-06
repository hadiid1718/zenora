import { cn } from '../../lib/utils';

const Skeleton = ({ className, ...props }) => (
  <div
    className={cn('animate-shimmer rounded-xl', className)}
    {...props}
  />
);

export const CourseCardSkeleton = () => (
  <div className="bg-surface-0 rounded-2xl overflow-hidden border border-surface-200/60">
    <Skeleton className="aspect-video w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-full rounded-lg" />
      <Skeleton className="h-5 w-3/4 rounded-lg" />
      <Skeleton className="h-4 w-1/2 rounded-lg" />
      <Skeleton className="h-4 w-2/3 rounded-lg" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-lg" />
        <Skeleton className="h-6 w-12 rounded-lg" />
      </div>
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full rounded-md" />
      </td>
    ))}
  </tr>
);

export const DashboardStatSkeleton = () => (
  <div className="bg-surface-0 rounded-2xl p-6 border border-surface-200/60">
    <Skeleton className="h-4 w-24 mb-3 rounded-md" />
    <Skeleton className="h-8 w-32 rounded-md" />
  </div>
);

export default Skeleton;
