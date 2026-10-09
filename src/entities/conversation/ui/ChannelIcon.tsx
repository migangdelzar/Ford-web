import React from 'react';
import { Channel } from '../../../types';
import { CHANNEL_META } from '../model/conversation.constants';
import { WhatsAppIcon, InstagramIcon, MessengerIcon } from './MetaBrandIcons';

export interface ChannelIconProps {
  channel: Channel;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  withBrandColor?: boolean;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const ChannelIcon: React.FC<ChannelIconProps> = ({
  channel,
  size = 'sm',
  className = '',
  withBrandColor = true,
}) => {
  const meta = CHANNEL_META[channel];
  if (!meta) return null;

  const colorClass = withBrandColor ? meta.textColor : '';
  const finalClass = `${sizeClasses[size]} ${colorClass} ${className}`;

  switch (channel) {
    case 'instagram':
      return <InstagramIcon className={finalClass} />;
    case 'messenger':
      return <MessengerIcon className={finalClass} />;
    case 'whatsapp':
    default:
      return <WhatsAppIcon className={finalClass} />;
  }
};
