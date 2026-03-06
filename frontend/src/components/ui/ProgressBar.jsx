import { cn } from '../../lib/utils';

const ProgressBar = ({ value = 0, max = 100, size = 'md', color = 'brand', showLabel = false, className }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colors = {
    brand: 'bg-brand-600',
    accent: 'bg-accent-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs font-medium text-surface-800/60 mb-1">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-surface-100 overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
