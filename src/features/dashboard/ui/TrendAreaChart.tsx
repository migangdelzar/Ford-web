import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';

const nivoTrendData = [
  {
    id: 'Leads',
    color: '#2563EB',
    data: [
      { x: 'Lun', y: 4 },
      { x: 'Mar', y: 7 },
      { x: 'Mié', y: 5 },
      { x: 'Jue', y: 9 },
      { x: 'Vie', y: 12 },
      { x: 'Sáb', y: 8 },
      { x: 'Dom', y: 10 },
    ],
  },
  {
    id: 'Automatización IA',
    color: '#9333EA',
    data: [
      { x: 'Lun', y: 12 },
      { x: 'Mar', y: 21 },
      { x: 'Mié', y: 18 },
      { x: 'Jue', y: 29 },
      { x: 'Vie', y: 38 },
      { x: 'Sáb', y: 24 },
      { x: 'Dom', y: 31 },
    ],
  },
];

const CustomTooltip = ({ point }: any) => {
  return (
    <div className="bg-slate-950/95 text-white px-3.5 py-2.5 rounded-2xl shadow-2xl border border-slate-800/80 backdrop-blur-xl text-xs flex items-center gap-2 select-none">
      <span
        className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20 shrink-0"
        style={{ backgroundColor: point.serieColor }}
      />
      <span className="font-semibold text-slate-300">{point.serieId} ({point.data.x}):</span>
      <span className="font-mono font-bold text-white">{point.data.yFormatted}</span>
    </div>
  );
};

export const TrendAreaChart: React.FC = () => {
  return (
    <Card
      variant="default"
      padding="lg"
      className="bg-white/90 backdrop-blur-xl shadow-xs hover:shadow-md transition-all duration-300 border-slate-200/80 rounded-2xl space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Flujo de Prospectos & Velocidad IA
            </h3>
            <Badge variant="purple" size="xs">
              Nivo Line Engine
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Volumen diario de prospectos recibidos vs. respuestas automáticas de Concierge IA
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50/80 p-2 rounded-xl border border-slate-200/60 self-start sm:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-500/20" />
            <span>Leads</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-purple-500/20" />
            <span>Automatización IA</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full pt-1">
        <ResponsiveLine
          data={nivoTrendData}
          margin={{ top: 20, right: 20, bottom: 35, left: 35 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
          curve="natural"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
          }}
          enableGridX={false}
          enableGridY={true}
          colors={['#2563EB', '#9333EA']}
          lineWidth={3}
          enableArea={true}
          areaOpacity={0.15}
          pointSize={8}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={3}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          useMesh={true}
          tooltip={CustomTooltip}
          theme={{
            axis: {
              ticks: {
                text: {
                  fill: '#64748B',
                  fontSize: 11,
                  fontWeight: 600,
                },
              },
            },
            grid: {
              line: {
                stroke: '#F1F5F9',
                strokeWidth: 1,
              },
            },
          }}
        />
      </div>
    </Card>
  );
};
