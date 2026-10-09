import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck } from 'lucide-react';
import { SectionHeader, Badge } from '../../../shared/ui';

interface HandoffRulesSectionProps {
  keywords: string;
  onChangeKeywords: (val: string) => void;
  handoffOnUnsure: boolean;
  onChangeHandoffOnUnsure: (val: boolean) => void;
}

export const HandoffRulesSection: React.FC<HandoffRulesSectionProps> = ({
  keywords,
  onChangeKeywords,
  handoffOnUnsure,
  onChangeHandoffOnUnsure,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <SectionHeader
        title={t('botConfig.handoffCriteria')}
        subtitle="Reglas de activación para derivación a asesores humanos"
        badge="Reglas CRM"
        badgeVariant="primary"
      />

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-[#1D1D1F] block mb-1.5">
            {t('botConfig.keywordsLabel')}
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => onChangeKeywords(e.target.value)}
            placeholder="asesor, humano, llamada, cotización, apartado, queja"
            className="w-full px-4 py-3 bg-[#F5F5F7] border border-black/[0.04] rounded-2xl text-xs text-[#1D1D1F] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all font-mono placeholder:text-[#86868B]"
          />
          <span className="text-[11px] text-[#86868B] mt-1.5 block">
            {t('botConfig.keywordsHelper')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.03] flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1D1D1F] block">
                {t('botConfig.unsureHandoffTitle')}
              </span>
              <Badge variant="warning" size="xs">
                Seguridad
              </Badge>
            </div>
            <span className="text-[11px] text-[#86868B] block mt-0.5">
              {t('botConfig.unsureHandoffSub')}
            </span>
          </div>
          <input
            type="checkbox"
            checked={handoffOnUnsure}
            onChange={(e) => onChangeHandoffOnUnsure(e.target.checked)}
            className="size-5 accent-[#0071E3] rounded cursor-pointer shrink-0"
          />
        </div>
      </div>
    </div>
  );
};

export default HandoffRulesSection;
