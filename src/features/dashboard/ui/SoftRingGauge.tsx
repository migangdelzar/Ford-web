import React from 'react';

export interface SoftRingGaugeProps {
  percentage: number;
  label: string;
  sublabel?: string;
  valueText?: string;
  color?: string;
  gradientId?: string;
  gradientColors?: [string, string];
  size?: 'sm' | 'md' | 'lg';
}

export const SoftRingGauge: React.FC<SoftRingGaugeProps> = ({
  percentage,
  label,
  sublabel,
  valueText,
  color = '#2563eb',
  gradientId,
  gradientColors,
  size = 'md',
}) => {
  const radius = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const strokeWidth = size === 'sm' ? 6 : size === 'lg' ? 8 : 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  const uniqueGradId = gradientId || `grad-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-[1.75rem] bg-white border border-white/80 shadow-[0_10px_25px_rgba(0,0,0,0.03),_inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.06)] transition-all">
      <div className="relative flex items-center justify-center mb-2">
        <svg width={svgSize} height={svgSize} className="transform -rotate-90">
          {gradientColors && (
            <defs>
              <linearGradient id={uniqueGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradientColors[0]} />
                <stop offset="100%" stopColor={gradientColors[1]} />
              </linearGradient>
            </defs>
          )}
          {/* Background Track */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={gradientColors ? `url(#${uniqueGradId})` : color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-sm sm:text-base font-extrabold text-slate-800 font-mono tracking-tight">
            {valueText || `${percentage}%`}
          </span>
        </div>
      </div>

      <span className="text-xs font-bold text-slate-800 text-center truncate max-w-[110px]">
        {label}
      </span>
      {sublabel && (
        <span className="text-[10px] text-slate-400 font-medium text-center truncate max-w-[110px] mt-0.5">
          {sublabel}
        </span>
      )}
    </div>
  );
};
