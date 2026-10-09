import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  BellRing,
  MessageSquare,
  UserPlus,
  Settings2,
  ArrowRight,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
import { DropdownPopover } from '../../../shared/ui';
import { useWebNotifications } from '../../../shared/lib/pwa';
import { useToast } from '../../../shared/ui/SonnerToast';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const { t } = useTranslation();
  const { conversations, messages, selectConversation, setActiveTab } = useCrmStore();
  const { isSubscribed, togglePushSubscription, sendTestPush } = useWebNotifications();
  const { toast } = useToast();

  // Gather actionable conversations (waiting handoffs or unread messages)
  const actionableItems = conversations
    .filter((c) => (c.unreadCount || 0) > 0 || c.status === 'waiting')
    .sort((a, b) => {
      if (a.status === 'waiting' && b.status !== 'waiting') return -1;
      if (b.status === 'waiting' && a.status !== 'waiting') return 1;
      return (b.unreadCount || 0) - (a.unreadCount || 0);
    })
    .slice(0, 6);

  const handleOpenThread = (conversationId: string) => {
    setActiveTab('inbox');
    selectConversation(conversationId);
    onClose();
  };

  return (
    <DropdownPopover isOpen={isOpen} onClose={onClose} width="w-80 sm:w-96" className="p-0 overflow-hidden">
      <div className="divide-y divide-slate-100 select-none">
        {/* Header */}
        <div className="px-4 py-3 bg-white flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Centro de Notificaciones</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Mensajes entrantes y solicitudes de asesor
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Settings2 className="size-3.5" />
            <span>Ajustes</span>
          </button>
        </div>

        {/* Web Push Quick Bar */}
        <div className="px-4 py-2.5 bg-slate-50/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {isSubscribed ? (
              <BellRing className="size-3.5 text-emerald-600 shrink-0" />
            ) : (
              <Bell className="size-3.5 text-slate-400 shrink-0" />
            )}
            <span className="text-[11px] font-medium text-slate-700 truncate">
              {isSubscribed
                ? 'Alertas Push activas en este dispositivo'
                : 'Activa alertas Push para avisos en tiempo real'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isSubscribed && (
              <button
                type="button"
                onClick={async () => {
                  const sent = await sendTestPush();
                  toast({
                    type: sent ? 'success' : 'info',
                    title: sent
                      ? 'Notificación Push enviada'
                      : 'Notificación simulada en navegador',
                  });
                }}
                className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200/80 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
                title="Probar notificación Push"
              >
                <Send className="size-3" />
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                const res = await togglePushSubscription();
                if (res === 'denied') {
                  toast({
                    type: 'warning',
                    title: 'Permiso bloqueado en la configuración del navegador',
                  });
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                isSubscribed
                  ? 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-100'
                  : 'bg-[#0071E3] text-white hover:bg-[#0062C4]'
              }`}
            >
              {isSubscribed ? 'Silenciar' : 'Activar'}
            </button>
          </div>
        </div>

        {/* Actionable List */}
        <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 bg-white">
          {actionableItems.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <CheckCircle2 className="size-6 text-emerald-500 mx-auto mb-2 stroke-[1.75]" />
              <p className="text-xs font-semibold text-slate-800">Todo al día</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                No tienes mensajes pendientes ni transferencias en espera.
              </p>
            </div>
          ) : (
            actionableItems.map((conv) => {
              const isWaiting = conv.status === 'waiting';
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleOpenThread(conv.id)}
                  className="w-full px-4 py-3 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 text-left cursor-pointer"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`mt-0.5 size-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isWaiting
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-blue-50 text-[#0071E3]'
                      }`}
                    >
                      {isWaiting ? (
                        <UserPlus className="size-3.5" />
                      ) : (
                        <MessageSquare className="size-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {conv.customerName}
                        </span>
                        <span className="text-[11px] text-slate-400" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-[11px] text-slate-500 capitalize">
                          {conv.channel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5 max-w-[230px]">
                        {isWaiting
                          ? 'Solicita atención de asesor humano'
                          : messages
                              .filter((message) => message.conversationId === conv.id)
                              .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0]?.content || 'Sin mensajes'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {conv.unreadCount > 0 ? (
                      <span className="inline-block text-[11px] font-mono font-bold text-[#0071E3] tabular-nums">
                        {conv.unreadCount} nuevo{conv.unreadCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="inline-block text-[11px] font-medium text-amber-600">
                        En espera
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50/70 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setActiveTab('inbox');
              onClose();
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0071E3] hover:underline cursor-pointer"
          >
            <span>Ver bandeja completa</span>
            <ArrowRight className="size-3" />
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="text-[11px] font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Preferencias de alertas
          </button>
        </div>
      </div>
    </DropdownPopover>
  );
};

export default NotificationsPopover;
