import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const variants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 shadow-md hover:shadow-lg hover:shadow-brand-600/25 active:scale-[0.98]',
  secondary:
    'bg-surface-100 text-surface-900 hover:bg-surface-200 active:scale-[0.98]',
  accent:
    'gradient-brand text-white hover:opacity-90 shadow-md hover:shadow-lg active:scale-[0.98]',
  ghost:
    'bg-transparent text-surface-800 hover:bg-surface-100 active:scale-[0.98]',
  outline:
    'border-2 border-brand-600 text-brand-600 hover:bg-brand-50 active:scale-[0.98]',
  danger:
    'bg-error-500 text-white hover:bg-error-600 active:scale-[0.98]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
  xl: 'px-9 py-4 text-lg rounded-2xl gap-3',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      className,
      isLoading,
      disabled,
      icon: Icon,
      iconRight: IconRight,
      fullWidth,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : Icon ? (
          <Icon className="w-4 h-4 shrink-0" />
        ) : null}
        {children}
        {IconRight && !isLoading && <IconRight className="w-4 h-4 shrink-0" />}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
