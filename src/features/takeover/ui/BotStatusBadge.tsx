import React from 'react';
import { useTranslation } from 'react-i18next';
import { ThreadStatus } from '../../../types';
import { STATUS_META } from '../../../entities/conversation/model/conversation.constants';
import { Badge, BadgeVariant } from '../../../shared/ui';

interface BotStatusBadgeProps {
  status: ThreadStatus;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

export const BotStatusBadge: React.FC<BotStatusBadgeProps> = ({
  status,
  size = 'xs',
  className = '',
  onClick,
}) => {
  const { t } = useTranslation();
  const meta = STATUS_META[status] || STATUS_META.bot;
  const Icon = meta.icon;

  const label =
    status === 'waiting'
      ? t('takeover.requiresAdvisor')
      : status === 'human'
      ? t('takeover.advisor')
      : t('takeover.botOnly');

  const getVariant = (): BadgeVariant => {
    switch (status) {
      case 'human':
        return 'primary';
      case 'waiting':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'bot':
      default:
        return 'tertiary';
    }
  };

  return (
    <Badge
      variant={getVariant()}
      size={size}
      className={`${status === 'waiting' ? 'animate-pulse' : ''} ${className}`}
      onClick={onClick}
    >
      <Icon className="size-2.5 shrink-0 opacity-80 mr-1 inline-block" />
      <span>{label}</span>
    </Badge>
  );
};

export default BotStatusBadge;
