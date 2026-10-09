import React from 'react';
import {
  Flame,
  Sun,
  Snowflake,
  Bot,
  User,
  Clock,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { Channel, LeadTemperature, ThreadStatus } from '../../../types';
import { WhatsAppIcon, InstagramIcon, MessengerIcon } from '../ui/MetaBrandIcons';

export interface ChannelMeta {
  id: Channel;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  textColor: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  brandColor: string;
}

export const CHANNEL_META: Record<Channel, ChannelMeta> = {
  whatsapp: {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: WhatsAppIcon,
    textColor: 'text-[#25D366]',
    bgColor: 'bg-[#DCF8C6]/30',
    borderColor: 'border-[#25D366]/30',
    badgeBg: 'bg-[#25D366]',
    brandColor: '#25D366',
  },
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    icon: InstagramIcon,
    textColor: 'text-[#E1306C]',
    bgColor: 'bg-[#FDF2F8]',
    borderColor: 'border-[#E1306C]/30',
    badgeBg: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
    brandColor: '#E1306C',
  },
  messenger: {
    id: 'messenger',
    label: 'Messenger',
    icon: MessengerIcon,
    textColor: 'text-[#0084FF]',
    bgColor: 'bg-[#EFF6FF]',
    borderColor: 'border-[#0084FF]/30',
    badgeBg: 'bg-[#0084FF]',
    brandColor: '#0084FF',
  },
};

export interface TemperatureMeta {
  id: LeadTemperature;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  textColor: string;
  bgColor: string;
  borderColor: string;
  bgTint: string;
  borderTint: string;
  badgeVariant: 'danger' | 'warning' | 'neutral';
}

export const TEMPERATURE_META: Record<LeadTemperature, TemperatureMeta> = {
  hot: {
    id: 'hot',
    label: 'Caliente',
    icon: Flame,
    textColor: 'text-[#E11D48]',
    bgColor: 'bg-[#FFE4E6]/40',
    borderColor: 'border-[#E11D48]/30',
    bgTint: 'bg-[#FFE4E6]/40',
    borderTint: 'border-[#E11D48]/30',
    badgeVariant: 'danger',
  },
  warm: {
    id: 'warm',
    label: 'Tibio',
    icon: Sun,
    textColor: 'text-[#D97706]',
    bgColor: 'bg-[#FEF3C7]/40',
    borderColor: 'border-[#D97706]/30',
    bgTint: 'bg-[#FEF3C7]/40',
    borderTint: 'border-[#D97706]/30',
    badgeVariant: 'warning',
  },
  cold: {
    id: 'cold',
    label: 'Frío',
    icon: Snowflake,
    textColor: 'text-[#94A3B8]',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    bgTint: 'bg-slate-50',
    borderTint: 'border-slate-200',
    badgeVariant: 'neutral',
  },
};

export interface StatusMeta {
  id: ThreadStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  textColor: string;
  bgColor: string;
}

export const STATUS_META: Record<ThreadStatus, StatusMeta> = {
  bot: {
    id: 'bot',
    label: 'Bot',
    icon: Bot,
    textColor: 'text-[#4A8FA8]',
    bgColor: 'bg-[#EAF2F5]',
  },
  human: {
    id: 'human',
    label: 'Asesor',
    icon: User,
    textColor: 'text-[#007AFF]',
    bgColor: 'bg-[#E8F1FF]',
  },
  waiting: {
    id: 'waiting',
    label: 'Atención requerida',
    icon: Clock,
    textColor: 'text-[#C17E1F]',
    bgColor: 'bg-[#FCF7EB]',
  },
  failed: {
    id: 'failed',
    label: 'Error de entrega',
    icon: AlertTriangle,
    textColor: 'text-[#C4453A]',
    bgColor: 'bg-[#FDF0ED]',
  },
};
