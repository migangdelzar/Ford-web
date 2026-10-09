import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { DecorativeDots } from './chartTheme';

export interface GradientBarItem {
  name: string;
  value: number;
  gradientId: string;
  fromColor: string;
  toColor: string;
}

export interface GradientBarChartProps {
  title: string;
  subtitle?: string;
  data: GradientBarItem[];
  height?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-slate-900/95 text-white px-3 py-2 rounded-xl shadow-xl border border-slate-800 text-xs font-medium space-y-0.5 select-none">
        <p className="font-bold text-slate-200">{item.name}</p>
        <p className="text-slate-300 font-mono">{item.value} prospectos</p>
      </div>
    );
  }
  return null;
};

export const GradientBarChart: React.FC<GradientBarChartProps> = ({
  title,
  subtitle,
  data,
  height = 200,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.07)] transition-all duration-300 space-y-4">
      {/* Header with Title & Decorative Dots */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
        <DecorativeDots />
      </div>

      {/* Recharts Bar Chart with Gradient Fills */}
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              {data.map((bar) => (
                <linearGradient key={bar.gradientId} id={bar.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={bar.fromColor} />
                  <stop offset="100%" stopColor={bar.toColor} />
                </linearGradient>
              ))}
            </defs>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
            <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={28} isAnimationActive={true}>
              {data.map((bar, index) => (
                <Cell key={`bar-cell-${index}`} fill={`url(#${bar.gradientId})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
