import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ label, error, options = [], placeholder, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-800 mb-1.5">{label}</label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-[var(--radius-input)] border bg-surface-0 text-surface-900',
            'px-4 py-2.5 pr-10 text-sm transition-all',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400',
            error
              ? 'border-error-500 focus:ring-error-500/30 focus:border-error-500'
              : 'border-surface-200 hover:border-surface-300',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/40 pointer-events-none" />
      </div>
      {error && <p className="mt-1 text-xs text-error-600">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
