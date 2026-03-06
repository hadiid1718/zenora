import { cn, getInitials } from '../../lib/utils';

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-xl',
};

const Avatar = ({ src, firstName, lastName, size = 'md', className }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={cn(
          'rounded-full object-cover ring-2 ring-surface-100',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold',
        'gradient-brand text-white',
        sizes[size],
        className
      )}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
};

export default Avatar;
