import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from 'recharts';

export interface ChannelMixDonutCardProps {
  isAsesor?: boolean;
}

export const ChannelMixDonutCard: React.FC<ChannelMixDonutCardProps> = ({
  isAsesor = false,
}) => {
  // Breakdown items matching Screenshot 1 bottom right
  const channels = [
    {
      id: 'wa',
      name: isAsesor ? 'WhatsApp Business' : 'Extensiones y Estructura',
      channelSub: 'WhatsApp API',
      value: isAsesor ? 48 : 485,
      color: '#0070F3', // Vibrant blue
    },
    {
      id: 'ig',
      name: isAsesor ? 'Instagram DMs' : 'Manicura y Cuidado Natural',
      channelSub: 'Instagram Direct',
      value: isAsesor ? 32 : 455,
      color: '#10B981', // Vibrant green
    },
    {
      id: 'ms',
      name: isAsesor ? 'Facebook Messenger' : 'Pedicura Especializada',
      channelSub: 'Messenger Chat',
      value: isAsesor ? 15 : 180,
      color: '#8B5CF6', // Vibrant purple
    },
    {
      id: 'web',
      name: isAsesor ? 'Web Showroom' : 'Nail Art y Efectos',
      channelSub: 'Showroom Digital',
      value: isAsesor ? 5 : 50,
      color: '#F59E0B', // Vibrant orange
    },
  ];

  const total = channels.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-card flex flex-col justify-between">
      <div>
        <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight mb-2">
          Mix Ingresos.
        </h3>

        {/* Center Donut Chart */}
        <div className="h-48 w-full relative flex items-center justify-center my-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channels}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {channels.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs shadow-xl border border-slate-800">
                        <span className="font-semibold">{data.name}</span>
                        <div className="font-mono font-bold text-sm text-blue-400">
                          ${data.value}k
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              TOTAL
            </span>
            <span className="text-xl font-extrabold font-mono text-[#0F172A] tracking-tight">
              ${total >= 1000 ? `${(total / 1000).toFixed(2)}M` : `${total}k`}
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Rows Below */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        {channels.map((ch) => (
          <div key={ch.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: ch.color }}
              />
              <span className="font-medium text-slate-700">{ch.name}</span>
            </div>
            <span className="font-mono font-bold text-[#0F172A]">
              ${ch.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
