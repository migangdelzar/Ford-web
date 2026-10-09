import React, { useState } from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
} from 'recharts';

export interface DailyTrendSplineCardProps {
  isAsesor?: boolean;
}

export const DailyTrendSplineCard: React.FC<DailyTrendSplineCardProps> = ({
  isAsesor = false,
}) => {
  const [viewMode, setViewMode] = useState<'diario' | 'acumulado' | 'finalizadas'>('diario');

  // Daily points representing September (1 to 30)
  const rawDailyData = [
    { day: 1, val: 110, acum: 110 },
    { day: 2, val: 45, acum: 155 },
    { day: 3, val: 38, acum: 193 },
    { day: 4, val: 55, acum: 248 },
    { day: 5, val: 48, acum: 296 },
    { day: 6, val: 105, acum: 401 },
    { day: 7, val: 30, acum: 431 },
    { day: 8, val: 30, acum: 461 },
    { day: 9, val: 52, acum: 513 },
    { day: 10, val: 52, acum: 565 },
    { day: 11, val: 48, acum: 613 },
    { day: 12, val: 50, acum: 663 },
    { day: 13, val: 46, acum: 709 },
    { day: 14, val: 40, acum: 749 },
    { day: 15, val: 62, acum: 811 },
    { day: 16, val: 55, acum: 866 },
    { day: 17, val: 50, acum: 916 },
    { day: 18, val: 52, acum: 968 },
    { day: 19, val: 35, acum: 1003 },
    { day: 20, val: 48, acum: 1051 },
    { day: 21, val: 58, acum: 1109 },
    { day: 22, val: 44, acum: 1153 },
    { day: 23, val: 165, acum: 1318 }, // Peak day 23
    { day: 24, val: 25, acum: 1343 },
    { day: 25, val: 25, acum: 1368 },
    { day: 26, val: 25, acum: 1393 },
    { day: 27, val: 25, acum: 1418 },
    { day: 28, val: 25, acum: 1443 },
    { day: 29, val: 25, acum: 1468 },
    { day: 30, val: 25, acum: 1493 },
  ];

  const chartData = rawDailyData.map((d) => ({
    ...d,
    displayVal: viewMode === 'acumulado' ? d.acum : d.val,
  }));

  const avgVal = 54;

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-card space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-blue-600">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>TENDENCIA DE INGRESOS DIARIOS</span>
          </div>
          <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight mt-0.5">
            Septiembre 2026
          </h3>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60 self-start sm:self-auto text-xs font-semibold shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('diario')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'diario'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Diario
          </button>
          <button
            type="button"
            onClick={() => setViewMode('acumulado')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'acumulado'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Acumulado
          </button>
          <button
            type="button"
            onClick={() => setViewMode('finalizadas')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'finalizadas'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Total Finalizadas
          </button>
        </div>
      </div>

      {/* 4 Mini Stat Badges in a Row (Matching Screenshot 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 pb-2">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            INGRESO MENSUAL
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#0F172A] tracking-tight">
            $1,240<span className="text-xs text-slate-400 font-sans font-normal ml-0.5">k</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            PROMEDIO POR DÍA ACTIVO
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-blue-600 tracking-tight">
            ${avgVal}<span className="text-xs text-slate-400 font-sans font-normal ml-0.5">k</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            DÍA MÁS ALTO
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-600 tracking-tight flex items-baseline gap-1">
            <span>Día 23</span>
            <span className="text-xs text-slate-400 font-mono font-medium">($165k)</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            DÍAS ACTIVOS
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-800 tracking-tight">
            23 <span className="text-xs text-slate-400 font-sans font-normal">días</span>
          </div>
        </div>
      </div>

      {/* Spline Chart with Dashed Average Line */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
              tickFormatter={(v) => `$${v}`}
            />
            <RechartsTooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-800">
                      <span className="text-slate-400 font-semibold block">Día {label} de Septiembre</span>
                      <div className="text-blue-400 font-mono font-bold text-sm mt-0.5">
                        ${payload[0]?.value}k
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Dashed Average Line */}
            <ReferenceLine
              y={avgVal}
              stroke="#F97316"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Promedio $${avgVal}`,
                fill: '#F97316',
                fontSize: 10,
                fontWeight: 700,
                position: 'insideBottomRight',
                offset: 5,
              }}
            />
            <Line
              type="monotone"
              dataKey="displayVal"
              stroke="#2563EB"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Actualizado en tiempo real con cada prospecto del CRM</span>
        </div>

        <div className="flex items-center gap-4 font-medium text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Facturación diaria</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Media activa</span>
          </div>
        </div>
      </div>
    </div>
  );
};
