import React from 'react';
import { motion } from 'motion/react';
import { KeyRound, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FordBrandLogo } from '../../../shared/ui';

interface LoginPageProps {
  onOpenLegalModal?: (tab: 'privacy' | 'terms') => void;
  authUnavailable?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenLegalModal, authUnavailable = false }) => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen w-full bg-[#F8F9FB] flex flex-col justify-between items-center px-4 py-8 select-none text-[#1C1E26] font-sans antialiased">
      <div className="w-full" />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm bg-white border border-[#EEF0F3] rounded-2xl p-6 sm:p-7 shadow-xs"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-2.5"><FordBrandLogo size="lg" variant="squircle" /></div>
          <h1 className="text-sm font-semibold tracking-tight text-[#1C1E26]">{t('brand.name')}</h1>
          <p className="text-[11px] text-[#6B7280] mt-0.5">{t('brand.tagline')}</p>
        </div>

        {authUnavailable && (
          <p role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            El servicio de acceso no responde. Inténtalo de nuevo en unos minutos.
          </p>
        )}

        <a
          href="/api/auth/login"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] px-4 py-3 text-sm font-semibold text-white transition-colors"
        >
          <KeyRound className="size-4" />
          Iniciar sesión con passkey
        </a>

        <div className="my-5 flex items-center gap-3 text-[10px] text-[#9CA3AF]">
          <span className="h-px flex-1 bg-[#EEF0F3]" />
          ACCESO DE RECUPERACIÓN
          <span className="h-px flex-1 bg-[#EEF0F3]" />
        </div>

        <a
          href="/api/auth/login"
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#EEF0F3] bg-white px-4 py-2.5 text-xs font-semibold text-[#1C1E26] hover:bg-slate-50"
        >
          <Mail className="size-3.5" />
          Continuar con correo
        </a>
        <p className="mt-2 text-center text-[10px] leading-relaxed text-[#6B7280]">
          En la pantalla segura de Ford puedes solicitar un enlace de un solo uso. La autenticación termina en esta sesión.
        </p>
      </motion.div>

      <footer className="w-full max-w-sm flex items-center justify-between text-[11px] text-[#9CA3AF] px-1">
        <span>{t('brand.copyright')}</span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => onOpenLegalModal?.('privacy')} className="hover:text-[#6B7280]">{t('login.privacy')}</button>
          <span>·</span>
          <button type="button" onClick={() => onOpenLegalModal?.('terms')} className="hover:text-[#6B7280]">{t('login.terms')}</button>
        </div>
      </footer>
    </div>
  );
};
