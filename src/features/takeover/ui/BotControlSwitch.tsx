import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, User } from 'lucide-react';
import { ThreadStatus } from '../../../types';
import { soundFx } from '../../../shared/lib/sound';

interface BotControlSwitchProps {
  id?: string;
  status: ThreadStatus;
  onToggle: () => void;
  onSetMode?: (mode: 'bot' | 'human') => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const BotControlSwitch: React.FC<BotControlSwitchProps> = ({
  id = 'default',
  status,
  onToggle,
  onSetMode,
  size = 'md',
  className = '',
}) => {
  const { t } = useTranslation();
  const isHuman = status === 'human';

  const handleSelectBot = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    if (onSetMode) {
      onSetMode('bot');
    } else if (isHuman) {
      onToggle();
    }
  };

  const handleSelectHuman = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    if (onSetMode) {
      onSetMode('human');
    } else if (!isHuman) {
      onToggle();
    }
  };

  const padClass = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';
  const iconClass = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <div
      id={`bot-control-switch-${id}`}
      className={`inline-flex items-center p-0.5 bg-slate-100 rounded-full border border-slate-200/90 shadow-2xs select-none gap-0.5 ${className}`}
    >
      {/* Bot Option Button */}
      <button
        type="button"
        id={`btn-switch-bot-${id}`}
        onClick={handleSelectBot}
        className={`flex items-center gap-1.5 rounded-full font-semibold transition-all cursor-pointer focus-visible:outline-none ${padClass} ${
          !isHuman
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        }`}
        title={t('takeover.botActive', 'Modo autónomo con Bot')}
        aria-pressed={!isHuman}
      >
        <Bot className={`${iconClass} shrink-0 ${!isHuman ? 'text-white' : 'text-slate-500'}`} />
        <span>{t('takeover.botOnly', 'Bot')}</span>
      </button>

      {/* Human / Asesor Option Button */}
      <button
        type="button"
        id={`btn-switch-human-${id}`}
        onClick={handleSelectHuman}
        className={`flex items-center gap-1.5 rounded-full font-semibold transition-all cursor-pointer focus-visible:outline-none ${padClass} ${
          isHuman
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        }`}
        title={t('takeover.humanAdvisor', 'Atención manual por asesor de ventas')}
        aria-pressed={isHuman}
      >
        <User className={`${iconClass} shrink-0 ${isHuman ? 'text-white' : 'text-slate-500'}`} />
        <span>{t('takeover.advisor', 'Asesor')}</span>
      </button>
    </div>
  );
};
