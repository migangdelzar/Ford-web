import { afterEach, describe, expect, it, vi } from 'vitest';
import { listShadowDrafts, reviewShadowDraft } from '../../src/shared/api/shadowDraftApi';

describe('shadow draft API', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('lists drafts for the selected tenant and conversation', async () => {
    const draft = { id: 'draft-1', conversationId: 'conversation-1', createdAt: '2026-10-18T10:00:00Z', expiresAt: '2026-10-25T10:00:00Z', reviewStatus: 'PENDING', text: 'Hola, ¿qué modelo te interesa?' };
    const fetchMock = vi.fn(async () => Response.json([draft]));
    vi.stubGlobal('fetch', fetchMock);
    await expect(listShadowDrafts('tenant-1', 'conversation-1')).resolves.toEqual([draft]);
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/conversations/conversation-1/shadow-drafts?tenantId=tenant-1', {
      credentials: 'same-origin', headers: { accept: 'application/json' },
    });
  });

  it('records a review annotation through the authenticated endpoint', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ token: 'csrf', headerName: 'X-XSRF-TOKEN' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(reviewShadowDraft('tenant-1', 'conversation-1', 'draft-1', 'REJECTED', 'Confirma horario primero'))
      .resolves.toBeUndefined();
    expect(fetchMock.mock.calls[1][0]).toBe('/api/v1/conversations/conversation-1/shadow-drafts/draft-1/review?tenantId=tenant-1');
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: 'POST',
      headers: { 'X-XSRF-TOKEN': 'csrf', 'content-type': 'application/json' },
      body: JSON.stringify({ decision: 'REJECTED', note: 'Confirma horario primero' }),
    });
  });
});
