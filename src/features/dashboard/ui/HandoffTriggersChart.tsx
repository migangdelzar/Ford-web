import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, User, Clock, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Conversation } from '../../../types';

interface HandoffTriggersChartProps {
  conversations: Conversation[];
}

export const HandoffTriggersChart: React.FC<HandoffTriggersChartProps> = ({ conversations }) => {
  const { t } = useTranslation();

  const total = conversations.length || 1;
  const botCount = conversations.filter((c) => c.status === 'bot').length;
  const humanCount = conversations.filter((c) => c.status === 'human').length;
  const waitingCount = conversations.filter((c) => c.status === 'waiting').length;

  const openWindows = conversations.filter((c) => c.isWindowOpen).length;
  const closedWindows = conversations.filter((c) => !c.isWindowOpen).length;

  const autoRate = Math.round((botCount / total) * 100);
  const complianceRate = Math.round((openWindows / total) * 100);

  const triggers = [
    {
      category: 'Solicitud de Crédito / Enganche',
      count: 4,
      percentage: 40,
      priority: 'Alta',
    },
    {
      category: 'Prueba de Manejo en Agencia',
      count: 3,
      percentage: 30,
      priority: 'Alta',
    },
    {
      category: 'Solicitud Explícita de Asesor Humano',
      count: 2,
      percentage: 20,
      priority: 'Media',
    },
    {
      category: 'Queja / Duda fuera de catálogo',
      count: 1,
      percentage: 10,
      priority: 'Crítica',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Meta 24h Window & SLA Status */}
      <Card variant="default" padding="md" className="space-y-3.5 bg-white shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              {t('dashboard.activeWindowStatus')}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Meta Cloud API 24h Customer Service Window
            </p>
          </div>
          <Badge variant="success" size="xs" dot>
            {complianceRate}% {t('dashboard.kpiMetaCompliance')}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('dashboard.openWindows')}</span>
            </div>
            <span className="text-xl font-bold font-mono text-emerald-900">
              {openWindows}
            </span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">
              Mensajería libre activa
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('dashboard.expiredWindows')}</span>
            </div>
            <span className="text-xl font-bold font-mono text-amber-900">
              {closedWindows}
            </span>
            <span className="text-[10px] text-amber-700 block mt-0.5">
              Plantilla WhatsApp requerida
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Automatización en tiempo real</span>
          </span>
          <span className="font-mono font-bold text-slate-800">
            {autoRate}% resuelto por Concierge IA
          </span>
        </div>
      </Card>

      {/* 2. Commercial Handoff Triggers */}
      <Card variant="default" padding="md" className="space-y-3.5 bg-white shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              {t('dashboard.handoffTriggers')}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Motivos detectados por IA para derivación humana
            </p>
          </div>
          <Badge variant="purple" size="xs">
            Auto-Classifier
          </Badge>
        </div>

        <div className="space-y-2 pt-1">
          {triggers.map((trig, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
            >
              <div className="min-w-0 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span className="font-medium text-slate-800 truncate">
                  {trig.category}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono font-semibold text-slate-700 text-[11px]">
                  {trig.count} leads
                </span>
                <Badge
                  variant={trig.priority === 'Crítica' ? 'danger' : 'tertiary'}
                  size="xs"
                >
                  {trig.priority}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
