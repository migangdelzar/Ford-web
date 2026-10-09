import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Sun, Snowflake } from 'lucide-react';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Conversation } from '../../../types';

interface LeadTemperatureFunnelProps {
  conversations: Conversation[];
}

export const LeadTemperatureFunnel: React.FC<LeadTemperatureFunnelProps> = ({ conversations }) => {
  const { t } = useTranslation();

  const total = conversations.length || 1;
  const hotCount = conversations.filter((c) => c.leadTemperature === 'hot').length;
  const warmCount = conversations.filter((c) => c.leadTemperature === 'warm').length;
  const coldCount = conversations.filter((c) => c.leadTemperature === 'cold').length;

  const hotPct = Math.round((hotCount / total) * 100);
  const warmPct = Math.round((warmCount / total) * 100);
  const coldPct = Math.round((coldCount / total) * 100);

  const tiers = [
    {
      id: 'hot',
      label: t('temperature.hot'),
      count: hotCount,
      percentage: hotPct,
      description: 'Prueba de manejo / Cierre inmediato',
      icon: Flame,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50/80',
      borderColor: 'border-rose-200/70',
      barColor: 'bg-rose-500',
      badgeVariant: 'danger' as const,
    },
    {
      id: 'warm',
      label: t('temperature.warm'),
      count: warmCount,
      percentage: warmPct,
      description: 'Cotización / Evaluación de enganche',
      icon: Sun,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-200/70',
      barColor: 'bg-amber-500',
      badgeVariant: 'warning' as const,
    },
    {
      id: 'cold',
      label: t('temperature.cold'),
      count: coldCount,
      percentage: coldPct,
      description: 'Exploración inicial de inventario',
      icon: Snowflake,
      iconColor: 'text-slate-500',
      bgColor: 'bg-slate-50/80',
      borderColor: 'border-slate-200/70',
      barColor: 'bg-slate-400',
      badgeVariant: 'neutral' as const,
    },
  ];

  return (
    <Card variant="default" padding="md" className="space-y-4 bg-white shadow-2xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900">
            {t('dashboard.temperatureFunnel')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Calificación predictiva según intención de compra
          </p>
        </div>
        <Badge variant="primary" size="xs">
          IA Scoring
        </Badge>
      </div>

      <div className="space-y-3">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <div
              key={tier.id}
              className={`p-3 rounded-xl border ${tier.bgColor} ${tier.borderColor} space-y-2`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${tier.iconColor} shrink-0`} />
                  <span className="font-bold text-slate-900">
                    {tier.label}
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    • {tier.description}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-800">
                  {tier.count} <span className="text-slate-400 font-sans font-normal text-[10px]">({tier.percentage}%)</span>
                </span>
              </div>

              {/* Individual Funnel Bar */}
              <div className="h-1.5 w-full bg-slate-200/60 rounded-full overflow-hidden">
                <div
                  style={{ width: `${tier.percentage}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${tier.barColor}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
