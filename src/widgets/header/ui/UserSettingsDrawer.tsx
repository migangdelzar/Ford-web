import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  X,
  User,
  Bell,
  Sliders,
  Server,
  Building2,
  Mail,
  Check,
  BellRing,
  Volume2,
  VolumeX,
  Send,
  RotateCcw,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Activity,
  Sparkles,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { useCrmStore } from '../../../store/useCrmStore';
import { useToast } from '../../../shared/ui/SonnerToast';
import { Avatar, StatusDot } from '../../../shared/ui';
import { PWAInstallButton, useWebNotifications } from '../../../shared/lib/pwa';
import { soundFx } from '../../../shared/lib/sound';
import { Authority } from '../../../shared/lib/authority';
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog';

export type UserSettingsTab = 'profile' | 'notifications' | 'workspace';

interface UserSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: UserSettingsTab;
}

const SOUND_ENABLED_KEY = 'ford_crm_sound_enabled_v1';

export const UserSettingsDrawer: React.FC<UserSettingsDrawerProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile',
}) => {
  const { t } = useTranslation();
  const {
    advisorProfile,
    setAdvisorStatus,
    updateAdvisorProfile,
    userRole,
    resetAllData,
    logout,
    setActiveTab,
    conversations,
  } = useCrmStore();
  const { toast } = useToast();
  const { isSubscribed, permission, togglePushSubscription, sendTestPush } = useWebNotifications();

  const [activeSection, setActiveSection] = useState<UserSettingsTab>(initialTab);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(SOUND_ENABLED_KEY);
    const enabled = saved !== 'false';
    soundFx.enabled = enabled;
    return enabled;
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [draftName, setDraftName] = useState(advisorProfile.name);
  const [draftBranch, setDraftBranch] = useState(advisorProfile.branch);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveSection(initialTab);
      setDraftName(advisorProfile.name);
      setDraftBranch(advisorProfile.branch);
      setIsEditingProfile(false);
    }
  }, [isOpen, initialTab, advisorProfile.name, advisorProfile.branch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isConfirmResetOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConfirmResetOpen, onClose]);

  const waitingHandoffsCount = conversations.filter((c) => c.status === 'waiting').length;
  const unreadCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const canReset = Authority.canResetSimulator(userRole);

  const handleStatusChange = (status: 'available' | 'in_meeting' | 'away') => {
    setAdvisorStatus(status);
    soundFx.playClick();
    const label =
      status === 'available'
        ? t('header.statusAvailable', 'Disponible')
        : status === 'in_meeting'
        ? t('header.statusMeeting', 'En Cita')
        : t('header.statusAway', 'Ausente');

    toast({
      type: 'info',
      title: `Estado actualizado: ${label}`,
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftName.trim()) return;
    updateAdvisorProfile({
      name: draftName.trim(),
      branch: draftBranch.trim() || advisorProfile.branch,
    });
    setIsEditingProfile(false);
    toast({
      type: 'success',
      title: 'Perfil actualizado correctamente',
    });
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.enabled = next;
    localStorage.setItem(SOUND_ENABLED_KEY, String(next));
    if (next) {
      soundFx.playReceive();
    }
    toast({
      type: 'info',
      title: next ? 'Sonidos de alerta activados' : 'Sonidos de alerta silenciados',
    });
  };

  const handleCopyText = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
    toast({
      type: 'info',
      title: 'Copiado al portapapeles',
    });
  };

  const handleConfirmReset = () => {
    resetAllData();
    setIsConfirmResetOpen(false);
    onClose();
    toast({
      type: 'info',
      title: t('nav.resetSimulator', 'Restablecer simulador'),
      description: 'Datos originales del simulador restablecidos correctamente.',
    });
  };

  const handleLogout = async () => {
    onClose();
    try {
      await logout();
      toast({
        type: 'info',
        title: t('login.sessionEnded', 'Sesión finalizada'),
        description: t('header.logoutDescription', { brand: t('brand.name') }),
      });
    } catch {
      toast({ type: 'error', title: 'No se pudo cerrar la sesión en el servidor.' });
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/25 backdrop-blur-[2px]"
            />

            {/* Slide-Over Panel */}
            <motion.aside
              id="user-settings-drawer"
              aria-label="Perfil, Notificaciones y Configuración"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className="relative z-10 w-full max-w-[420px] bg-white h-full shadow-2xl border-l border-slate-200/80 flex flex-col justify-between overflow-hidden select-none"
            >
              {/* Top Header */}
              <div className="px-6 pt-5 pb-4 border-b border-slate-100 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      Preferencias y Cuenta
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Perfil operativo, alertas y conexión del sistema
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Cerrar panel"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Compact User Summary Strip */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      name={advisorProfile.name}
                      size="md"
                      shape="squircle"
                      status={
                        advisorProfile.status === 'available'
                          ? 'online'
                          : advisorProfile.status === 'in_meeting'
                          ? 'busy'
                          : 'away'
                      }
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {advisorProfile.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
                        <span className="font-medium text-slate-700">{advisorProfile.role}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{advisorProfile.branch}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-900 tabular-nums block">
                      {advisorProfile.assignedCount}
                    </span>
                    <span className="text-[11px] text-slate-500 block">leads</span>
                  </div>
                </div>

                {/* Segmented Section Tabs with Fluid Sliding Pill */}
                <div className="mt-4 grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl relative">
                  <button
                    type="button"
                    onClick={() => setActiveSection('profile')}
                    className={`relative flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      activeSection === 'profile'
                        ? 'text-slate-900'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {activeSection === 'profile' && (
                      <motion.div
                        layoutId="drawer-segmented-active-pill"
                        transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.75 }}
                        className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-200/60"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <User className="size-3.5 shrink-0" />
                      <span>Perfil</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection('notifications')}
                    className={`relative flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      activeSection === 'notifications'
                        ? 'text-slate-900'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {activeSection === 'notifications' && (
                      <motion.div
                        layoutId="drawer-segmented-active-pill"
                        transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.75 }}
                        className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-200/60"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Bell className="size-3.5 shrink-0" />
                      <span>Alertas</span>
                      {(unreadCount > 0 || waitingHandoffsCount > 0) && (
                        <span className="text-[10px] font-mono font-bold text-[#0071E3] tabular-nums">
                          ({unreadCount + waitingHandoffsCount})
                        </span>
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection('workspace')}
                    className={`relative flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      activeSection === 'workspace'
                        ? 'text-slate-900'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {activeSection === 'workspace' && (
                      <motion.div
                        layoutId="drawer-segmented-active-pill"
                        transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.75 }}
                        className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-200/60"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Sliders className="size-3.5 shrink-0" />
                      <span>Sistema</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Body Content with Smooth Tab Transition */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  {activeSection === 'profile' && (
                      <>
                        {/* Availability Selector */}
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <h3 className="text-xs font-semibold text-slate-900">
                              Estado de disponibilidad
                            </h3>
                            <span className="text-[11px] text-slate-500">
                              Asignación automática de chats
                            </span>
                      </div>

                      <div className="space-y-1.5">
                        {(
                          [
                            {
                              id: 'available',
                              label: t('header.statusAvailable', 'Disponible'),
                              desc: 'Recibe nuevos prospectos y transferencias IA',
                              dot: 'online' as const,
                            },
                            {
                              id: 'in_meeting',
                              label: t('header.statusMeeting', 'En Cita / Prueba de Manejo'),
                              desc: 'Pausa asignaciones nuevas temporalmente',
                              dot: 'busy' as const,
                            },
                            {
                              id: 'away',
                              label: t('header.statusAway', 'Ausente / Fuera de turno'),
                              desc: 'El Concierge IA retiene la atención',
                              dot: 'away' as const,
                            },
                          ] as const
                        ).map((option) => {
                          const selected = advisorProfile.status === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => handleStatusChange(option.id)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                selected
                                  ? 'bg-blue-50/50 border-[#0071E3]/30 text-slate-900'
                                  : 'bg-white hover:bg-slate-50 border-slate-200/70 text-slate-700'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="mt-1">
                                  <StatusDot status={option.dot} size="sm" withRing={false} />
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-slate-900">
                                    {option.label}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {option.desc}
                                  </div>
                                </div>
                              </div>
                              {selected && (
                                <Check className="size-4 text-[#0071E3] stroke-[2.25] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Profile Details & Quick Edit */}
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2.5">
                        <h3 className="text-xs font-semibold text-slate-900">
                          Datos de la cuenta
                        </h3>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(!isEditingProfile)}
                          className="text-xs font-semibold text-[#0071E3] hover:underline cursor-pointer"
                        >
                          {isEditingProfile ? 'Cancelar' : 'Editar'}
                        </button>
                      </div>

                      {isEditingProfile ? (
                        <form onSubmit={handleSaveProfile} className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">
                              Nombre completo
                            </label>
                            <input
                              type="text"
                              value={draftName}
                              onChange={(e) => setDraftName(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0071E3]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">
                              Sucursal asignada
                            </label>
                            <input
                              type="text"
                              value={draftBranch}
                              onChange={(e) => setDraftBranch(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0071E3]"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-2 px-4 rounded-xl bg-[#0071E3] hover:bg-[#0062C4] text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Guardar cambios
                          </button>
                        </form>
                      ) : (
                        <div className="space-y-2.5 text-xs">
                          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <Mail className="size-3.5 text-slate-400" />
                              Correo electrónico
                            </span>
                            <span className="font-medium text-slate-900 truncate max-w-[200px]">
                              {advisorProfile.email}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <Building2 className="size-3.5 text-slate-400" />
                              Sucursal
                            </span>
                            <span className="font-medium text-slate-900 truncate max-w-[200px]">
                              {advisorProfile.branch}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1.5">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <ShieldCheck className="size-3.5 text-slate-400" />
                              ID Operador
                            </span>
                            <span className="font-mono text-slate-700 tabular-nums">
                              {advisorProfile.id}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {activeSection === 'notifications' && (
                  <>
                    {/* Active Attention Summary */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900">
                          Resumen de actividad pendiente
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('inbox');
                            onClose();
                          }}
                          className="text-xs font-semibold text-[#0071E3] hover:underline cursor-pointer"
                        >
                          Ir a Bandeja
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/60">
                        <div>
                          <span className="text-lg font-mono font-bold text-slate-900 tabular-nums block">
                            {unreadCount}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Mensajes sin leer
                          </span>
                        </div>
                        <div>
                          <span className="text-lg font-mono font-bold text-amber-600 tabular-nums block">
                            {waitingHandoffsCount}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Solicitudes de asesor
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Web Push Notifications */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-semibold text-slate-900">
                            Notificaciones Push (Web & PWA)
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Alertas nativas cuando entra un lead o handoff urgente
                          </p>
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                          {isSubscribed ? 'Activas' : permission === 'denied' ? 'Bloqueadas' : 'Inactivas'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
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
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSubscribed
                              ? 'bg-emerald-50/70 text-emerald-700 border-emerald-600/20'
                              : 'bg-slate-900 hover:bg-slate-800 text-white border-transparent'
                          }`}
                        >
                          {isSubscribed ? (
                            <BellRing className="size-3.5 shrink-0" />
                          ) : (
                            <Bell className="size-3.5 shrink-0" />
                          )}
                          <span>
                            {isSubscribed ? 'Notificaciones Push Activas' : 'Activar Notificaciones Push'}
                          </span>
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
                          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                          title="Enviar notificación Push de prueba"
                        >
                          <Send className="size-3.5 shrink-0" />
                          <span>Probar</span>
                        </button>
                      </div>
                    </div>

                    {/* Sound Alerts */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-start gap-2.5">
                        {soundEnabled ? (
                          <Volume2 className="size-4 text-[#0071E3] mt-0.5 shrink-0" />
                        ) : (
                          <VolumeX className="size-4 text-slate-400 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <div className="text-xs font-semibold text-slate-900">
                            Efectos de sonido en bandeja
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Tono suave al recibir mensajes o transferencias de clientes
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={soundEnabled}
                        onClick={handleToggleSound}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          soundEnabled ? 'bg-[#0071E3]' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                            soundEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* PWA Install Section */}
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <h3 className="text-xs font-semibold text-slate-900">
                        Aplicación instalable (PWA)
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Instala Ford Concierge CRM en tu escritorio o teléfono para acceso directo a pantalla completa y soporte resiliente.
                      </p>
                      <div className="pt-1">
                        <PWAInstallButton />
                      </div>
                    </div>
                  </>
                )}

                {activeSection === 'workspace' && (
                  <>
                    {/* Backend & Tenant Connection Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-slate-900">
                          Conexión Backend & Tenant
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('service-status');
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0071E3] hover:underline cursor-pointer"
                        >
                          <Activity className="size-3.5" />
                          <span>Ver Spring Actuator</span>
                        </button>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3 text-xs">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                            <span>API Base URL (Producción)</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyText('api', 'https://ford.emme.business/api/v1')
                              }
                              className="inline-flex items-center gap-1 text-[#0071E3] hover:underline cursor-pointer"
                            >
                              {copiedKey === 'api' ? (
                                <CheckCircle2 className="size-3" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                              <span>{copiedKey === 'api' ? 'Copiado' : 'Copiar'}</span>
                            </button>
                          </div>
                          <code className="block px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80 font-mono text-[11px] text-slate-800 truncate">
                            https://ford.emme.business/api/v1
                          </code>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                            <span>Tenant ID (X-Tenant-Id)</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyText(
                                  'tenant',
                                  '00000000-0000-0000-0000-000000000001'
                                )
                              }
                              className="inline-flex items-center gap-1 text-[#0071E3] hover:underline cursor-pointer"
                            >
                              {copiedKey === 'tenant' ? (
                                <CheckCircle2 className="size-3" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                              <span>{copiedKey === 'tenant' ? 'Copiado' : 'Copiar'}</span>
                            </button>
                          </div>
                          <code className="block px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80 font-mono text-[11px] text-slate-800 truncate tabular-nums">
                            00000000-0000-0000-0000-000000000001
                          </code>
                        </div>

                        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Contrato OpenAPI 3.1</span>
                          <a
                            href="/api/docs"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-[#0071E3]"
                          >
                            <span>Abrir /api/docs</span>
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Quick Administration Links */}
                    {userRole === 'propietario' && (
                      <div className="pt-4 border-t border-slate-100 space-y-2">
                        <h3 className="text-xs font-semibold text-slate-900">
                          Accesos rápidos de administración
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('config');
                              onClose();
                            }}
                            className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-xs font-medium text-slate-800 transition-colors cursor-pointer text-left"
                          >
                            <Sparkles className="size-3.5 text-[#0071E3] shrink-0" />
                            <span className="truncate">Reglas y Tono IA</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('test-lab');
                              onClose();
                            }}
                            className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-xs font-medium text-slate-800 transition-colors cursor-pointer text-left"
                          >
                            <Server className="size-3.5 text-[#0071E3] shrink-0" />
                            <span className="truncate">Diagnóstico & Lab</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Keyboard Shortcuts Reference */}
                    <div className="pt-4 border-t border-slate-100 space-y-2.5">
                      <h3 className="text-xs font-semibold text-slate-900">
                        Atajos de teclado
                      </h3>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between py-1 text-slate-600">
                          <span>Buscar conversación o cliente</span>
                          <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md font-mono text-[11px] text-slate-800">
                            ⌘K
                          </kbd>
                        </div>
                        <div className="flex items-center justify-between py-1 text-slate-600">
                          <span>Navegar conversaciones (Siguiente / Anterior)</span>
                          <div className="flex gap-1">
                            <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md font-mono text-[11px] text-slate-800">
                              J
                            </kbd>
                            <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md font-mono text-[11px] text-slate-800">
                              K
                            </kbd>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Simulator Reset */}
                    {canReset && (
                      <div className="pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsConfirmResetOpen(true)}
                          className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-900 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <RotateCcw className="size-3.5 text-amber-700" />
                            <span>Restablecer datos del simulador</span>
                          </span>
                          <span className="text-[11px] font-normal text-amber-700">
                            Reiniciar semillas
                          </span>
                        </button>
                      </div>
                    )}
                  </>
                )}
                </motion.div>
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 truncate">
                  {advisorProfile.email}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                  <span>{t('header.logout', 'Cerrar Sesión')}</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isConfirmResetOpen}
        title="¿Restablecer simulador?"
        description="Esta acción recargará las conversaciones originales, restablecerá la configuración del bot y vaciará los eventos locales de auditoría."
        confirmLabel="Sí, restablecer todo"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={handleConfirmReset}
        onClose={() => setIsConfirmResetOpen(false)}
      />
    </>
  );
};

export default UserSettingsDrawer;
