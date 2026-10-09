import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Badge, Avatar, ListItem, SectionHeader } from '../../../shared/ui';
import { useCrmStore } from '../../../store/useCrmStore';
import { BRAND_CONFIG } from '../../../shared/i18n';

export const AdvisorLeaderboard: React.FC = () => {
  const { t } = useTranslation();
  const { advisorProfile } = useCrmStore();

  const advisors = [
    {
      id: advisorProfile.id,
      name: advisorProfile.name,
      email: advisorProfile.email,
      role: advisorProfile.role,
      branch: advisorProfile.branch || BRAND_CONFIG.branch,
      status: advisorProfile.status,
      assignedLeads: 6,
      closeRate: '34%',
      avgResponse: '1.2 min',
      isCurrentUser: true,
    },
    {
      id: 'adv-02',
      name: 'Sofía Valdés',
      email: `sofia.valdes@${BRAND_CONFIG.emailDomain}`,
      role: 'Especialista Ford Seminuevos Certificados',
      branch: BRAND_CONFIG.branch,
      status: 'available' as const,
      assignedLeads: 4,
      closeRate: '29%',
      avgResponse: '2.5 min',
      isCurrentUser: false,
    },
    {
      id: 'adv-03',
      name: 'Carlos Méndez',
      email: `carlos.mendez@${BRAND_CONFIG.emailDomain}`,
      role: 'Asesor Comercial Ford Credit',
      branch: BRAND_CONFIG.branch,
      status: 'in_meeting' as const,
      assignedLeads: 5,
      closeRate: '31%',
      avgResponse: '3.1 min',
      isCurrentUser: false,
    },
  ];

  const getStatusDot = (status: 'available' | 'in_meeting' | 'away') => {
    switch (status) {
      case 'available':
        return 'online' as const;
      case 'in_meeting':
        return 'busy' as const;
      case 'away':
      default:
        return 'offline' as const;
    }
  };

  const getStatusBadge = (status: 'available' | 'in_meeting' | 'away') => {
    switch (status) {
      case 'available':
        return <Badge variant="success" size="xs" dot>{t('header.statusAvailable')}</Badge>;
      case 'in_meeting':
        return <Badge variant="warning" size="xs" dot>{t('header.statusMeeting')}</Badge>;
      case 'away':
      default:
        return <Badge variant="tertiary" size="xs" dot>{t('header.statusAway')}</Badge>;
    }
  };

  return (
    <Card variant="default" padding="md" className="space-y-4 bg-white shadow-2xs">
      <SectionHeader
        title={t('dashboard.advisorCapacity')}
        subtitle="Distribución de leads y disponibilidad del equipo de ventas"
        badge={t('dashboard.activeAdvisors')}
      />

      <div className="space-y-2.5">
        {advisors.map((adv) => (
          <ListItem
            key={adv.id}
            size="md"
            active={adv.isCurrentUser}
            leading={
              <Avatar
                name={adv.name}
                size="md"
                shape="squircle"
                status={getStatusDot(adv.status)}
                fallbackBg="bg-slate-900 text-white"
              />
            }
            title={
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {adv.name}
                </span>
                {adv.isCurrentUser && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 uppercase">
                    Tú
                  </span>
                )}
                {getStatusBadge(adv.status)}
              </div>
            }
            subtitle={
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {adv.role}
              </p>
            }
            trailing={
              <div className="flex items-center gap-4 text-xs shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/50 justify-between sm:justify-end">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Leads
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {adv.assignedLeads}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Cierre Est.
                  </span>
                  <span className="font-mono font-bold text-emerald-700">
                    {adv.closeRate}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Resp. Prom.
                  </span>
                  <span className="font-mono font-medium text-slate-700">
                    {adv.avgResponse}
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
