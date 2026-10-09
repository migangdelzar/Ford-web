import React from 'react';
import { Bot, User, AlertCircle, XCircle } from 'lucide-react';
import { ThreadStatus } from '../../../types';

interface ThreadStatusChipProps {
  status: ThreadStatus;
  size?: 'sm' | 'md';
}

export const ThreadStatusChip: React.FC<ThreadStatusChipProps> = ({ status, size = 'sm' }) => {
  const config = {
    bot: {
      icon: Bot,
      label: 'Bot',
      class: 'bg-purple-50 text-purple-700 border-purple-200/80',
      iconClass: 'text-purple-600',
    },
    human: {
      icon: User,
      label: 'Agente',
      class: 'bg-blue-50 text-blue-700 border-blue-200/80',
      iconClass: 'text-blue-600',
    },
    waiting: {
      icon: AlertCircle,
      label: 'Espera',
      class: 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse',
      iconClass: 'text-amber-600',
    },
    failed: {
      icon: XCircle,
      label: 'Falla',
      class: 'bg-rose-50 text-rose-700 border-rose-200',
      iconClass: 'text-rose-600',
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium border ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      } ${config.class}`}
    >
      <Icon className={`w-3 h-3 ${config.iconClass}`} />
      <span>{config.label}</span>
    </span>
  );
};
