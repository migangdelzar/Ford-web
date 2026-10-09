import React from 'react';
import { useTranslation } from 'react-i18next';
import { LeadTemperature } from '../../../types';

interface CommercialRecommendationCardProps {
  temperature: LeadTemperature;
}

export const CommercialRecommendationCard: React.FC<CommercialRecommendationCardProps> = ({
  temperature,
}) => {
  const { t } = useTranslation();

  const getRecommendation = () => {
    if (temperature === 'hot') {
      return {
        action: t('prospect.priorityClose'),
        detail: t('prospect.priorityCloseDesc'),
        borderClass: 'border-l-rose-500 bg-rose-50/50',
        titleClass: 'text-rose-950',
        detailClass: 'text-rose-900/80',
      };
    }
    if (temperature === 'warm') {
      return {
        action: t('prospect.quoteDrive'),
        detail: t('prospect.quoteDriveDesc'),
        borderClass: 'border-l-amber-500 bg-amber-50/50',
        titleClass: 'text-amber-950',
        detailClass: 'text-amber-900/80',
      };
    }
    return {
      action: t('prospect.catalogExplore'),
      detail: t('prospect.catalogExploreDesc'),
      borderClass: 'border-l-slate-400 bg-slate-50/70',
      titleClass: 'text-slate-900',
      detailClass: 'text-slate-600',
    };
  };

  const rec = getRecommendation();

  return (
    <div className={`p-2.5 rounded-r-lg border-l-2 ${rec.borderClass} space-y-0.5 transition-colors`}>
      <div className={`text-xs font-semibold tracking-tight ${rec.titleClass}`}>
        {rec.action}
      </div>
      <p className={`text-[11px] leading-relaxed ${rec.detailClass}`}>
        {rec.detail}
      </p>
    </div>
  );
};
