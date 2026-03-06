import { cn } from '../../lib/utils';
import { FileQuestion } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = FileQuestion,
  title = 'Nothing here yet',
  description = '',
  action,
  actionLabel = 'Get Started',
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-surface-900 mb-1">{title}</h3>
      {description && (
        <p className="text-surface-800/60 max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
