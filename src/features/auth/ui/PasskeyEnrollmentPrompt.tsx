import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { registerPasskey } from '../../../pages/login/passkeyRegistration';

interface PasskeyEnrollmentPromptProps {
  hasPasskey: boolean | null;
  onEnrolled: () => void;
  register?: () => Promise<void>;
}

export function PasskeyEnrollmentPrompt({ hasPasskey, onEnrolled, register = registerPasskey }: PasskeyEnrollmentPromptProps) {
  const [dismissed, setDismissed] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (hasPasskey !== false || dismissed) return null;

  const handleRegister = async () => {
    setRegistering(true);
    setError(null);
    try {
      await register();
      onEnrolled();
    } catch (registrationError) {
      setError(registrationError instanceof Error
        ? registrationError.message
        : 'No se pudo completar el registro de la passkey.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/45 p-4">
      <section
        aria-labelledby="passkey-enrollment-title"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <div className="mb-4 grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
          <KeyRound aria-hidden="true" className="size-5" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900" id="passkey-enrollment-title">
          Configure una passkey
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Inicie sesión de forma más rápida y segura con la huella, rostro o bloqueo de pantalla de su dispositivo.
        </p>
        {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => setDismissed(true)}
            type="button"
          >
            Más tarde
          </button>
          <button
            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
            disabled={registering}
            onClick={() => void handleRegister()}
            type="button"
          >
            {registering ? 'Configurando…' : 'Configurar passkey'}
          </button>
        </div>
      </section>
    </div>
  );
}
