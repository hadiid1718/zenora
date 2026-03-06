import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon: Icon, trend, trendLabel, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-surface-0 rounded-2xl p-6 border border-surface-200/60',
        'hover:shadow-card-hover transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-800/60 mb-1">{label}</p>
          <p className="text-2xl font-bold text-surface-900">{value}</p>
          {trendLabel && (
            <p className={cn(
              'text-xs font-medium mt-1',
              trend > 0 ? 'text-success-600' : trend < 0 ? 'text-error-600' : 'text-surface-800/50'
            )}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {trendLabel}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-brand-50">
            <Icon className="w-5 h-5 text-brand-600" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
