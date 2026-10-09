import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Conversation } from '../../../types';

interface TemperaturePieChartProps {
  conversations: Conversation[];
}

export const TemperaturePieChart: React.FC<TemperaturePieChartProps> = ({ conversations }) => {
  const hotCount = conversations.filter((c) => c.leadTemperature === 'hot').length;
  const warmCount = conversations.filter((c) => c.leadTemperature === 'warm').length;
  const coldCount = conversations.filter((c) => c.leadTemperature === 'cold').length;

  const data = [
    { id: 'Caliente', label: 'Caliente (Cierre)', value: hotCount, color: '#E11D48' },
    { id: 'Tibio', label: 'Tibio (Cotización)', value: warmCount, color: '#D97706' },
    { id: 'Frío', label: 'Frío (Exploración)', value: coldCount, color: '#64748B' },
  ];

  const CustomTooltip = ({ datum }: any) => {
    return (
      <div className="bg-slate-950/95 text-white px-3 py-2 rounded-2xl shadow-2xl border border-slate-800/80 backdrop-blur-xl text-xs flex items-center gap-2 select-none">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: datum.color }} />
        <span className="font-bold text-slate-100">{datum.label}:</span>
        <span className="font-mono font-medium text-slate-300">{datum.value} prospectos</span>
      </div>
    );
  };

  return (
    <Card
      variant="default"
      padding="lg"
      className="bg-white/90 backdrop-blur-xl shadow-xs hover:shadow-md transition-all duration-300 border-slate-200/80 rounded-2xl space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Embudo de Intención Comercial
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Calificación automática realizada por Concierge IA
          </p>
        </div>
        <Badge variant="purple" size="xs">
          Nivo Pie Engine
        </Badge>
      </div>

      <div className="h-60 w-full flex items-center justify-between">
        <div className="h-full w-1/2 relative">
          <ResponsivePie
            data={data}
            margin={{ top: 15, right: 15, bottom: 15, left: 15 }}
            innerRadius={0.62}
            padAngle={3}
            cornerRadius={6}
            activeOuterRadiusOffset={8}
            colors={({ data }: any) => data.color}
            borderWidth={0}
            enableArcLinkLabels={false}
            enableArcLabels={false}
            tooltip={CustomTooltip}
          />

          {/* Center Metric Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold font-mono text-slate-900 tracking-tight">
              {conversations.length}
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Leads
            </span>
          </div>
        </div>

        <div className="w-1/2 space-y-2.5 pl-2">
          {data.map((item, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-black/5"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-slate-800 truncate">{item.label}</span>
              </div>
              <span className="font-mono font-bold text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
