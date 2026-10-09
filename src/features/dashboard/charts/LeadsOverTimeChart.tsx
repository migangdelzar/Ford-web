import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Brush,
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
import { TrendingUp, Sparkles, Filter } from 'lucide-react';

export interface LeadTimeDataPoint {
  date: string;
  leads: number;
  rollingAvg: number;
}

export interface LeadsOverTimeChartProps {
  data?: LeadTimeDataPoint[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const daily = payload[0]?.value || 0;
    const avg = payload[1]?.value || 0;
    const delta = daily > avg ? `+${(daily - avg).toFixed(1)} vs prom.` : `${(daily - avg).toFixed(1)} vs prom.`;
    const isAboveAvg = daily >= avg;

    return (
      <ChartTooltipContainer>
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-1.5 mb-1">
          <span className="font-bold text-slate-100">{label}</span>
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
            isAboveAvg ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {delta}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-blue-400">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-500/30" />
              Prospectos Diarios:
            </span>
            <span className="font-mono font-bold text-white">{daily}</span>
          </div>
          {payload[1] && (
            <div className="flex items-center justify-between gap-4 text-purple-400">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-purple-500 ring-2 ring-purple-500/30" />
                Promedio 7 días:
              </span>
              <span className="font-mono font-bold text-white">{avg}</span>
            </div>
          )}
        </div>
      </ChartTooltipContainer>
    );
  }
  return null;
};

export const LeadsOverTimeChart: React.FC<LeadsOverTimeChartProps> = ({
  data = [],
  isLoading = false,
}) => {
  const [daysFilter, setDaysFilter] = useState<7 | 14 | 30>(30);
  const [showAvgLine, setShowAvgLine] = useState(true);

  if (isLoading) return <ChartSkeletonLoader height={320} />;
  if (!data || data.length === 0) {
    return <ChartEmptyState message="No se han registrado prospectos en el periodo." icon={<TrendingUp className="w-6 h-6" />} />;
  }

  const filteredData = data.slice(-daysFilter);
  const averageValue = Number(
    (filteredData.reduce((acc, curr) => acc + curr.leads, 0) / filteredData.length).toFixed(1)
  );

  return (
    <Card variant="default" padding="lg" className="bg-white shadow-2xs border-slate-200/80 rounded-2xl space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Volumen de Prospectos & Tendencia
            </h3>
            <Badge variant="primary" size="xs">
              Promedio: {averageValue} leads/día
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Volumen diario con proyecciones y selector de rango
          </p>
        </div>

        {/* Interactive Controls & Legend */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto flex-wrap">
          {/* Day range filter */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setDaysFilter(7)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                daysFilter === 7 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setDaysFilter(14)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                daysFilter === 14 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              14D
            </button>
            <button
              onClick={() => setDaysFilter(30)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                daysFilter === 30 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              30D
            </button>
          </div>

          {/* Toggle series button */}
          <button
            onClick={() => setShowAvgLine(!showAvgLine)}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl border transition-all ${
              showAvgLine
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>Prom. 7D</span>
          </button>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientLeadsAreaAdv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...CHART_GRID_PROPS} />
            <XAxis
              dataKey="date"
              {...CHART_AXIS_PROPS}
              interval="preserveStartEnd"
            />
            <YAxis {...CHART_AXIS_PROPS} />
            <Tooltip content={<CustomTooltip />} />

            {/* Benchmark Target Line */}
            <ReferenceLine
              y={averageValue}
              stroke="#94A3B8"
              strokeDasharray="3 3"
              label={{
                value: `Media (${averageValue})`,
                fill: '#94A3B8',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />

            <Area
              type="monotone"
              dataKey="leads"
              stroke={CHART_COLORS.primary}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#gradientLeadsAreaAdv)"
              dot={false}
              activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 3, fill: CHART_COLORS.primary }}
              isAnimationActive={true}
            />

            {showAvgLine && (
              <Line
                type="monotone"
                dataKey="rollingAvg"
                stroke={CHART_COLORS.purple}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 5, stroke: '#FFFFFF', strokeWidth: 2, fill: CHART_COLORS.purple }}
                isAnimationActive={true}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
