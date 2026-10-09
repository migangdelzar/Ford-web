import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  Bot,
  Clock,
  Flame,
} from 'lucide-react';
import { Card, Badge, IconBadge, IconBadgeColor, ListItem, SectionHeader } from '../../../shared/ui';

export const RecentActivitiesFeed: React.FC = () => {
  const { t } = useTranslation();

  const recentItems: Array<{
    id: string;
    title: string;
    actor: string;
    target: string;
    detail: string;
    time: string;
    icon: typeof UserCheck;
    color: IconBadgeColor;
    badge: string;
    badgeVariant: 'primary' | 'warning' | 'success' | 'purple';
  }> = [
    {
      id: 'act-1',
      title: 'Derivación Prioritaria a Asesor',
      actor: 'Concierge IA',
      target: 'Miky Delzar',
      detail: 'Lead Fernando Ruiz solicitó prueba de manejo para Mustang Dark Horse',
      time: 'Hace 4 min',
      icon: UserCheck,
      color: 'blue',
      badge: 'Prueba de Manejo',
      badgeVariant: 'primary',
    },
    {
      id: 'act-2',
      title: 'Calificación de Lead Caliente',
      actor: 'Sistema Scoring',
      target: 'Ford Bronco Badlands 4x4',
      detail: 'Enganche detectado de $350,000 MXN en WhatsApp Business API',
      time: 'Hace 18 min',
      icon: Flame,
      color: 'amber',
      badge: 'Enganche $350k',
      badgeVariant: 'warning',
    },
    {
      id: 'act-3',
      title: 'Respuesta Autónoma Completada',
      actor: 'Concierge IA',
      target: 'Instagram DM',
      detail: 'Ficha técnica y plan Ford Credit enviado a Valeria Gómez',
      time: 'Hace 42 min',
      icon: Bot,
      color: 'green',
      badge: 'Resuelto IA',
      badgeVariant: 'success',
    },
    {
      id: 'act-4',
      title: 'Alerta SLA Ventana Meta 24h',
      actor: 'Meta Cloud API',
      target: 'Messenger',
      detail: 'Ventana activa por expirar en 2 horas para prospecto Roberto M.',
      time: 'Hace 1 hora',
      icon: Clock,
      color: 'purple',
      badge: 'Plantilla HSM',
      badgeVariant: 'purple',
    },
  ];

  return (
    <Card variant="default" padding="md" className="space-y-4 bg-white shadow-2xs">
      <SectionHeader
        title={t('dashboard.recentActivity')}
        subtitle={t('dashboard.recentActivitySubtitle', { brand: t('brand.name') })}
        badge={t('dashboard.liveFeed')}
      />

      <div className="space-y-2.5 pt-1">
        {recentItems.map((item) => (
          <ListItem
            key={item.id}
            size="sm"
            leading={<IconBadge icon={item.icon} color={item.color} size="sm" />}
            title={
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900 truncate">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {item.time}
                </span>
              </div>
            }
            subtitle={
              <div className="space-y-1.5 mt-0.5">
                <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                  {item.detail}
                </p>
                <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                  <Badge variant={item.badgeVariant} size="xs">
                    {item.badge}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    Origen: <span className="font-medium text-slate-700">{item.actor}</span>
                  </span>
                </div>
              </div>
            }
          />
        ))}
      </div>
    </Card>
  );
};
