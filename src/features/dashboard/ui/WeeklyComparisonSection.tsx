import React from 'react';
import { TrendingUp, Target, ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';

export interface WeeklyComparisonSectionProps {
  timeframe?: string;
  isAsesor?: boolean;
}

export const WeeklyComparisonSection: React.FC<WeeklyComparisonSectionProps> = ({
  isAsesor = false,
}) => {
  // Weekly comparison data matching Screenshot 1 (Actual vs Anterior)
  const data = [
    { day: 'LUN', actual: isAsesor ? 3 : 38, anterior: isAsesor ? 4 : 58 },
    { day: 'MAR', actual: isAsesor ? 4 : 45, anterior: isAsesor ? 4 : 48 },
    { day: 'MIÉ', actual: isAsesor ? 7 : 92, anterior: isAsesor ? 3 : 42 },
    { day: 'JUE', actual: isAsesor ? 1 : 24, anterior: isAsesor ? 4 : 52 },
    { day: 'VIE', actual: isAsesor ? 2 : 28, anterior: isAsesor ? 3 : 36 },
    { day: 'SÁB', actual: isAsesor ? 1 : 16, anterior: isAsesor ? 4 : 48 },
    { day: 'DOM', actual: isAsesor ? 1 : 12, anterior: isAsesor ? 4 : 60 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: 2 COLUMNS — PERFORMANCE SEMANAL / Comparativa. */}
      <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-card flex flex-col justify-between">
        <div>
          {/* Header Row with Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-blue-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>PERFORMANCE SEMANAL</span>
              </div>
              <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight mt-0.5">
                Comparativa.
              </h3>
            </div>

            {/* Custom Minimal Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="uppercase text-[11px] tracking-wider text-slate-500 font-bold">
                  ACTUAL
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <span className="uppercase text-[11px] tracking-wider text-slate-400 font-bold">
                  ANTERIOR
                </span>
              </div>
            </div>
          </div>

          {/* Dual Bar Chart */}
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barGap={8}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F8FAFC"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <RechartsTooltip
                  cursor={{ fill: '#F8FAFC', opacity: 0.6 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-800 space-y-1">
                          <span className="font-bold text-slate-300 block">{label}</span>
                          <div className="flex items-center gap-2 text-blue-400 font-mono font-bold">
                            <span>Actual:</span>
                            <span>${payload[0]?.value}k</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 font-mono">
                            <span>Anterior:</span>
                            <span>${payload[1]?.value}k</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="actual"
                  name="Actual"
                  fill="#2563EB"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={14}
                />
                <Bar
                  dataKey="anterior"
                  name="Anterior"
                  fill="#F1F5F9"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RIGHT: 1 COLUMN — STACKED DARK THEME CARD & WHITE PROJECTION CARD */}
      <div className="flex flex-col gap-6 justify-between">
        {/* TOP: HIGH CONTRAST DARK THEME CARD */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] text-white p-6 shadow-xl border border-slate-800 flex-1 flex flex-col justify-between">
          {/* Subtle Abstract Wave / Sparkline Background Watermark */}
          <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-x-4 translate-y-2">
            <svg width="220" height="110" viewBox="0 0 220 110" fill="none">
              <path
                d="M 10 90 Q 60 20 110 70 T 210 30"
                stroke="#FFFFFF"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-slate-800/90 text-white flex items-center justify-center border border-slate-700/60 shadow-inner">
                <TrendingUp className="w-5 h-5 text-slate-200" />
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
                -45%
              </span>
            </div>

            {/* Total Metric */}
            <div className="mt-5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                TOTAL SEMANAL
              </span>
              <div className="mt-1 text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight">
                $180<span className="text-xl text-slate-400 font-sans font-medium">k</span>
              </div>
            </div>
          </div>

          {/* Subtext note */}
          <div className="mt-6 pt-3 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium">
              Ajuste de $150k vs anterior
            </span>
          </div>
        </div>

        {/* BOTTOM: CRISP WHITE PROJECTION CARD */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-card flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                PROYECCIÓN
              </span>
              <h4 className="text-lg font-extrabold text-[#0F172A] tracking-tight mt-0.5">
                Ritmo Actual.
              </h4>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              A este ritmo, proyectas cerrar con un{' '}
              <strong className="text-slate-900 font-bold">ajuste notable</strong>{' '}
              en la facturación mensual y cierre de citas en concesionaria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
