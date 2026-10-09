import React, { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DailyDataPoint {
  date: string; // e.g., "Lun", "Mar" or "12 Oct"
  value: number; // e.g., 3400
  label?: string;
}

export interface TrendChartCardProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  data: DailyDataPoint[];
  data30d?: DailyDataPoint[];
  dataMonth?: DailyDataPoint[];
  totalFormatted?: string; // e.g., "$24,850"
  totalFormatted30d?: string;
  totalFormattedMonth?: string;
  growthPercent?: string; // e.g., "+18%"
  strokeColor?: string; // default: "#0071E3"
  unitPrefix?: string; // default: "$"
  unitSuffix?: string;
  periodLabel?: string;
  className?: string;
}

export const TrendChartCard: React.FC<TrendChartCardProps> = ({
  title = "Tendencia de Ingresos Diarios",
  subtitle = "Comportamiento del flujo de cobros por jornada",
  eyebrow = "MÉTRICAS DE RENDIMIENTO",
  data,
  data30d,
  dataMonth,
  totalFormatted = "$24,850",
  totalFormatted30d,
  totalFormattedMonth,
  growthPercent = "+18%",
  strokeColor = "#0071E3",
  unitPrefix = "$",
  unitSuffix = "",
  periodLabel = "acumulado en el periodo",
  className,
}) => {
  const [activeRange, setActiveRange] = useState<'7D' | '30D' | 'MES'>('7D');

  // Derive active dataset based on toggle
  const activeData = useMemo(() => {
    if (activeRange === '30D') {
      if (data30d && data30d.length > 0) return data30d;
      // Synthetic projection based on data
      return [
        { date: 'Sem 1', value: Math.round(data.reduce((a, b) => a + b.value, 0) * 0.22) },
        { date: 'Sem 2', value: Math.round(data.reduce((a, b) => a + b.value, 0) * 0.26) },
        { date: 'Sem 3', value: Math.round(data.reduce((a, b) => a + b.value, 0) * 0.28) },
        { date: 'Sem 4', value: Math.round(data.reduce((a, b) => a + b.value, 0) * 0.24) },
      ];
    }
    if (activeRange === 'MES') {
      if (dataMonth && dataMonth.length > 0) return dataMonth;
      return [
        { date: 'May', value: Math.round(data.reduce((a, b) => a + b.value, 0) * 0.85) },
        { date: 'Jun', value: Math.round(data.reduce((a, b) => a + b.value, 0) * 0.92) },
        { date: 'Jul', value: Math.round(data.reduce((a, b) => a + b.value, 0) * 1.05) },
        { date: 'Ago', value: Math.round(data.reduce((a, b) => a + b.value, 0) * 1.12) },
      ];
    }
    return data;
  }, [activeRange, data, data30d, dataMonth]);

  const activeTotal = useMemo(() => {
    if (activeRange === '30D' && totalFormatted30d) return totalFormatted30d;
    if (activeRange === 'MES' && totalFormattedMonth) return totalFormattedMonth;
    if (activeRange !== '7D') {
      const sum = activeData.reduce((acc, curr) => acc + curr.value, 0);
      return `${unitPrefix}${sum.toLocaleString()}${unitSuffix}`;
    }
    return totalFormatted;
  }, [activeRange, totalFormatted, totalFormatted30d, totalFormattedMonth, activeData, unitPrefix, unitSuffix]);

  // Calculate highest day
  const maxVal = Math.max(...activeData.map(d => d.value), 0);
  const peakDay = activeData.find(d => d.value === maxVal);
  const avgVal = Math.round(activeData.reduce((acc, curr) => acc + curr.value, 0) / (activeData.length || 1));

  return (
    <div className={cn(
      "rounded-[32px] sm:rounded-[40px] bg-white border border-black/[0.04] shadow-[0_8px_30px_-10px_rgba(0,0,0,0.04)] p-6 sm:p-8 space-y-6 transition-all",
      className
    )}>
      {/* 1. Header & Range Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#86868B] opacity-70 block">
            {eyebrow}
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h3 className="text-xl sm:text-2xl font-display font-semibold tracking-tight text-[#1D1D1F]">
              {title}
            </h3>
            {growthPercent && (
              <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#34C759]/15 text-[#34C759]">
                <ArrowUpRight className="size-3 stroke-[2.5]" />
                {growthPercent}
              </span>
            )}
          </div>
          <p className="text-xs text-[#86868B] mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Range Selector Pill */}
        <div className="bg-[#F5F5F7] p-1 rounded-full flex items-center gap-1 self-start sm:self-auto border border-black/[0.03]">
          {(['7D', '30D', 'MES'] as const).map(range => (
            <button
              key={range}
              type="button"
              onClick={() => setActiveRange(range)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer select-none",
                activeRange === range
                  ? "bg-white text-[#1D1D1F] shadow-xs font-bold"
                  : "text-[#86868B] hover:text-[#1D1D1F]"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Hero Number */}
      <div className="pt-1">
        <span className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-[#1D1D1F] tabular-nums">
          {activeTotal}
        </span>
        <span className="text-xs text-[#86868B] font-medium ml-2">
          {periodLabel}
        </span>
      </div>

      {/* 3. The Fluid Area Chart */}
      <div className="h-[220px] sm:h-[260px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id={`trendGradient-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.28} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#86868B', fontSize: 11, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#86868B', fontSize: 11, fontWeight: 500 }}
              tickFormatter={(val) => `${unitPrefix}${val > 999 ? `${(val/1000).toFixed(0)}k` : val}${unitSuffix}`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-[#1D1D1F] text-white p-3 rounded-2xl shadow-xl border border-white/10 backdrop-blur-md">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">
                        {item.date} {item.label ? `• ${item.label}` : ''}
                      </p>
                      <p className="text-lg font-display font-bold text-white mt-0.5">
                        {unitPrefix}{Number(item.value).toLocaleString()}{unitSuffix}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#trendGradient-${title.replace(/\s+/g, '-')})`}
              isAnimationActive={false}
              activeDot={{
                r: 6,
                fill: strokeColor,
                stroke: "#FFFFFF",
                strokeWidth: 3,
                className: "drop-shadow-md"
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Footer Trio Summary Pills */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 border-t border-black/[0.04]">
        <div className="p-3 rounded-2xl bg-[#F5F5F7]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block">
            Día Pico
          </span>
          <p className="text-sm font-bold text-[#1D1D1F] mt-0.5 truncate font-mono">
            {peakDay ? `${peakDay.date} (${unitPrefix}${peakDay.value.toLocaleString()}${unitSuffix})` : '—'}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-[#F5F5F7]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block">
            Promedio {activeRange === '7D' ? 'Diario' : 'Periodo'}
          </span>
          <p className="text-sm font-bold text-[#1D1D1F] mt-0.5 font-mono">
            {unitPrefix}{avgVal.toLocaleString()}{unitSuffix}
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-[#F5F5F7]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block">
            Tendencia
          </span>
          <p className="text-sm font-bold text-[#34C759] mt-0.5 flex items-center gap-1">
            <TrendingUp className="size-3.5" />
            <span>Positiva ({growthPercent})</span>
          </p>
        </div>
      </div>
    </div>
  );
};
export default TrendChartCard;
