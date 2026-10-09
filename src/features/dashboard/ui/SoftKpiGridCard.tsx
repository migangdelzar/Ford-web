import React from 'react';
import { SoftRingGauge } from './SoftRingGauge';

export const SoftKpiGridCard: React.FC = () => {
  return (
    <div className="bg-white/95 border border-white shadow-[0_12px_32px_rgba(30,41,59,0.05)] rounded-[2rem] p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight">KPI Dashboard</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Indicadores clave de eficiencia comercial & SLA</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
      </div>

      {/* 4 Soft Donut Progress Rings */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SoftRingGauge
          percentage={96}
          label="SLA Cumplimiento"
          sublabel="Ventana 24h Meta"
          gradientColors={['#10b981', '#059669']}
          gradientId="ringSla"
        />
        <SoftRingGauge
          percentage={85}
          label="Automatización IA"
          sublabel="Concierge IA"
          gradientColors={['#8b5cf6', '#6366f1']}
          gradientId="ringAi"
        />
        <SoftRingGauge
          percentage={75}
          label="Leads Calientes"
          sublabel="Cierre / Cita"
          gradientColors={['#f59e0b', '#d97706']}
          gradientId="ringHot"
        />
        <SoftRingGauge
          percentage={50}
          label="Tasa Conversión"
          sublabel="Inquiry a Venta"
          gradientColors={['#3b82f6', '#1d4ed8']}
          gradientId="ringConv"
        />
      </div>

      {/* Summary Footer Line */}
      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold font-mono">
            $
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Pipeline Estimado</span>
            <span className="text-base font-extrabold font-mono text-slate-900">$277,2M MXN</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-emerald-700 font-semibold bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-100/80">
          <span>+24.8% crecimiento respecto al mes anterior</span>
        </div>
      </div>
    </div>
  );
};
