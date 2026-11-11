import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  delta?: {
    value: number;
    label: string;
    isGood?: boolean;
  };
  benchmarkStatus?: 'optimal' | 'warning' | 'alert';
  benchmarkText?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  sparklineData?: number[];
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  delta,
  benchmarkStatus = 'optimal',
  benchmarkText,
  icon: Icon,
  iconBgColor = 'bg-indigo-50 dark:bg-indigo-950/60',
  iconColor = 'text-indigo-600 dark:text-indigo-400',
  sparklineData,
}) => {
  const getBadgeStyle = () => {
    switch (benchmarkStatus) {
      case 'optimal':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'alert':
        return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          <div className={`w-9 h-9 rounded-lg ${iconBgColor} ${iconColor} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </span>
          {unit && <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{unit}</span>}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-1 text-xs">
        {/* Delta change or Benchmark */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {delta && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                delta.value > 0
                  ? delta.isGood !== false
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                  : delta.value < 0
                  ? delta.isGood !== false
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {delta.value > 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : delta.value < 0 ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              {delta.value > 0 ? `+${delta.value}%` : `${delta.value}%`}
            </span>
          )}

          {benchmarkText && (
            <span className={`px-2 py-0.5 rounded-full font-medium border text-[11px] ${getBadgeStyle()}`}>
              {benchmarkText}
            </span>
          )}
        </div>

        {subtitle && <span className="text-slate-400 dark:text-slate-500 text-[11px] truncate max-w-[140px]">{subtitle}</span>}
      </div>

      {/* Mini Sparkline Visualization if provided */}
      {sparklineData && sparklineData.length > 1 && (
        <div className="mt-3 h-6 flex items-end gap-1">
          {sparklineData.map((val, idx) => {
            const min = Math.min(...sparklineData);
            const max = Math.max(...sparklineData);
            const heightPct = max === min ? 50 : Math.max(15, Math.round(((val - min) / (max - min)) * 100));
            return (
              <div
                key={idx}
                className="flex-1 bg-indigo-100 dark:bg-indigo-950/80 hover:bg-indigo-300 dark:hover:bg-indigo-800 rounded-t-xs transition-colors relative group"
                style={{ height: `${heightPct}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {val.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
