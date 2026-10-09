import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import {
  CHART_COLORS,
  CHART_GRID_PROPS,
  CHART_AXIS_PROPS,
  ChartTooltipContainer,
  ChartSkeletonLoader,
  ChartEmptyState,
} from './chartTheme';
import { MessageSquare, Check } from 'lucide-react';

export interface ChannelDataPoint {
  channel: string;
  count: number;
  color: string;
}

export interface ChannelSplitChartProps {
  data?: ChannelDataPoint[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <ChartTooltipContainer>
        <p className="font-bold text-slate-200">{item.channel}</p>
        <p className="text-slate-300 font-mono font-medium">{item.count} prospectos activos</p>
      </ChartTooltipContainer>
    );
  }
  return null;
};

export const ChannelSplitChart: React.FC<ChannelSplitChartProps> = ({
  data = [],
  isLoading = false,
}) => {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['WhatsApp', 'Instagram', 'Messenger']);

  if (isLoading) return <ChartSkeletonLoader height={260} />;
  if (!data || data.length === 0) {
    return <ChartEmptyState message="No hay actividad por canal registrada." icon={<MessageSquare className="w-6 h-6" />} />;
  }

  const toggleChannel = (chName: string) => {
    if (selectedChannels.includes(chName)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== chName));
      }
    } else {
      setSelectedChannels([...selectedChannels, chName]);
    }
  };

  const filteredData = data.filter((item) => selectedChannels.includes(item.channel));

  return (
    <Card variant="default" padding="lg" className="bg-white shadow-2xs border-slate-200/80 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Distribución por Canal
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Filtrar canales para comparar volumen
          </p>
        </div>

        {/* Interactive Channel Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {data.map((ch) => {
            const isSelected = selectedChannels.includes(ch.channel);
            return (
              <button
                key={ch.channel}
                onClick={() => toggleChannel(ch.channel)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-800 shadow-2xs'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ch.color }} />
                <span>{ch.channel}</span>
                {isSelected && <Check className="w-3 h-3 text-emerald-400 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-56 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid {...CHART_GRID_PROPS} />
            <XAxis type="number" {...CHART_AXIS_PROPS} />
            <YAxis
              dataKey="channel"
              type="category"
              {...CHART_AXIS_PROPS}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={26} isAnimationActive={true}>
              {filteredData.map((entry, index) => (
                <Cell key={`channel-cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
