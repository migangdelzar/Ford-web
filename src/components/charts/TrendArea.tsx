import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from 'recharts';
import { DecorativeDots } from './chartTheme';

export interface TrendAreaPoint {
  label: string;
  value: number;
}

export interface TrendAreaProps {
  title: string;
  subtitle?: string;
  data: TrendAreaPoint[];
  gradientId?: string;
  strokeColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  height?: number;
  unit?: string;
}

const CustomTooltip = ({ active, payload, unit }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-slate-900/95 text-white px-3 py-2 rounded-xl shadow-xl border border-slate-800 text-xs font-medium space-y-0.5 select-none">
        <p className="font-bold text-slate-200">{item.label}</p>
        <p className="text-slate-300 font-mono font-bold">
          {item.value} {unit || 'leads'}
        </p>
      </div>
    );
  }
  return null;
};

export const TrendArea: React.FC<TrendAreaProps> = ({
  title,
  subtitle,
  data,
  gradientId = 'areaGradTeal',
  strokeColor = '#2DD4BF',
  gradientFrom = '#2DD4BF',
  gradientTo = '#4A90D9',
  height = 220,
  unit = 'leads',
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.07)] transition-all duration-300 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
        <DecorativeDots />
      </div>

      {/* Smooth Area Wave */}
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientFrom} stopOpacity={0.45} />
                <stop offset="100%" stopColor={gradientTo} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2, fill: strokeColor }}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
