import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Conversation } from '../../../types';

interface ChannelBarChartProps {
  conversations: Conversation[];
}

export const ChannelBarChart: React.FC<ChannelBarChartProps> = ({ conversations }) => {
  const waCount = conversations.filter((c) => c.channel === 'whatsapp').length;
  const igCount = conversations.filter((c) => c.channel === 'instagram').length;
  const msCount = conversations.filter((c) => c.channel === 'messenger').length;

  const data = [
    { channel: 'WhatsApp', count: waCount, color: '#10B981' },
    { channel: 'Instagram', count: igCount, color: '#E11D48' },
    { channel: 'Messenger', count: msCount, color: '#2563EB' },
  ];

  const CustomTooltip = ({ id, value, color, indexValue }: any) => {
    return (
      <div className="bg-slate-950/95 text-white px-3 py-2 rounded-2xl shadow-2xl border border-slate-800/80 backdrop-blur-xl text-xs flex items-center gap-2 select-none">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="font-bold text-slate-100">{indexValue}:</span>
        <span className="font-mono font-medium text-slate-300">{value} prospectos activos</span>
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
            Distribución por Canal Meta
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Flujo omnicanal verificado con SLA de 24h
          </p>
        </div>
        <Badge variant="success" size="xs" dot>
          Nivo Bar Engine
        </Badge>
      </div>

      <div className="h-60 w-full pt-1">
        <ResponsiveBar
          data={data}
          keys={['count']}
          indexBy="channel"
          margin={{ top: 15, right: 15, bottom: 35, left: 35 }}
          padding={0.35}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={({ data }: any) => data.color}
          borderRadius={8}
          borderWidth={0}
          enableGridY={true}
          enableGridX={false}
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
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor="#FFFFFF"
          tooltip={CustomTooltip}
          theme={{
            axis: {
              ticks: {
                text: {
                  fill: '#475569',
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
            labels: {
              text: {
                fontWeight: 700,
                fontSize: 12,
              },
            },
          }}
        />
      </div>
    </Card>
  );
};
