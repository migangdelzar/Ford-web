import React from 'react';
import { SoftSpeedometerGauge } from './SoftSpeedometerGauge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Cell,
  Tooltip,
} from 'recharts';

const barData = [
  { month: 'Ene', value: 42, color: '#3b82f6' },
  { month: 'Feb', value: 58, color: '#3b82f6' },
  { month: 'Mar', value: 35, color: '#3b82f6' },
  { month: 'Abr', value: 72, color: '#2563eb' },
  { month: 'May', value: 89, color: '#1d4ed8' },
  { month: 'Jun', value: 64, color: '#3b82f6' },
  { month: 'Jul', value: 78, color: '#2563eb' },
];

export const SoftSpeedometerRowCard: React.FC = () => {
  return (
    <div className="bg-white border border-black/[0.04] shadow-[0_8px_30px_-10px_rgba(0,0,0,0.04)] rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-black/[0.04] pb-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#86868B] block">
            SCORING PREDICTIVO
          </span>
          <h3 className="text-xl font-display font-semibold text-[#1D1D1F] tracking-tight mt-0.5">
            Análisis de Temperatura & Velocidad
          </h3>
          <p className="text-xs text-[#86868B] font-medium mt-0.5">
            Calificación automática por intención comercial de compra
          </p>
        </div>
        <span className="text-xs font-bold text-[#1D1D1F] bg-[#F5F5F7] px-3.5 py-1.5 rounded-full">
          Mensual
        </span>
      </div>

      {/* 3 Semi-Circular Speedometer Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SoftSpeedometerGauge
          label="Leads Calientes"
          value="45 leads"
          percentage={82}
          gradientColors={['#f43f5e', '#be123c']}
          subtitle="Cierre / Prueba manejo"
        />
        <SoftSpeedometerGauge
          label="Leads Tibios"
          value="38 leads"
          percentage={60}
          gradientColors={['#f59e0b', '#b45309']}
          subtitle="Cotización / Financiamiento"
        />
        <SoftSpeedometerGauge
          label="Leads Fríos"
          value="24 leads"
          percentage={35}
          gradientColors={['#10b981', '#047857']}
          subtitle="Exploración de catálogo"
        />
      </div>

      {/* Bottom Soft Rounded Bar Chart */}
      <div className="bg-[#F5F5F7] p-4 rounded-2xl border border-black/[0.03] space-y-2">
        <span className="text-xs font-bold text-[#1D1D1F] block">Histórico de Conversión Mensual</span>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#86868B', fontSize: 11, fontWeight: 600 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1D1D1F', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '11px' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={20}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
