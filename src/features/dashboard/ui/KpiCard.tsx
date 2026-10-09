import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
    isPositive?: boolean;
  };
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'purple';
  sparklineData?: number[];
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  variant = 'default',
  sparklineData = [20, 35, 25, 45, 30, 60, 50, 75],
  className,
}) => {
  const getIconStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#0071E3]/10 text-[#0071E3]';
      case 'success':
        return 'bg-[#34C759]/10 text-[#34C759]';
      case 'warning':
        return 'bg-[#FF9500]/10 text-[#FF9500]';
      case 'purple':
        return 'bg-[#AF52DE]/10 text-[#AF52DE]';
      default:
        return 'bg-[#F5F5F7] text-[#1D1D1F]';
    }
  };

  const getSparklineColor = () => {
    switch (variant) {
      case 'primary':
        return '#0071E3';
      case 'success':
        return '#34C759';
      case 'warning':
        return '#FF9500';
      case 'purple':
        return '#AF52DE';
      default:
        return '#86868B';
    }
  };

  // Convert sparkline numbers to SVG polyline path
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const svgWidth = 84;
  const svgHeight = 26;

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * svgWidth;
      const y = svgHeight - ((val - minVal) / range) * (svgHeight - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  const isPos = change?.isPositive !== false && change?.trend === 'up';

  return (
    <div
      className={cn(
        "group rounded-[28px] sm:rounded-[32px] bg-white border border-black/[0.04] shadow-[0_8px_30px_-10px_rgba(0,0,0,0.04)] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_36px_-10px_rgba(0,0,0,0.07)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className={cn("size-11 sm:size-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110", getIconStyles())}>
          <Icon className="size-5 sm:size-6" />
        </div>

        {change && (
          <span
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-bold tracking-wider inline-flex items-center gap-1",
              isPos
                ? "bg-[#34C759]/10 text-[#34C759]"
                : "bg-[#FF3B30]/10 text-[#FF3B30]"
            )}
          >
            {isPos ? <ArrowUpRight className="size-3 stroke-[2.5]" /> : <TrendingDown className="size-3" />}
            {change.value}
          </span>
        )}
      </div>

      <div className="mt-5 space-y-1">
        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#86868B] opacity-70">
          {title}
        </p>
        <h4 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-[#1D1D1F] tabular-nums">
          {value}
        </h4>

        {subtitle && (
          <p className="text-xs sm:text-sm font-medium text-[#86868B] leading-relaxed pt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Subtle Embedded Sparkline */}
      <div className="mt-4 pt-3 border-t border-black/[0.04] flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">
          Tendencia 7D
        </span>
        <div className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <svg width={svgWidth} height={svgHeight} className="overflow-visible">
            <polyline
              fill="none"
              stroke={getSparklineColor()}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
export default KpiCard;
