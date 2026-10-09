import React from 'react';
import { Channel } from '../../../types';
import { CHANNEL_META } from '../model/conversation.constants';
import { WhatsAppIcon, InstagramIcon, MessengerIcon } from './MetaBrandIcons';
import { Avatar } from '../../../shared/ui';

export interface ChannelAvatarProps {
  avatarUrl: string;
  name: string;
  channel: Channel;
  size?: 'sm' | 'md' | 'lg';
}

export const ChannelAvatar: React.FC<ChannelAvatarProps> = ({
  avatarUrl,
  name,
  channel,
  size = 'md',
}) => {
  const meta = CHANNEL_META[channel] || CHANNEL_META.whatsapp;

  const badgeSize = size === 'sm' ? 'size-3.5' : size === 'lg' ? 'size-4.5' : 'size-4';
  const iconSize = size === 'sm' ? 'size-2' : size === 'lg' ? 'size-2.5' : 'size-2.5';

  const renderChannelLogo = () => {
    switch (channel) {
      case 'instagram':
        return <InstagramIcon className={`${iconSize} text-white`} />;
      case 'messenger':
        return <MessengerIcon className={`${iconSize} text-white`} />;
      case 'whatsapp':
      default:
        return <WhatsAppIcon className={`${iconSize} text-white`} />;
    }
  };

  const channelBadge = (
    <span
      className={`${badgeSize} rounded-full ${meta.badgeBg} ring-2 ring-white shadow-xs flex items-center justify-center`}
      aria-hidden="true"
    >
      {renderChannelLogo()}
    </span>
  );

  return (
    <div title={`Canal oficial: ${meta.label}`}>
      <Avatar
        src={avatarUrl}
        name={name}
        size={size}
        shape="circle"
        badge={channelBadge}
        alt={`Fotografía de ${name}`}
      />
    </div>
  );
};
