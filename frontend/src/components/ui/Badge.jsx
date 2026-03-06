import { cn } from '../../lib/utils';

const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-surface-100 text-surface-800',
    brand: 'bg-brand-100 text-brand-700',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    error: 'bg-error-50 text-error-600',
    accent: 'bg-accent-100 text-accent-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
