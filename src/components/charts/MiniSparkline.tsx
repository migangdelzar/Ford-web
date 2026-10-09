import React from 'react';
import { ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export interface MiniSparklineProps {
  data: number[];
  color?: string;
  gradientId?: string;
  gradientFrom?: string;
  gradientTo?: string;
  height?: number;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  color = '#F4638C',
  gradientId,
  gradientFrom,
  gradientTo,
  height = 40,
}) => {
  const chartData = data.map((val, i) => ({ id: i, val }));

  return (
    <div style={{ height }} className="w-20 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          {gradientId && gradientFrom && gradientTo && (
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientFrom} />
                <stop offset="100%" stopColor={gradientTo} />
              </linearGradient>
            </defs>
          )}
          <Bar
            dataKey="val"
            radius={[4, 4, 0, 0]}
            fill={gradientId ? `url(#${gradientId})` : color}
            isAnimationActive={true}
          >
            {gradientId &&
              chartData.map((_, index) => (
                <Cell key={`spark-bar-${index}`} fill={`url(#${gradientId})`} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
