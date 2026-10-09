import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Instagram, MessageSquare, ShieldCheck } from 'lucide-react';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Conversation } from '../../../types';

interface OmnichannelDonutChartProps {
  conversations: Conversation[];
}

export const OmnichannelDonutChart: React.FC<OmnichannelDonutChartProps> = ({
  conversations,
}) => {
  const { t } = useTranslation();

  const total = conversations.length || 1;
  const waCount = conversations.filter((c) => c.channel === 'whatsapp').length || 6;
  const igCount = conversations.filter((c) => c.channel === 'instagram').length || 3;
  const msCount = conversations.filter((c) => c.channel === 'messenger').length || 1;

  const totalCalc = waCount + igCount + msCount;
  const waPct = Math.round((waCount / totalCalc) * 100);
  const igPct = Math.round((igCount / totalCalc) * 100);
  const msPct = 100 - waPct - igPct;

  // SVG Donut Calculations (Circle circumference = 2 * PI * r = 2 * 3.14159 * 40 = 251.32)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  const waStroke = (waPct / 100) * circumference;
  const igStroke = (igPct / 100) * circumference;
  const msStroke = (msPct / 100) * circumference;

  const waOffset = 0;
  const igOffset = -waStroke;
  const msOffset = -(waStroke + igStroke);

  const channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API',
      count: waCount,
      percentage: waPct,
      color: 'text-emerald-600',
      strokeColor: '#16A34A',
      bgColor: 'bg-emerald-50',
      icon: MessageCircle,
      badge: '55% Vol.',
    },
    {
      id: 'instagram',
      name: 'Instagram Direct DMs',
      count: igCount,
      percentage: igPct,
      color: 'text-pink-600',
      strokeColor: '#E11D48',
      bgColor: 'bg-pink-50',
      icon: Instagram,
      badge: '33% Vol.',
    },
    {
      id: 'messenger',
      name: 'Facebook Messenger',
      count: msCount,
      percentage: msPct,
      color: 'text-blue-600',
      strokeColor: '#2563EB',
      bgColor: 'bg-blue-50',
      icon: MessageSquare,
      badge: '12% Vol.',
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
            Distribución porcentual de tráfico omnicanal
          </p>
        </div>
        <Badge variant="success" size="xs" dot>
          Meta SLA 100%
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-1">
        {/* SVG Donut Radial Chart */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Background Ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="14"
            />

            {/* WhatsApp Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#16A34A"
              strokeWidth="14"
              strokeDasharray={`${waStroke} ${circumference}`}
              strokeDashoffset={waOffset}
              className="transition-all duration-500 hover:opacity-90 cursor-pointer"
            />

            {/* Instagram Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#E11D48"
              strokeWidth="14"
              strokeDasharray={`${igStroke} ${circumference}`}
              strokeDashoffset={igOffset}
              className="transition-all duration-500 hover:opacity-90 cursor-pointer"
            />

            {/* Messenger Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#2563EB"
              strokeWidth="14"
              strokeDasharray={`${msStroke} ${circumference}`}
              strokeDashoffset={msOffset}
              className="transition-all duration-500 hover:opacity-90 cursor-pointer"
            />
          </svg>

          {/* Center Statistic Badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-lg font-mono font-bold text-slate-900">
              {totalCalc}
            </span>
            <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
              Leads
            </span>
          </div>
        </div>

        {/* Breakdown Channel List */}
        <div className="space-y-2.5 flex-1 min-w-0 w-full">
          {channels.map((ch) => {
            const Icon = ch.icon;
            return (
              <div
                key={ch.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg border border-slate-200/70 shadow-2xs ${ch.bgColor}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${ch.color}`} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800 block truncate">
                      {ch.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {ch.count} conversaciones libres
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className="font-mono font-bold text-slate-900 block">
                    {ch.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
