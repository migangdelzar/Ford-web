import React, { useCallback, useEffect, useState } from 'react';
import { getAfterHoursDigest, type AfterHoursDigestRecord } from '../../../shared/api/afterHoursDigestApi';

interface Props {
  tenantId: string | null;
  onOpenConversation: (conversationId: string) => void;
}

export const AfterHoursDigestCard: React.FC<Props> = ({ tenantId, onOpenConversation }) => {
  const [digest, setDigest] = useState<AfterHoursDigestRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [digestTenantId, setDigestTenantId] = useState<string | null>(null);

  const load = useCallback(async (signal: { cancelled: boolean }) => {
    if (!tenantId) {
      setDigest(null);
      setDigestTenantId(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getAfterHoursDigest(tenantId);
      if (!signal.cancelled) {
        setDigest(result);
        setDigestTenantId(tenantId);
      }
    } catch (cause) {
      if (!signal.cancelled) setError(cause instanceof Error ? cause.message : 'No se pudo cargar el resumen BDC');
    } finally {
      if (!signal.cancelled) setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    const signal = { cancelled: false };
    void load(signal);
    return () => { signal.cancelled = true; };
  }, [load, attempt]);

  useEffect(() => {
    if (!tenantId || !digest || digestTenantId !== tenantId || digest.available) return;
    const delay = Date.parse(digest.availableAt) - Date.now();
    const timeout = window.setTimeout(() => setAttempt((value) => value + 1), Math.max(0, delay));
    return () => window.clearTimeout(timeout);
  }, [tenantId, digestTenantId, digest?.available, digest?.availableAt]);

  const retry = () => setAttempt((value) => value + 1);
  const visibleDigest = digestTenantId === tenantId ? digest : null;
  const businessDate = visibleDigest?.businessDate
    ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeZone: visibleDigest.timeZone }).format(new Date(`${visibleDigest.businessDate}T12:00:00`))
    : null;

  return (
    <section aria-label="Resumen BDC de fuera de horario" className="mx-3 my-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-slate-800">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-blue-900">BDC · {businessDate ?? 'Siguiente día hábil'}</h2>
          <p className="mt-1 text-xs text-slate-600">Resumen de conversaciones recibidas fuera del horario de atención</p>
        </div>
        {visibleDigest?.available && <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-medium">08:45 · CDMX</span>}
      </div>
      {!tenantId ? (
        <p className="mt-3 text-xs text-slate-600">Selecciona una sucursal para consultar el resumen.</p>
      ) : loading && !visibleDigest ? (
        <p className="mt-3 text-xs text-slate-600" role="status">Cargando resumen…</p>
      ) : error ? (
        <div className="mt-3 flex items-center justify-between gap-2 text-xs" role="alert">
          <span>No se pudo cargar el resumen: {error}</span>
          <button type="button" className="shrink-0 font-semibold underline" onClick={retry}>Reintentar</button>
        </div>
      ) : visibleDigest && !visibleDigest.available ? (
        <p className="mt-3 text-xs text-slate-600">Disponible a las 08:45, hora de Ciudad de México.</p>
      ) : visibleDigest && visibleDigest.items.length === 0 ? (
        <p className="mt-3 text-xs text-slate-600">Sin transferencias recibidas fuera del horario.</p>
      ) : visibleDigest ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium">{visibleDigest.totalCount} {visibleDigest.totalCount === 1 ? 'transferencia' : 'transferencias'} · {visibleDigest.completePacketCount} paquetes completos · {visibleDigest.partialPacketCount} parciales</p>
          <ul className="space-y-1.5">
            {visibleDigest.items.map((item) => (
              <li key={item.handoffId} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-2 text-xs">
                <span>{item.packetPartial ? 'Paquete parcial' : 'Paquete completo'} · {item.reason.replaceAll('_', ' ').toLowerCase()}</span>
                <button type="button" className="shrink-0 font-semibold text-blue-700 underline" onClick={() => onOpenConversation(item.conversationId)}>Abrir conversación</button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
};
