import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../../../shared/ui/Card';

export interface SparklinePoint {
  x: string;
  y: number;
}

export interface NivoSparklineCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
    isPositive?: boolean;
  };
  icon: LucideIcon;
  sparklineData: SparklinePoint[];
  color: string;
  variant?: 'primary' | 'success' | 'warning' | 'purple';
}

export const NivoSparklineCard: React.FC<NivoSparklineCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  sparklineData,
  color = '#2563EB',
  variant = 'primary',
}) => {
  const getIconStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-50 text-blue-600 border-blue-200/60';
      case 'success':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200/60';
      case 'warning':
        return 'bg-amber-50 text-amber-600 border-amber-200/60';
      case 'purple':
        return 'bg-purple-50 text-purple-600 border-purple-200/60';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200/80';
    }
  };

  const nivoFormatted = [
    {
      id: title,
      color,
      data: sparklineData,
    },
  ];

  return (
    <Card
      variant="default"
      padding="md"
      className="relative overflow-hidden bg-white/90 backdrop-blur-xl shadow-2xs hover:shadow-md transition-all duration-300 border-slate-200/80 rounded-2xl flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {value}
            </span>
            {change && (
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
                  change.trend === 'up'
                    ? change.isPositive !== false
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                    : change.trend === 'down'
                    ? change.isPositive !== false
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                    : 'text-slate-500'
                }`}
              >
                {change.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : change.trend === 'down' ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
                {change.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-2 rounded-xl border shrink-0 ${getIconStyles()}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Minimalist Nivo Sparkline Chart */}
      <div className="h-12 w-full mt-3">
        <ResponsiveLine
          data={nivoFormatted}
          margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
          curve="natural"
          axisTop={null}
          axisRight={null}
          axisBottom={null}
          axisLeft={null}
          enableGridX={false}
          enableGridY={false}
          colors={[color]}
          lineWidth={2.5}
          enableArea={true}
          areaOpacity={0.12}
          enablePoints={false}
          useMesh={true}
          tooltip={({ point }: any) => (
            <div className="bg-slate-900 text-white px-2 py-1 rounded-lg text-[10px] font-mono shadow-md">
              {point.data.x}: {point.data.y}
            </div>
          )}
        />
      </div>
    </Card>
  );
};
