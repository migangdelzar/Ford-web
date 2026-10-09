import React from 'react';

export interface SoftSpeedometerGaugeProps {
  label: string;
  value: string | number;
  percentage: number;
  gradientColors: [string, string];
  subtitle?: string;
}

export const SoftSpeedometerGauge: React.FC<SoftSpeedometerGaugeProps> = ({
  label,
  value,
  percentage,
  gradientColors,
  subtitle,
}) => {
  const radius = 38;
  const strokeWidth = 7;
  const circumference = Math.PI * radius; // Half circle arc
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const svgWidth = (radius + strokeWidth) * 2;
  const svgHeight = radius + strokeWidth + 6;

  const uniqueId = `speedo-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-[1.75rem] bg-white border border-white/80 shadow-[0_10px_25px_rgba(0,0,0,0.03),_inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.06)] transition-all">
      <span className="text-xs font-bold text-slate-800 text-center mb-1">
        {label}
      </span>

      <div className="relative flex items-center justify-center">
        <svg width={svgWidth} height={svgHeight} className="overflow-visible">
          <defs>
            <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>
          </defs>
          {/* Half Circle Track */}
          <path
            d={`M ${strokeWidth},${radius + strokeWidth} A ${radius},${radius} 0 0,1 ${
              svgWidth - strokeWidth
            },${radius + strokeWidth}`}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
          />
          {/* Progress Half Circle */}
          <path
            d={`M ${strokeWidth},${radius + strokeWidth} A ${radius},${radius} 0 0,1 ${
              svgWidth - strokeWidth
            },${radius + strokeWidth}`}
            stroke={`url(#${uniqueId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute bottom-0 text-center">
          <span className="text-sm font-extrabold text-slate-800 font-mono">
            {value}
          </span>
        </div>
      </div>

      {subtitle && (
        <span className="text-[10px] text-slate-400 font-medium text-center mt-1">
          {subtitle}
        </span>
      )}
    </div>
  );
};
