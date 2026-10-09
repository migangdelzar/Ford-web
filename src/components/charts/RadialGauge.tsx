import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

export interface RadialGaugeProps {
  value: number; // 0-100 percentage
  label: string;
  sublabel?: string;
  gradientId: string;
  gradientFrom: string;
  gradientTo: string;
  valuePrefix?: string;
  valueSuffix?: string;
  icon?: React.ReactNode;
  iconBg?: string;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  value,
  label,
  sublabel,
  gradientId,
  gradientFrom,
  gradientTo,
  valuePrefix = '',
  valueSuffix = '%',
  icon,
  iconBg = 'bg-pink-50 text-pink-500',
}) => {
  const data = [
    {
      name: label,
      value: Math.min(100, Math.max(0, value)),
      fill: `url(#${gradientId})`,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-between p-5 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.07)] transition-all duration-300 min-h-[210px]">
      {/* Icon Chip & Top Title */}
      <div className="w-full flex items-center justify-between gap-2 mb-1">
        <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
          {label}
        </span>
        {icon && (
          <div className={`p-1.5 rounded-full shrink-0 ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Radial Ring */}
      <div className="relative w-36 h-36 flex items-center justify-center my-1">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            barSize={12}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradientFrom} />
                <stop offset="100%" stopColor={gradientTo} />
              </linearGradient>
            </defs>
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: '#F1F5F9' }}
              dataKey="value"
              cornerRadius={12}
              isAnimationActive={true}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center Percentage Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl font-extrabold text-slate-800 font-mono tracking-tight">
            {valuePrefix}{value}{valueSuffix}
          </span>
        </div>
      </div>

      {sublabel && (
        <span className="text-[11px] font-medium text-slate-400 text-center truncate max-w-[140px] mt-1">
          {sublabel}
        </span>
      )}
    </div>
  );
};
