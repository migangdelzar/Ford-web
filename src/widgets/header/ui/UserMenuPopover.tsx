import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Check,
  Building2,
  Mail,
  RotateCcw,
  LogOut,
  UserCheck,
  Bell,
  BellRing,
  Send,
  KeyRound,
} from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
import { useToast } from '../../../shared/ui/SonnerToast';
import { DropdownPopover, Avatar, StatusDot, Button } from '../../../shared/ui';
import { PWAInstallButton, useWebNotifications } from '../../../shared/lib/pwa';
import { registerPasskey } from '../../../pages/login/passkeyRegistration';

interface UserMenuPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserMenuPopover: React.FC<UserMenuPopoverProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { advisorProfile, setAdvisorStatus, resetAllData, userRole, logout, conversations } = useCrmStore();
  const { toast } = useToast();
  const { isSubscribed, togglePushSubscription, sendTestPush } = useWebNotifications();
  const [registeringPasskey, setRegisteringPasskey] = useState(false);

  const totalNotifications = conversations.reduce(
    (acc, c) => acc + (c.unreadCount || 0) + (c.status === 'waiting' ? 1 : 0),
    0
  );

  const handleStatusChange = (status: 'available' | 'in_meeting' | 'away') => {
    setAdvisorStatus(status);
    const label =
      status === 'available'
        ? t('header.statusAvailable')
        : status === 'in_meeting'
        ? t('header.statusMeeting')
        : t('header.statusAway');

    toast({
      type: 'info',
      title: `${t('header.profileTitle')}: ${label}`,
    });
  };

  const handleReset = () => {
    if (window.confirm(t('nav.resetConfirm'))) {
      resetAllData();
      toast({
        type: 'info',
        title: t('nav.resetSimulator'),
      });
      onClose();
    }
  };

  const handleLogout = async () => {
    onClose();
    try {
      await logout();
      toast({
        type: 'info',
        title: t('login.sessionEnded'),
        description: t('header.logoutDescription', { brand: t('brand.name') }),
      });
    } catch {
      toast({ type: 'error', title: 'No se pudo cerrar la sesión en el servidor.' });
    }
  };

  const handleRegisterPasskey = async () => {
    setRegisteringPasskey(true);
    try {
      await registerPasskey();
      toast({ type: 'success', title: 'Passkey registrada en esta cuenta.' });
    } catch (error) {
      toast({
        type: 'error',
        title: error instanceof Error ? error.message : 'No se pudo registrar la passkey.',
      });
    } finally {
      setRegisteringPasskey(false);
    }
  };

  return (
    <DropdownPopover isOpen={isOpen} onClose={onClose} width="w-80">
      <div className="divide-y divide-black/[0.06]">
        {/* User Profile Card Header */}
        <div className="p-4 bg-[#F5F5F7]/80">
          <div className="flex items-start gap-3">
            <Avatar name={advisorProfile.name} size="md" shape="squircle" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-[#1D1D1F] truncate">
                  {advisorProfile.name}
                </h3>
                <StatusDot status="online" size="xs" />
              </div>

              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex flex-row items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F1FF] border border-[#0071E3]/20 whitespace-nowrap">
                  <UserCheck className="size-3 text-[#0071E3] shrink-0" />
                  <span className="text-[11px] font-semibold text-[#1D1D1F]">
                    {userRole === 'propietario' ? 'Admin' : userRole === 'gerente' ? 'Gerencia' : 'Asesor'}
                  </span>
                  <span className="bg-[#0071E3] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                    {totalNotifications}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-[#86868B] mt-1.5 truncate">
                <Mail className="size-3 text-[#86868B] shrink-0" />
                <span className="truncate text-[10.5px]">{advisorProfile.email}</span>
              </div>

              <button
                type="button"
                onClick={() => void handleRegisterPasskey()}
                disabled={registeringPasskey}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-[#0071E3] hover:bg-[#E8F1FF] disabled:cursor-wait disabled:opacity-60"
              >
                <KeyRound className="size-3.5" />
                {registeringPasskey ? 'Registrando…' : 'Registrar passkey'}
              </button>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-black/[0.06] flex items-center justify-between text-[11px] text-[#86868B]">
            <span className="flex items-center gap-1 truncate">
              <Building2 className="size-3.5 text-[#86868B] shrink-0" />
              <span className="truncate">{advisorProfile.branch}</span>
            </span>
            <span className="font-mono font-semibold text-[#1D1D1F] tabular-nums shrink-0 ml-2">
              {advisorProfile.assignedCount} leads
            </span>
          </div>
        </div>

        {/* Web Push Notifications & PWA Section */}
        <div className="p-3.5 bg-white space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#86868B]">
              Web App (PWA) & Push Notifications
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                isSubscribed
                  ? 'bg-[#EDF6F0] text-[#16A34A]'
                  : 'bg-[#F5F5F7] text-[#86868B]'
              }`}
            >
              {isSubscribed ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={async () => {
                const res = await togglePushSubscription();
                if (res === 'denied') {
                  toast({
                    type: 'warning',
                    title: 'Habilita los permisos de notificación en tu navegador',
                  });
                } else {
                  toast({
                    type: 'info',
                    title: !isSubscribed
                      ? 'Notificaciones Push activadas'
                      : 'Notificaciones Push silenciadas',
                  });
                }
              }}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                isSubscribed
                  ? 'bg-[#EDF6F0] text-[#16A34A] border-[#16A34A]/20'
                  : 'bg-[#F5F5F7] hover:bg-[#EEF0F3] text-[#1D1D1F] border-black/[0.06]'
              }`}
            >
              {isSubscribed ? (
                <BellRing className="size-3.5 shrink-0" />
              ) : (
                <Bell className="size-3.5 shrink-0" />
              )}
              <span>{isSubscribed ? 'Push Activo' : 'Activar Push'}</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                const sent = await sendTestPush();
                toast({
                  type: sent ? 'success' : 'info',
                  title: sent
                    ? 'Notificación Push enviada al dispositivo'
                    : 'Notificación simulada (verifica permisos del navegador)',
                });
              }}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-[#F5F5F7] hover:bg-[#E8F1FF] text-[#1D1D1F] hover:text-[#0071E3] border border-black/[0.06] text-xs font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              title="Enviar notificación Push de prueba"
            >
              <Send className="size-3 shrink-0" />
              <span>Probar</span>
            </button>
          </div>

          <PWAInstallButton />
        </div>

        {/* Availability Status Selector */}
        <div className="p-3.5 bg-white">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#86868B] block mb-2 px-1">
            {t('header.switchStatus')}
          </span>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleStatusChange('available')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                advisorProfile.status === 'available'
                  ? 'bg-[#34C759]/[0.08] text-[#248A3D]'
                  : 'text-[#1D1D1F] hover:bg-[#F5F5F7]'
              }`}
            >
              <div className="flex items-center gap-2">
                <StatusDot status="online" size="xs" />
                <span>{t('header.statusAvailable')}</span>
              </div>
              {advisorProfile.status === 'available' && (
                <Check className="size-3.5 text-[#248A3D] stroke-[2.5]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('in_meeting')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                advisorProfile.status === 'in_meeting'
                  ? 'bg-[#FF9500]/[0.08] text-[#C17E1F]'
                  : 'text-[#1D1D1F] hover:bg-[#F5F5F7]'
              }`}
            >
              <div className="flex items-center gap-2">
                <StatusDot status="busy" size="xs" />
                <span>{t('header.statusMeeting')}</span>
              </div>
              {advisorProfile.status === 'in_meeting' && (
                <Check className="size-3.5 text-[#C17E1F] stroke-[2.5]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('away')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                advisorProfile.status === 'away'
                  ? 'bg-black/[0.05] text-[#1D1D1F]'
                  : 'text-[#1D1D1F] hover:bg-[#F5F5F7]'
              }`}
            >
              <div className="flex items-center gap-2">
                <StatusDot status="away" size="xs" />
                <span>{t('header.statusAway')}</span>
              </div>
              {advisorProfile.status === 'away' && (
                <Check className="size-3.5 text-[#1D1D1F] stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>

        {/* Actions & Logout Footer */}
        <div className="p-2 bg-[#F5F5F7]/80 flex items-center justify-between text-xs">
          <Button
            variant="ghost"
            size="xs"
            onClick={handleReset}
            leftIcon={<RotateCcw className="size-3.5" />}
          >
            {t('botConfig.reset')}
          </Button>

          <Button
            variant="danger"
            size="xs"
            onClick={handleLogout}
            leftIcon={<LogOut className="size-3.5" />}
          >
            {t('header.logout')}
          </Button>
        </div>
      </div>
    </DropdownPopover>
  );
};

export default UserMenuPopover;
