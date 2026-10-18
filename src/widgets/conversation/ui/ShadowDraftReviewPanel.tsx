import React, { useCallback, useEffect, useRef, useState } from 'react';
import { listShadowDrafts, reviewShadowDraft, type ShadowDraftRecord } from '../../../shared/api/shadowDraftApi';

interface ShadowDraftReviewPanelProps {
  tenantId: string | null;
  conversationId: string | null;
  isAuthenticated: boolean;
}

export const ShadowDraftReviewPanel: React.FC<ShadowDraftReviewPanelProps> = ({
  tenantId,
  conversationId,
  isAuthenticated,
}) => {
  const [drafts, setDrafts] = useState<ShadowDraftRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const requestGeneration = useRef(0);

  const refresh = useCallback(async () => {
    const generation = ++requestGeneration.current;
    if (!tenantId || !conversationId || !isAuthenticated) {
      setDrafts([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const nextDrafts = await listShadowDrafts(tenantId, conversationId);
      if (generation === requestGeneration.current) setDrafts(nextDrafts);
    } catch (cause) {
      if (generation === requestGeneration.current) {
        setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los borradores.');
      }
    } finally {
      if (generation === requestGeneration.current) setLoading(false);
    }
  }, [tenantId, conversationId, isAuthenticated]);

  useEffect(() => {
    setDrafts([]);
    setNotes({});
    void refresh();
    return () => { requestGeneration.current += 1; };
  }, [refresh]);

  const submitReview = async (draftId: string, decision: 'ACCEPTED' | 'REJECTED') => {
    if (!tenantId || !conversationId || reviewingId) return;
    setReviewingId(draftId);
    setError(null);
    try {
      await reviewShadowDraft(tenantId, conversationId, draftId, decision, (notes[draftId] ?? '').trim());
      setNotes((previous) => ({ ...previous, [draftId]: '' }));
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la revisión.');
    } finally {
      setReviewingId(null);
    }
  };

  if (!isAuthenticated || !tenantId || !conversationId) return null;

  return (
    <section aria-labelledby="shadow-drafts-heading" className="border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="shadow-drafts-heading" className="text-sm font-semibold text-slate-800">Revisión de borradores</h2>
          <p className="text-xs text-slate-500">Modo sombra: estos borradores son internos y no se envían al cliente.</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading || reviewingId !== null}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          {loading ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
      {loading && drafts.length === 0 && <p role="status" className="mt-3 text-xs text-slate-500">Cargando borradores…</p>}
      {!loading && !error && drafts.length === 0 && (
        <p className="mt-3 text-xs text-slate-500">No hay borradores disponibles para esta conversación.</p>
      )}

      {drafts.length > 0 && (
        <ul className="mt-3 max-h-56 space-y-3 overflow-y-auto">
          {drafts.map((draft) => (
            <li key={draft.id} className="rounded-lg border border-amber-200 bg-amber-50/70 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                <time dateTime={draft.createdAt}>{new Date(draft.createdAt).toLocaleString('es-MX')}</time>
                <span className="rounded-full bg-white px-2 py-0.5 font-semibold">{draft.reviewStatus}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{draft.text}</p>
              {draft.reviewStatus === 'PENDING' && (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                  <label htmlFor={`shadow-draft-note-${draft.id}`} className="flex-1 text-xs font-medium text-slate-600">
                    Nota de revisión
                    <textarea id={`shadow-draft-note-${draft.id}`} value={notes[draft.id] ?? ''}
                      onChange={(event) => setNotes((previous) => ({ ...previous, [draft.id]: event.target.value }))}
                      maxLength={500} rows={2}
                      className="mt-1 block w-full resize-y rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-normal text-slate-800"
                      placeholder="Opcional; no se muestra al cliente" />
                  </label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => void submitReview(draft.id, 'ACCEPTED')} disabled={reviewingId !== null}
                      className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
                      {reviewingId === draft.id ? 'Guardando…' : 'Marcar útil'}
                    </button>
                    <button type="button" onClick={() => void submitReview(draft.id, 'REJECTED')} disabled={reviewingId !== null}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                      Marcar necesita ajuste
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
