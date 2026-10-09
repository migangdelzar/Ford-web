import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Flame, Sun, Snowflake } from 'lucide-react';
import { LeadTemperature } from '../../../types';
import { SNAPPY_SPRING } from '../../../shared/lib/motion';

interface LeadHeatSliderProps {
  temperature: LeadTemperature;
  onChange: (temp: LeadTemperature) => void;
  source?: 'human' | 'ai';
}

export const LeadHeatSlider: React.FC<LeadHeatSliderProps> = ({
  temperature,
  onChange,
  source,
}) => {
  const { t } = useTranslation();

  const levels: {
    id: LeadTemperature;
    label: string;
    Icon: React.FC<{ className?: string }>;
    selectedClass: string;
    iconColor: string;
  }[] = [
    {
      id: 'cold',
      label: t('temperature.cold'),
      Icon: Snowflake,
      selectedClass: 'text-slate-900 font-semibold',
      iconColor: 'text-slate-500',
    },
    {
      id: 'warm',
      label: t('temperature.warm'),
      Icon: Sun,
      selectedClass: 'text-amber-900 font-semibold',
      iconColor: 'text-amber-500',
    },
    {
      id: 'hot',
      label: t('temperature.hot'),
      Icon: Flame,
      selectedClass: 'text-rose-900 font-semibold',
      iconColor: 'text-rose-500',
    },
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {t('temperature.title')}
        </span>
        {source && (
          <span className="text-[10px] font-medium text-slate-400">
            {source === 'human' ? 'Ajuste manual' : 'Calificado por IA'}
          </span>
        )}
      </div>

      {/* Enterprise Single-Surface Segmented Control */}
      <div className="p-0.5 bg-slate-100 rounded-lg border border-slate-200/70 flex items-center gap-0.5 relative select-none">
        {levels.map((lvl) => {
          const isSelected = temperature === lvl.id;
          const IconComponent = lvl.Icon;

          return (
            <button
              key={lvl.id}
              id={`btn-heat-${lvl.id}`}
              type="button"
              onClick={() => onChange(lvl.id)}
              className={`relative flex-1 py-1 px-2 rounded-[6px] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors z-10 cursor-pointer focus-visible:outline-none ${
                isSelected ? lvl.selectedClass : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="heat-slider-active-pill"
                  transition={SNAPPY_SPRING}
                  className="absolute inset-0 rounded-[6px] bg-white shadow-2xs border border-slate-200/80"
                />
              )}

              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <IconComponent
                  className={`w-3.5 h-3.5 transition-transform ${
                    isSelected ? lvl.iconColor : 'text-slate-400'
                  }`}
                />
                <span>{lvl.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
