import React, { FormEvent, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FordBrandLogo } from '../../../shared/ui';
import { readCsrfToken } from '../../../shared/api/operatorAuth';
import { authenticateWithPasskey } from '../passkeyLogin';

interface LoginPageProps {
  onOpenLegalModal?: (tab: 'privacy' | 'terms') => void;
  authUnavailable?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenLegalModal, authUnavailable = false }) => {
  const { t } = useTranslation();
  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('miky.delzar@gmail.com');
  const [csrfToken, setCsrfToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('error')) {
      setError('El correo o la contraseña no son válidos.');
    }
    void readCsrfToken()
      .then((csrf) => setCsrfToken(csrf.token))
      .catch(() => setError('No se pudo preparar el acceso seguro. Inténtelo de nuevo.'));
  }, []);

  const handlePasskey = async () => {
    setBusy(true);
    setError('');
    try {
      window.location.assign(await authenticateWithPasskey());
    } catch {
      setError('No se pudo iniciar sesión con passkey. Puede solicitar un enlace por correo.');
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (!csrfToken) throw new Error('CSRF token is unavailable');
      const body = new URLSearchParams({ email });
      const response = await fetch('/api/auth/one-time-token', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded', 'X-XSRF-TOKEN': csrfToken },
        body,
      });
      if (!response.ok && response.status !== 202) throw new Error('Email sign-in request failed');
      setMessage('Si la cuenta está activa, enviaremos un enlace de acceso.');
    } catch {
      setError('No se pudo solicitar el enlace. Inténtelo de nuevo en unos minutos.');
    } finally {
      setBusy(false);
    }
  };
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
          href="#passkey"
          onClick={(event) => { event.preventDefault(); void handlePasskey(); }}
          aria-disabled={busy}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] px-4 py-3 text-sm font-semibold text-white transition-colors"
        >
          <KeyRound className="size-4" />
          {busy ? 'Procesando…' : 'Iniciar sesión con passkey'}
        </a>

        <div className="my-5 flex items-center gap-3 text-[10px] text-[#9CA3AF]">
          <span className="h-px flex-1 bg-[#EEF0F3]" />
          ACCESO DE RECUPERACIÓN
          <span className="h-px flex-1 bg-[#EEF0F3]" />
        </div>

        <a
          href="#email-recovery"
          onClick={(event) => { event.preventDefault(); setShowEmail(true); }}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#EEF0F3] bg-white px-4 py-2.5 text-xs font-semibold text-[#1C1E26] hover:bg-slate-50"
        >
          <Mail className="size-3.5" />
          Solicitar enlace por correo
        </a>
        <p className="mt-2 text-center text-[10px] leading-relaxed text-[#6B7280]">
          Acceda con su passkey o solicite un enlace de un solo uso.
        </p>
        {showEmail && (
          <form className="mt-4 space-y-3" onSubmit={handleEmailSubmit}>
            <label className="block text-xs font-medium" htmlFor="login-email">Correo electrónico</label>
            <input id="login-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-[#D9DDE5] px-3 py-2.5 text-sm" />
            <button type="submit" disabled={!csrfToken || busy} className="w-full rounded-xl bg-[#1C1E26] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? 'Enviando…' : 'Enviar enlace'}</button>
          </form>
        )}
        <div className="mt-4">
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="w-full text-center text-xs font-semibold text-[#0071E3] hover:underline">
              {showPassword ? 'Ocultar acceso con contraseña' : 'Usar usuario y contraseña'}
            </button>
            {showPassword && (
              <form action="/login" method="post" className="mt-3 space-y-3">
                <input type="hidden" name="_csrf" value={csrfToken} />
                <label className="block text-xs font-medium" htmlFor="password-login-email">Correo electrónico</label>
                <input id="password-login-email" name="username" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-[#D9DDE5] px-3 py-2.5 text-sm" />
                <label className="block text-xs font-medium" htmlFor="password-login-password">Contraseña</label>
                <input id="password-login-password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-xl border border-[#D9DDE5] px-3 py-2.5 text-sm" />
                <button type="submit" disabled={!csrfToken || busy} className="w-full rounded-xl bg-[#1C1E26] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">Iniciar con contraseña</button>
              </form>
            )}
        </div>
        {message && <p role="status" className="mt-3 text-xs text-green-800">{message}</p>}
        {error && <p role="alert" className="mt-3 text-xs text-red-700">{error}</p>}
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
