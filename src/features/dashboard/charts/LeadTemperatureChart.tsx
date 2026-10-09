import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from 'recharts';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import {
  CHART_COLORS,
  ChartSkeletonLoader,
  ChartEmptyState,
} from './chartTheme';
import { Flame } from 'lucide-react';

export interface LeadTemperatureDataPoint {
  name: string;
  value: number;
  key: 'hot' | 'warm' | 'cold';
}

export interface LeadTemperatureChartProps {
  data?: LeadTemperatureDataPoint[];
  isLoading?: boolean;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export const LeadTemperatureChart: React.FC<LeadTemperatureChartProps> = ({
  data = [],
  isLoading = false,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  if (isLoading) return <ChartSkeletonLoader height={260} />;
  if (!data || data.length === 0) {
    return <ChartEmptyState message="No hay prospectos con temperatura calificada." icon={<Flame className="w-6 h-6" />} />;
  }

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const getColor = (key: 'hot' | 'warm' | 'cold') => {
    switch (key) {
      case 'hot':
        return CHART_COLORS.temperature.hot;
      case 'warm':
        return CHART_COLORS.temperature.warm;
      case 'cold':
      default:
        return CHART_COLORS.temperature.cold;
    }
  };

  const activeItem = activeIndex !== undefined ? data[activeIndex] : null;

  return (
    <Card variant="default" padding="lg" className="bg-white shadow-2xs border-slate-200/80 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Calificación por Intención
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pasa el cursor sobre un sector para resaltar la categoría
          </p>
        </div>
        <Badge variant="warning" size="xs">
          IA Lead Scoring
        </Badge>
      </div>

      <div className="h-56 w-full flex items-center justify-between">
        <div className="h-full w-1/2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                {...({
                  activeIndex: activeIndex,
                  activeShape: renderActiveShape,
                } as any)}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={4}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
                isAnimationActive={true}
              >
                {data.map((entry, index) => (
                  <Cell key={`temp-cell-${index}`} fill={getColor(entry.key)} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold font-mono text-slate-900">
              {activeItem ? activeItem.value : total}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase truncate px-2 max-w-[90px]">
              {activeItem ? activeItem.name.split(' ')[0] : 'Leads Total'}
            </span>
          </div>
        </div>

        <div className="w-1/2 space-y-2.5 pl-3">
          {data.map((item, i) => {
            const pct = Math.round((item.value / (total || 1)) * 100);
            const isHovered = activeIndex === i;

            return (
              <div
                key={i}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(undefined)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  isHovered
                    ? 'bg-slate-100 border-slate-300 shadow-2xs scale-[1.02]'
                    : 'bg-slate-50/80 border-slate-100 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: getColor(item.key) }}
                  />
                  <span className="font-semibold text-slate-700 truncate">{item.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-slate-900 block">{item.value}</span>
                  <span className="text-[10px] text-slate-400 font-medium block">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
