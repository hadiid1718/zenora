import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(
  ({ label, error, icon: Icon, className, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-800 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-200">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-0',
              'text-surface-900 placeholder:text-surface-200',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
              'hover:border-surface-800/30',
              Icon && 'pl-10',
              error && 'border-error-500 focus:ring-error-500/30 focus:border-error-500',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-error-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
