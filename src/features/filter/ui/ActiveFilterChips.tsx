import React from 'react';
import { useTranslation } from 'react-i18next';
import { FilterChip } from '../../../shared/ui/FilterChip';
import { Channel, LeadTemperature } from '../../../types';
import { CHANNEL_META, TEMPERATURE_META } from '../../../entities/conversation/model/conversation.constants';

export interface ActiveFilterChipsProps {
  channelFilter: 'all' | Channel;
  onRemoveChannel: () => void;
  tempFilter: 'all' | LeadTemperature;
  onRemoveTemp: () => void;
  onClearAll: () => void;
  className?: string;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  channelFilter,
  onRemoveChannel,
  tempFilter,
  onRemoveTemp,
  onClearAll,
  className = '',
}) => {
  const { t } = useTranslation();
  const hasActiveFilters = channelFilter !== 'all' || tempFilter !== 'all';

  if (!hasActiveFilters) return null;

  const channelMeta = channelFilter !== 'all' ? CHANNEL_META[channelFilter] : null;
  const tempMeta = tempFilter !== 'all' ? TEMPERATURE_META[tempFilter] : null;

  return (
    <div className={`flex items-center gap-1.5 flex-wrap pt-0.5 ${className}`}>
      {channelMeta && (
        <FilterChip
          label={channelMeta.label}
          onRemove={onRemoveChannel}
          icon={React.createElement(channelMeta.icon, {
            className: `w-3 h-3 ${channelMeta.textColor}`,
          })}
          variant="blue"
        />
      )}

      {tempMeta && (
        <FilterChip
          label={tempMeta.label}
          onRemove={onRemoveTemp}
          icon={React.createElement(tempMeta.icon, {
            className: `w-3 h-3 ${tempMeta.textColor}`,
          })}
          variant={tempMeta.badgeVariant === 'danger' ? 'rose' : tempMeta.badgeVariant === 'warning' ? 'amber' : 'slate'}
        />
      )}

      <button
        type="button"
        onClick={onClearAll}
        className="text-[11px] text-slate-400 hover:text-slate-700 font-medium ml-auto transition-colors"
      >
        {t('threads.clearFilters')}
      </button>
    </div>
  );
};
