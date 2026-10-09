import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
} from 'recharts';

const areaData = [
  { day: 'Lun', leads: 12, ai: 24 },
  { day: 'Mar', leads: 22, ai: 38 },
  { day: 'Mié', leads: 18, ai: 31 },
  { day: 'Jue', leads: 32, ai: 49 },
  { day: 'Vie', leads: 42, ai: 68 },
  { day: 'Sáb', leads: 28, ai: 42 },
  { day: 'Dom', leads: 35, ai: 54 },
];

const barData = [
  { name: 'WA', value: 85, color: 'url(#barGrad1)' },
  { name: 'IG', value: 62, color: 'url(#barGrad2)' },
  { name: 'MS', value: 48, color: 'url(#barGrad3)' },
  { name: 'WEB', value: 94, color: 'url(#barGrad4)' },
];

export const SoftOverviewCard: React.FC = () => {
  return (
    <div className="bg-white/95 border border-white shadow-[0_12px_32px_rgba(30,41,59,0.05)] rounded-[2rem] p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Overview Comercial</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Volumen diario & Distribución Omnicanal</p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>En Tiempo Real</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Smooth Area Wave Chart */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>Tendencia de Atención IA</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Leads</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Respuestas</span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="areaGradAi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '1rem', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#f43f5e" strokeWidth={3} fill="url(#areaGradLeads)" />
                <Area type="monotone" dataKey="ai" stroke="#3b82f6" strokeWidth={3} fill="url(#areaGradAi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Leads Semanales</span>
                <span className="text-lg font-black text-slate-800 font-mono">189</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">+18%</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Respuestas IA</span>
                <span className="text-lg font-black text-slate-800 font-mono">542</span>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">98.4%</span>
            </div>
          </div>
        </div>

        {/* Right: Vibrant Rounded 3D-Style Bar Pillars */}
        <div className="md:col-span-5 space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Volumen por Canal</span>
            <span className="text-emerald-600 font-mono">189 total</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#be123c" />
                  </linearGradient>
                  <linearGradient id="barGrad3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="barGrad4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={28}>
                  {barData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
