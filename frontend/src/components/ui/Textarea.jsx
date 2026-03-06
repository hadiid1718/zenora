import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Textarea = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-800 mb-1.5">{label}</label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-[var(--radius-input)] border bg-surface-0 text-surface-900',
          'px-4 py-2.5 text-sm placeholder:text-surface-800/40 transition-all resize-y min-h-[100px]',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400',
          error
            ? 'border-error-500 focus:ring-error-500/30 focus:border-error-500'
            : 'border-surface-200 hover:border-surface-300',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-error-600">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
