import { cn } from '../../lib/utils';

const Tabs = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('border-b border-surface-200', className)}>
      <div className="flex gap-0 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.value
                ? 'text-brand-700'
                : 'text-surface-800/50 hover:text-surface-800/80'
            )}
          >
            <span className="flex items-center gap-2">
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-md text-xs font-medium',
                    activeTab === tab.value
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-surface-100 text-surface-800/50'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {/* Active indicator */}
            {activeTab === tab.value && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 gradient-brand rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
