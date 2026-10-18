import { readCsrfToken } from './operatorAuth';

export interface ShadowDraftRecord {
  id: string;
  conversationId: string;
  createdAt: string;
  expiresAt: string;
  reviewStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  text: string;
}

export async function listShadowDrafts(tenantId: string, conversationId: string): Promise<ShadowDraftRecord[]> {
  const query = new URLSearchParams({ tenantId });
  const response = await fetch(`/api/v1/conversations/${encodeURIComponent(conversationId)}/shadow-drafts?${query}`, {
    credentials: 'same-origin', headers: { accept: 'application/json' },
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorMessage(body, response.status));
  if (!Array.isArray(body) || !body.every(isShadowDraftRecord)) {
    throw new Error('Ford-service returned invalid shadow drafts');
  }
  return body;
}

export async function reviewShadowDraft(
  tenantId: string,
  conversationId: string,
  draftId: string,
  decision: 'ACCEPTED' | 'REJECTED',
  note: string,
): Promise<void> {
  const csrf = await readCsrfToken();
  const query = new URLSearchParams({ tenantId });
  const response = await fetch(`/api/v1/conversations/${encodeURIComponent(conversationId)}/shadow-drafts/${encodeURIComponent(draftId)}/review?${query}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { accept: 'application/json', 'content-type': 'application/json', [csrf.headerName]: csrf.token },
    body: JSON.stringify({ decision, note }),
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new Error(errorMessage(body, response.status));
  }
}

function isShadowDraftRecord(value: unknown): value is ShadowDraftRecord {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<ShadowDraftRecord>;
  return typeof draft.id === 'string'
    && typeof draft.conversationId === 'string'
    && typeof draft.createdAt === 'string'
    && typeof draft.expiresAt === 'string'
    && (draft.reviewStatus === 'PENDING' || draft.reviewStatus === 'ACCEPTED' || draft.reviewStatus === 'REJECTED')
    && typeof draft.text === 'string';
}

function errorMessage(value: unknown, status: number): string {
  if (value && typeof value === 'object') {
    const detail = (value as { detail?: unknown }).detail;
    const error = (value as { error?: unknown }).error;
    if (typeof detail === 'string' && detail) return detail;
    if (typeof error === 'string' && error) return error;
  }
  return `Ford-service request failed (${status})`;
}
