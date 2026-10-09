import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';

export interface HistoricalSplineWithPinProps {
  isAsesor?: boolean;
}

export const HistoricalSplineWithPin: React.FC<HistoricalSplineWithPinProps> = () => {
  // Historical month progression matching Screenshot 1 bottom left
  const data = [
    { month: 'ABR', val: 0, formatted: '$0k' },
    { month: 'MAY', val: 0, formatted: '$0k' },
    { month: 'JUN', val: 5, formatted: '$5k' },
    { month: 'JUL', val: 8, formatted: '$8k' },
    { month: 'AGO', val: 12, formatted: '$12k' },
    { month: 'SEP', val: 1170, formatted: '$1,170k' },
  ];

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-card flex flex-col justify-between relative overflow-hidden">
      <div>
        <div className="mb-4">
          <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Histórico.
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingresos operativos por mes • Escalamiento digital
          </p>
        </div>

        {/* Spline Area Chart with Pin */}
        <div className="h-64 sm:h-72 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 20, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}k`)}
              />
              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-800">
                        <span className="text-slate-400 font-semibold block">{label}</span>
                        <div className="text-blue-400 font-mono font-bold text-sm mt-0.5">
                          ${payload[0]?.value}k
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="val"
                stroke="#2563EB"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#historyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Floating Pin Marker for AGO / $0 (Matching Screenshot 1) */}
          <div className="absolute left-[70%] top-[45%] transform -translate-x-1/2 flex flex-col items-center pointer-events-none">
            <div className="bg-white px-3.5 py-1.5 rounded-2xl shadow-lg border border-slate-200/90 text-center animate-fade-in">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                AGO
              </span>
              <span className="text-sm font-extrabold font-mono text-[#0F172A]">
                $0
              </span>
            </div>
            {/* Dashed vertical indicator line */}
            <div className="w-0.5 h-16 border-l-2 border-dashed border-blue-400/80 mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
};
