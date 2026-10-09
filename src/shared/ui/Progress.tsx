import React from 'react';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 - 100
  colorVariant?: 'pink' | 'orange' | 'teal' | 'blue' | 'purple' | 'gradientPink' | 'gradientTeal';
  size?: 'sm' | 'md' | 'lg';
}

const colorMap = {
  pink: 'bg-accent-pink',
  orange: 'bg-accent-orange',
  teal: 'bg-accent-teal',
  blue: 'bg-accent-blue',
  purple: 'bg-accent-purple',
  gradientPink: 'bg-gradient-to-r from-[#F4638C] to-[#F5A623]',
  gradientTeal: 'bg-gradient-to-r from-[#2DD4BF] to-[#4A90D9]',
};

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  colorVariant = 'gradientPink',
  size = 'md',
  className = '',
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div
      className={`w-full bg-slate-100/90 rounded-full overflow-hidden p-0.5 shadow-soft-inset ${sizeMap[size]} ${className}`}
      {...props}
    >
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${colorMap[colorVariant]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
