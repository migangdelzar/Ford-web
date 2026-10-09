import React, { useEffect, useState, useCallback } from 'react';
import { Bell, BellRing, Download, Smartphone, Share, PlusSquare, CheckCircle2, WifiOff, X } from 'lucide-react';
import { soundFx } from './sound';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PUSH_ENABLED_STORAGE_KEY = 'ford_crm_web_push_enabled_v1';

/**
 * Dispatches a native Web / Service Worker Push Notification
 */
export async function sendWebPushNotification(
  title: string,
  body: string,
  options?: { tag?: string; urgent?: boolean }
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  const userEnabled = localStorage.getItem(PUSH_ENABLED_STORAGE_KEY) !== 'false';
  if (!userEnabled) return false;

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: options?.tag || `ford-crm-${Date.now()}`,
          renotify: true,
          silent: false,
        } as NotificationOptions);
        return true;
      }
    }

    new Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      tag: options?.tag || `ford-crm-${Date.now()}`,
    });
    return true;
  } catch (err) {
    console.warn('[PWA Push] Fallback notification failed:', err);
    return false;
  }
}

export function useWebNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      'Notification' in window &&
      Notification.permission === 'granted' &&
      localStorage.getItem(PUSH_ENABLED_STORAGE_KEY) !== 'false'
    );
  });

  const requestPushPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied' as NotificationPermission;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        localStorage.setItem(PUSH_ENABLED_STORAGE_KEY, 'true');
        setIsSubscribed(true);
        soundFx.playReceive();
        await sendWebPushNotification(
          'Ford CRM Concierge • Push Activo',
          'Recibirás alertas en tiempo real cuando entren mensajes de WhatsApp o solicitudes de asesor.',
          { tag: 'ford-push-welcome' }
        );
      }
      return result;
    } catch (e) {
      console.warn('[PWA Push] Permission request error:', e);
      return 'denied' as NotificationPermission;
    }
  }, []);

  const togglePushSubscription = useCallback(async () => {
    if (permission !== 'granted') {
      return await requestPushPermission();
    }
    const nextState = !isSubscribed;
    localStorage.setItem(PUSH_ENABLED_STORAGE_KEY, String(nextState));
    setIsSubscribed(nextState);
    if (nextState) {
      soundFx.playReceive();
      await sendWebPushNotification(
        'Notificaciones Push Reactivadas',
        'Alertas de escritorio y móvil habilitadas para Miky Delzar.',
        { tag: 'ford-push-toggle' }
      );
    }
    return permission;
  }, [permission, isSubscribed, requestPushPermission]);

  const sendTestPush = useCallback(async () => {
    if (permission !== 'granted') {
      const res = await requestPushPermission();
      if (res !== 'granted') return false;
    }
    localStorage.setItem(PUSH_ENABLED_STORAGE_KEY, 'true');
    setIsSubscribed(true);
    soundFx.playHandoff();
    return await sendWebPushNotification(
      '🔴 Lead Caliente • Ford Bronco Sport',
      'Carlos Mendoza solicita cotización y financiamiento inmediato en WhatsApp.',
      { tag: 'ford-push-test', urgent: true }
    );
  }, [permission, requestPushPermission]);

  return {
    supported: typeof window !== 'undefined' && 'Notification' in window,
    permission,
    isSubscribed,
    requestPushPermission,
    togglePushSubscription,
    sendTestPush,
  };
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title="Instalar Web App (PWA)"
        className={
          compact
            ? 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#E8F1FF] hover:bg-[#0071E3] text-[#0071E3] hover:text-white border border-[#0071E3]/20 text-[11px] font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap shadow-2xs'
            : 'w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#E8F1FF]/80 hover:bg-[#E8F1FF] text-[#0071E3] border border-[#0071E3]/20 text-xs font-semibold transition-all cursor-pointer'
        }
      >
        <span className="inline-flex items-center gap-1.5">
          <Download className="size-3.5 shrink-0" />
          <span>{compact ? 'Instalar App' : 'Instalar App en Dispositivo (PWA)'}</span>
        </span>
        {!compact && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#0071E3] text-white">
            Web App
          </span>
        )}
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-black/[0.08] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-[#0071E3] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                  FORD
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1D1D1F]">
                    Instalar Ford CRM (PWA)
                  </h3>
                  <p className="text-[11px] text-[#86868B]">
                    Acceso directo y notificaciones nativas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-[#1D1D1F]">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F5F5F7]">
                    <Share className="size-4 text-[#0071E3] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">1. Toca Compartir</span> en la barra inferior de Safari.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F5F5F7]">
                    <PlusSquare className="size-4 text-[#0071E3] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">2. Selecciona "Agregar a Inicio"</span> para instalar la aplicación con soporte de notificaciones Push.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F5F5F7]">
                    <Smartphone className="size-4 text-[#0071E3] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">En Chrome / Edge / Desktop:</span> Haz clic en el icono de instalación en la barra de direcciones del navegador (o abre la app en una pestaña dedicada fuera de la vista previa).
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#EDF6F0] text-[#16A34A]">
                    <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Service Worker Activo:</span> Manifiesto PWA y caché offline listos.
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-4 w-full py-2 rounded-xl bg-[#0071E3] hover:bg-[#005BB5] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-full bg-[#D97706] px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg">
      <WifiOff className="size-3.5 shrink-0" />
      <span>Modo Offline — Usando caché local PWA</span>
    </div>
  );
};
