import React from 'react';

export const CHART_COLORS = {
  primary: 'var(--chart-1, #2563EB)',
  purple: 'var(--chart-2, #9333EA)',
  emerald: 'var(--chart-3, #10B981)',
  amber: 'var(--chart-4, #F59E0B)',
  rose: 'var(--chart-5, #E11D48)',

  temperature: {
    hot: 'var(--temp-hot, #F97316)',
    warm: 'var(--temp-warm, #F59E0B)',
    cold: 'var(--temp-cold, #64748B)',
  },

  channels: {
    whatsapp: 'var(--channel-whatsapp, #10B981)',
    instagram: 'var(--channel-instagram, #E11D48)',
    messenger: 'var(--channel-messenger, #2563EB)',
  },
};

export const CHART_GRID_PROPS = {
  strokeDasharray: '3 3',
  stroke: 'rgba(226, 232, 240, 0.8)',
  vertical: false,
};

export const CHART_AXIS_PROPS = {
  axisLine: false,
  tickLine: false,
  tick: {
    fill: '#64748B',
    fontSize: 12,
    fontWeight: 500,
  },
};

export const ChartTooltipContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-800/80 backdrop-blur-md text-xs space-y-1 select-none">
    {children}
  </div>
);

export const ChartSkeletonLoader: React.FC<{ height?: number }> = ({ height = 240 }) => (
  <div
    style={{ height }}
    className="w-full bg-slate-100/70 rounded-2xl animate-pulse flex items-center justify-center text-slate-400 text-xs font-medium"
  >
    Cargando gráfico...
  </div>
);

export const ChartEmptyState: React.FC<{ message?: string; icon?: React.ReactNode }> = ({
  message = 'No hay suficientes datos registrados.',
  icon,
}) => (
  <div className="h-60 w-full rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center space-y-2">
    {icon && <div className="text-slate-400">{icon}</div>}
    <p className="text-xs text-slate-500 font-medium">{message}</p>
  </div>
);
