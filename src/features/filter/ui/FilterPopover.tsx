import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, Check, RotateCcw, Layers } from 'lucide-react';
import { DropdownPopover } from '../../../shared/ui/DropdownPopover';
import { Channel, LeadTemperature } from '../../../types';
import { CHANNEL_META, TEMPERATURE_META } from '../../../entities/conversation/model/conversation.constants';

export interface FilterPopoverProps {
  channelFilter: 'all' | Channel;
  setChannelFilter: (channel: 'all' | Channel) => void;
  tempFilter: 'all' | LeadTemperature;
  setTempFilter: (temp: 'all' | LeadTemperature) => void;
  onClearAll: () => void;
  activeCount: number;
}

export const FilterPopover: React.FC<FilterPopoverProps> = ({
  channelFilter,
  setChannelFilter,
  tempFilter,
  setTempFilter,
  onClearAll,
  activeCount,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Local state for intentional application
  const [localChannel, setLocalChannel] = useState<'all' | Channel>(channelFilter);
  const [localTemp, setLocalTemp] = useState<'all' | LeadTemperature>(tempFilter);

  // Sync local states when the popover opens
  useEffect(() => {
    if (isOpen) {
      setLocalChannel(channelFilter);
      setLocalTemp(tempFilter);
    }
  }, [isOpen, channelFilter, tempFilter]);

  const channelOptions: { id: 'all' | Channel; label: string; icon?: any; color?: string }[] = [
    { id: 'all', label: t('threads.channelAll'), icon: Layers, color: 'text-slate-600' },
    ...Object.values(CHANNEL_META).map((c) => ({
      id: c.id,
      label: c.label,
      icon: c.icon,
      color: c.textColor,
    })),
  ];

  const tempOptions: { id: 'all' | LeadTemperature; label: string; icon?: any; color?: string }[] = [
    { id: 'all', label: t('threads.filterAll'), icon: Layers, color: 'text-slate-600' },
    ...Object.values(TEMPERATURE_META).map((m) => ({
      id: m.id,
      label: m.label,
      icon: m.icon,
      color: m.textColor,
    })),
  ];

  // Calculated count based on active selections
  const localActiveCount = (localChannel !== 'all' ? 1 : 0) + (localTemp !== 'all' ? 1 : 0);

  return (
    <DropdownPopover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      width="w-68"
      trigger={
        <button
          type="button"
          id="btn-open-filters"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all select-none ${
            activeCount > 0 || isOpen
              ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/70'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('threads.filters')}</span>
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#007AFF] text-white text-[10px] font-bold flex items-center justify-center tabular-nums leading-none">
              {activeCount}
            </span>
          )}
        </button>
      }
    >
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900">{t('threads.filters')}</span>
          {localActiveCount > 0 && (
            <span className="text-[10px] text-slate-400 font-medium">
              {localActiveCount} por aplicar
            </span>
          )}
        </div>

        {/* Channel Filter Group */}
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
            {t('threads.filterByChannel')}
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {channelOptions.map((ch) => {
              const isSelected = localChannel === ch.id;
              const Icon = ch.icon;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setLocalChannel(ch.id)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {Icon && <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : ch.color}`} />}
                    <span className="truncate">{ch.label}</span>
                  </span>
                  {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Temperature Filter Group */}
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
            {t('threads.filterByTemp')}
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {tempOptions.map((temp) => {
              const isSelected = localTemp === temp.id;
              const Icon = temp.icon;
              return (
                <button
                  key={temp.id}
                  type="button"
                  onClick={() => setLocalTemp(temp.id)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {Icon && <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : temp.color}`} />}
                    <span className="truncate">{temp.label}</span>
                  </span>
                  {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Intentional Apply/Clear Footer */}
        <div className="pt-2.5 border-t border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setLocalChannel('all');
              setLocalTemp('all');
              onClearAll();
              setIsOpen(false);
            }}
            className="flex-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={() => {
              setChannelFilter(localChannel);
              setTempFilter(localTemp);
              setIsOpen(false);
            }}
            className="flex-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-[#007AFF] hover:bg-[#007AFF]/90 text-white shadow-2xs transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </DropdownPopover>
  );
};
