import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import {
  CHART_COLORS,
  CHART_GRID_PROPS,
  CHART_AXIS_PROPS,
  ChartTooltipContainer,
  ChartSkeletonLoader,
  ChartEmptyState,
} from './chartTheme';
import { Clock, ShieldCheck } from 'lucide-react';

export interface ResponseTimeDataPoint {
  day: string;
  responseTimeMinutes: number;
}

export interface ResponseTimeChartProps {
  data?: ResponseTimeDataPoint[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const val = item.responseTimeMinutes;
    const isSlaCompliant = val <= 1.0;

    return (
      <ChartTooltipContainer>
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1 mb-1">
          <span className="font-bold text-slate-200">{item.day}</span>
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
            isSlaCompliant ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {isSlaCompliant ? 'Meta SLA Cumplido' : 'Requiere Ajuste'}
          </span>
        </div>
        <div className="text-slate-300 font-mono text-xs">
          Tiempo respuesta: <span className="text-white font-bold">{val} min</span>
        </div>
      </ChartTooltipContainer>
    );
  }
  return null;
};

export const ResponseTimeChart: React.FC<ResponseTimeChartProps> = ({
  data = [],
  isLoading = false,
}) => {
  if (isLoading) return <ChartSkeletonLoader height={260} />;
  if (!data || data.length === 0) {
    return <ChartEmptyState message="No hay registros de tiempo de respuesta." icon={<Clock className="w-6 h-6" />} />;
  }

  const avgSpeed = Number(
    (data.reduce((acc, curr) => acc + curr.responseTimeMinutes, 0) / data.length).toFixed(1)
  );

  return (
    <Card variant="default" padding="lg" className="bg-white shadow-2xs border-slate-200/80 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Tiempo de Primera Respuesta
            </h3>
            <Badge variant="success" size="xs" dot>
              Prom. {avgSpeed} min
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Meta SLA Objetivo: respuesta inmediata en &lt;1.0 min por Concierge IA
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/60">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SLA &lt;1.0 min</span>
        </div>
      </div>

      <div className="h-56 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid {...CHART_GRID_PROPS} />
            <XAxis
              dataKey="day"
              {...CHART_AXIS_PROPS}
              interval="preserveStartEnd"
            />
            <YAxis {...CHART_AXIS_PROPS} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />

            {/* Target SLA Reference Line */}
            <ReferenceLine
              y={1.0}
              stroke="#10B981"
              strokeDasharray="3 3"
              label={{
                value: 'Objetivo SLA (1.0 min)',
                fill: '#10B981',
                fontSize: 10,
                fontWeight: 600,
                position: 'insideTopRight',
              }}
            />

            <Bar
              dataKey="responseTimeMinutes"
              fill={CHART_COLORS.primary}
              radius={[4, 4, 0, 0]}
              barSize={28}
              isAnimationActive={true}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
