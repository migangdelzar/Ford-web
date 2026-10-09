import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Instagram, MessageSquare } from 'lucide-react';
import { Card } from '../../../shared/ui/Card';
import { Conversation } from '../../../types';

interface ChannelVolumeChartProps {
  conversations: Conversation[];
}

export const ChannelVolumeChart: React.FC<ChannelVolumeChartProps> = ({ conversations }) => {
  const { t } = useTranslation();

  const total = conversations.length || 1;
  const waCount = conversations.filter((c) => c.channel === 'whatsapp').length;
  const igCount = conversations.filter((c) => c.channel === 'instagram').length;
  const msCount = conversations.filter((c) => c.channel === 'messenger').length;

  const waPct = Math.round((waCount / total) * 100);
  const igPct = Math.round((igCount / total) * 100);
  const msPct = Math.round((msCount / total) * 100);

  const channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API',
      count: waCount,
      percentage: waPct,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      icon: MessageCircle,
      slaStatus: '24h SLA Active',
    },
    {
      id: 'instagram',
      name: 'Instagram Direct DM',
      count: igCount,
      percentage: igPct,
      color: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
      textColor: 'text-pink-700',
      icon: Instagram,
      slaStatus: '24h SLA Active',
    },
    {
      id: 'messenger',
      name: 'Facebook Messenger',
      count: msCount,
      percentage: msPct,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      icon: MessageSquare,
      slaStatus: '24h SLA Active',
    },
  ];

  return (
    <Card variant="default" padding="md" className="space-y-4 bg-white shadow-2xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900">
            {t('dashboard.channelDistribution')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Volumen por flujo omnicanal Meta Cloud API
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-slate-700">
          {conversations.length} leads
        </span>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-200/60">
        {channels.map((ch) => (
          <div
            key={ch.id}
            style={{ width: `${ch.percentage}%` }}
            className={`h-full rounded-full transition-all duration-500 ${ch.color}`}
            title={`${ch.name}: ${ch.percentage}%`}
          />
        ))}
      </div>

      {/* Channel Breakdown Rows */}
      <div className="space-y-2.5 pt-1">
        {channels.map((ch) => {
          const Icon = ch.icon;
          return (
            <div
              key={ch.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-white border border-slate-200/70 shadow-2xs">
                  <Icon className={`w-3.5 h-3.5 ${ch.textColor}`} />
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-slate-800 block truncate">
                    {ch.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {ch.slaStatus}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-slate-900 block">
                  {ch.count} <span className="text-slate-400 font-sans font-normal text-[10px]">({ch.percentage}%)</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
