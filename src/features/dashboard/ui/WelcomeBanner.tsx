import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  Building2,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
import { Badge, Button, Avatar, IconBadge } from '../../../shared/ui';

export const WelcomeBanner: React.FC = () => {
  const { t } = useTranslation();
  const { advisorProfile, conversations, setActiveTab } = useCrmStore();

  const hotLeadsCount = conversations.filter((c: any) => c.leadTemperature === 'hot').length;
  const activeAssignedLeads = conversations.filter(
    (c: any) => c.status === 'human'
  ).length;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-5 sm:p-6 shadow-md border border-slate-800">
      <div className="absolute -top-12 -right-12 size-64 bg-[#0071E3]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 size-64 bg-[#34C759]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4 min-w-0">
          <Avatar name={advisorProfile.name} size="lg" status="online" shape="squircle" />

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-[#0071E3] uppercase tracking-wider bg-[#0071E3]/20 px-2 py-0.5 rounded-md border border-[#0071E3]/30">
                {advisorProfile.role}
              </span>
              <Badge variant="success" size="xs" dot>
                Disponible
              </Badge>
            </div>

            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              ¡Hola, {advisorProfile.name}! 👋
            </h2>

            <p className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-slate-300">
                <Building2 className="size-3.5 text-[#0071E3] shrink-0" />
                {advisorProfile.branch}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-mono">
                {advisorProfile.email}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-700/60">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-3">
            <IconBadge icon={UserCheck} color="blue" size="sm" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-300 block">
                Leads Asignados
              </span>
              <span className="text-sm font-bold font-mono text-white">
                {activeAssignedLeads} / 10 Capacidad
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-3">
            <IconBadge icon={Flame} color="amber" size="sm" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-300 block">
                Urgencia Alta
              </span>
              <span className="text-sm font-bold font-mono text-amber-300">
                {hotLeadsCount} Leads Calientes
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            rightIcon={<ArrowRight className="size-4" />}
            onClick={() => setActiveTab('inbox')}
            className="shadow-lg shadow-[#0071E3]/30"
          >
            Atender Leads
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
