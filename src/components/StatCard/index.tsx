import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export default function StatCard({
  title,
  value,
  unit,
  change,
  changeLabel = '同比',
  icon,
  color = 'primary',
}: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-500',
    success: 'bg-success-50 text-success-500',
    warning: 'bg-warning-50 text-warning-500',
    danger: 'bg-danger-50 text-danger-500',
  };

  const getChangeColor = () => {
    if (change === undefined || change === 0) return 'text-neutral-400';
    if (title.includes('感染') || title.includes('使用强度')) {
      return change > 0 ? 'text-danger-500' : 'text-success-500';
    }
    return change > 0 ? 'text-success-500' : 'text-danger-500';
  };

  const getChangeIcon = () => {
    if (change === undefined || change === 0) return <Minus className="w-3 h-3" />;
    if (change > 0) return <TrendingUp className="w-3 h-3" />;
    return <TrendingDown className="w-3 h-3" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-neutral-400 mb-2">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-neutral-700">{value}</span>
            {unit && <span className="text-sm text-neutral-400">{unit}</span>}
          </div>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs', getChangeColor())}>
              {getChangeIcon()}
              <span>
                {changeLabel} {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', colorClasses[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
