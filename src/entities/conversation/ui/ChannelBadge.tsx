import React from 'react';
import { Channel } from '../../../types';
import { WhatsAppIcon, InstagramIcon, MessengerIcon } from './MetaBrandIcons';

interface ChannelBadgeProps {
  channel: Channel;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const ChannelBadge: React.FC<ChannelBadgeProps> = ({
  channel,
  size = 'sm',
  showLabel = false,
}) => {
  const iconSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';
  const boxSize = size === 'sm' ? 'w-4.5 h-4.5' : 'w-5.5 h-5.5';

  const config = {
    whatsapp: {
      Icon: WhatsAppIcon,
      bg: 'bg-[#25D366] text-white',
      label: 'WhatsApp',
      pillBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
    },
    instagram: {
      Icon: InstagramIcon,
      bg: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white',
      label: 'Instagram',
      pillBg: 'bg-pink-50 text-pink-800 border-pink-200/60',
    },
    messenger: {
      Icon: MessengerIcon,
      bg: 'bg-[#0084FF] text-white',
      label: 'Messenger',
      pillBg: 'bg-blue-50 text-blue-800 border-blue-200/60',
    },
  }[channel];

  const IconComponent = config.Icon;

  if (showLabel) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${config.pillBg}`}
      >
        <span className={`${boxSize} rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
          <IconComponent className={iconSize} />
        </span>
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <span
      className={`${boxSize} rounded-full ${config.bg} flex items-center justify-center shadow-2xs shrink-0`}
      title={config.label}
    >
      <IconComponent className={iconSize} />
    </span>
  );
};
