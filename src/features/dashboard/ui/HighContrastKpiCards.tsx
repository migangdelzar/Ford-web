import React from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  MessageSquare,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import { Tooltip } from '../../../shared/ui/Tooltip';

export interface HighContrastKpiCardsProps {
  dashboardData: any;
  isAsesor: boolean;
  canViewValuation?: boolean;
}

export const HighContrastKpiCards: React.FC<HighContrastKpiCardsProps> = ({
  dashboardData,
  isAsesor,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: DARK THEME CARD — Total Leads & Pipeline Impact */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-5 shadow-xl border border-slate-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between">
        {/* Ambient subtle glow background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/60 text-white flex items-center justify-center shrink-0 shadow-inner">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {dashboardData.leads.change}
              </span>
              <Tooltip content={isAsesor ? 'Prospectos actualmente asignados en CRM' : 'Total de prospectos atendidos omnicanal'}>
                <button className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Metric Label & Large Bold Value */}
          <div className="mt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isAsesor ? 'MIS PROSPECTOS ASIGNADOS' : 'TOTAL PROSPECTOS ATENDIDOS'}
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
                {dashboardData.leads.val}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {isAsesor ? 'en cartera' : 'leads'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Sparkline & Subtext */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-end justify-between gap-2">
          <span className="text-[11px] text-slate-400 font-medium">
            {dashboardData.leads.subtext}
          </span>

          {/* Embedded Mini Sparkline */}
          <div className="w-20 h-7 shrink-0 opacity-80 hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.leads.sparkline} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <defs>
                  <linearGradient id="darkCardSparkline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke="#38BDF8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#darkCardSparkline)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CARD 2: CRISP WHITE CARD — Confirmed Appointments & Conversion Rate */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between">
        <div>
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                {dashboardData.conversion.change}
              </span>
              <Tooltip content="Porcentaje de prospectos calificados que agendaron cita o prueba de manejo">
                <button className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Metric Label & Large Bold Value */}
          <div className="mt-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {isAsesor ? 'CITAS & APARTADOS' : 'TASA DE CONVERSIÓN'}
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-slate-900">
                {dashboardData.conversion.val}%
              </span>
              <span className="text-xs text-slate-400 font-mono">
                conversión
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Radial Gauge & Subtext */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-emerald-600 font-semibold truncate">
            {dashboardData.conversion.subtext}
          </span>

          <div className="w-9 h-9 shrink-0 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="75%"
                outerRadius="100%"
                barSize={3}
                data={[{ value: dashboardData.conversion.numeric, fill: '#16A34A' }]}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background={{ fill: '#E2E8F0' }} dataKey="value" cornerRadius={2} />
              </RadialBarChart>
            </ResponsiveContainer>
            <span className="absolute text-[8px] font-black font-sans text-emerald-600">
              {Math.round(dashboardData.conversion.numeric || 0)}%
            </span>
          </div>
        </div>
      </div>

      {/* CARD 3: DARK THEME CARD — Inferencia & Latencia Concierge IA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#090E1A] via-slate-900 to-[#0F172A] text-white p-5 shadow-xl border border-slate-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between">
        {/* Subtle indigo ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-800/50 text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
              <Clock className="w-4 h-4 text-indigo-300" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {dashboardData.latency.change}
              </span>
              <Tooltip content="Tiempo promedio de procesamiento y respuesta generada por la IA Concierge">
                <button className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Metric Label & Large Bold Value */}
          <div className="mt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              LATENCIA CONCIERGE IA
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-indigo-100">
                {dashboardData.latency.val}
              </span>
              <span className="text-xs text-indigo-300 font-mono">
                ms / resp
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Status & Micro Frequency Bars */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 font-medium">
            {dashboardData.latency.subtext}
          </span>

          <div className="flex items-end gap-1 h-5">
            {[40, 70, 55, 90, 65, 80].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-indigo-400/80 rounded-full"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CARD 4: CRISP WHITE CARD — Derivación a Humano / Autonomía */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between">
        <div>
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200">
                {dashboardData.handoff.change}
              </span>
              <Tooltip content="Porcentaje de conversaciones escaladas al equipo humano para firma o prueba de manejo">
                <button className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Metric Label & Large Bold Value */}
          <div className="mt-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {isAsesor ? 'TASA DE DERIVACIÓN' : 'DERIVACIÓN A ASESOR'}
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-slate-900">
                {dashboardData.handoff.val}%
              </span>
              <span className="text-xs text-slate-400 font-mono">
                a humanos
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Radial Gauge & Subtext */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-purple-700 font-semibold truncate">
            {dashboardData.handoff.subtext}
          </span>

          <div className="w-9 h-9 shrink-0 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="75%"
                outerRadius="100%"
                barSize={3}
                data={[{ value: dashboardData.handoff.numeric, fill: '#7C3AED' }]}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background={{ fill: '#E2E8F0' }} dataKey="value" cornerRadius={2} />
              </RadialBarChart>
            </ResponsiveContainer>
            <span className="absolute text-[8px] font-black font-sans text-purple-700">
              {Math.round(dashboardData.handoff.numeric || 0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
