import { afterEach, describe, expect, it, vi } from 'vitest';
import { listConversations, listConversationMessages, listOpenHandoffs, setConversationTakeover, setConversationHandback, sendConversationMessage, restartConversationContext, getConversationRuntimeSettings, updateConversationRuntimeSettings } from '../../src/shared/api/operatorCrmApi';

describe('operator CRM API', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('requests a tenant-scoped conversation page and validates its shape', async () => {
    const fetchMock = vi.fn(async () => Response.json({ items: [], page: { pageSize: 20, hasNext: false } }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(listConversations('tenant-1')).resolves.toMatchObject({ items: [], page: { hasNext: false } });
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/conversations?tenantId=tenant-1&pageSize=50', {
      credentials: 'same-origin', headers: { accept: 'application/json' },
    });
  });

  it('loads a conversation message page under the selected tenant', async () => {
    const fetchMock = vi.fn(async () => Response.json({ items: [], page: { pageSize: 50, hasNext: false } }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(listConversationMessages('tenant-1', 'conversation-1')).resolves.toMatchObject({ items: [] });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/conversations/conversation-1/messages?tenantId=tenant-1&pageSize=100',
      { credentials: 'same-origin', headers: { accept: 'application/json' } },
    );
  });

  it('surfaces authorization failures without mock data fallback', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'session_unauthorized' }, { status: 401 })));
    await expect(listConversations('tenant-1')).rejects.toThrow('session_unauthorized');
  });

  it('sends operator messages with CSRF, idempotency, and optimistic concurrency headers', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(Response.json({ token: 'csrf', headerName: 'X-XSRF-TOKEN' }))
      .mockResolvedValueOnce(Response.json({ messageId: 'message-1', conversationVersion: 8, acceptedAt: '2026-10-09T00:00:00Z' }, { status: 202 })));
    await expect(sendConversationMessage('tenant-1', 'conversation-1', 7, 'Hola')).resolves.toMatchObject({ conversationVersion: 8 });
    const request = vi.mocked(fetch).mock.calls[1];
    expect(request[0]).toBe('/api/v1/conversations/conversation-1/messages?tenantId=tenant-1');
    expect(request[1]?.headers).toMatchObject({ 'X-XSRF-TOKEN': 'csrf', 'if-match': '"v7"' });
    expect(request[1]?.headers).toHaveProperty('idempotency-key');
  });

  it('restarts bot context with CSRF, idempotency, and the current conversation version', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ token: 'csrf', headerName: 'X-XSRF-TOKEN' }))
      .mockResolvedValueOnce(Response.json({ conversationId: 'conversation-1', conversationVersion: 8, contextStartedAt: '2026-10-12T10:00:00Z' }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(restartConversationContext('tenant-1', 'conversation-1', 7))
      .resolves.toMatchObject({ conversationVersion: 8 });
    const [url, request] = fetchMock.mock.calls[1];
    expect(url).toBe('/api/v1/conversations/conversation-1/restart?tenantId=tenant-1');
    expect(request?.method).toBe('POST');
    expect(request?.headers).toMatchObject({ 'X-XSRF-TOKEN': 'csrf', 'if-match': '"v7"' });
    expect(request?.headers).toHaveProperty('idempotency-key');
  });

  it('reads tenant runtime settings from the backend', async () => {
    const settings = { tenantId: 'tenant-1', revision: 2, settings: { humanHandoffEnabled: true, memoryEnabled: true, promptRecentMessageLimit: 12 }, updatedAt: null, updatedBy: null };
    const fetchMock = vi.fn(async () => Response.json(settings));
    vi.stubGlobal('fetch', fetchMock);
    await expect(getConversationRuntimeSettings('tenant-1')).resolves.toMatchObject({ revision: 2 });
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/conversations/runtime-settings?tenantId=tenant-1', {
      credentials: 'same-origin', headers: { accept: 'application/json' },
    });
  });

  it('updates tenant runtime settings with CSRF and optimistic revision', async () => {
    const settings = { tenantId: 'tenant-1', revision: 3, settings: { humanHandoffEnabled: true, memoryEnabled: false, promptRecentMessageLimit: 10 }, updatedAt: '2026-10-12T10:00:00Z', updatedBy: 'operator' };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ token: 'csrf', headerName: 'X-XSRF-TOKEN' }))
      .mockResolvedValueOnce(Response.json(settings));
    vi.stubGlobal('fetch', fetchMock);
    await expect(updateConversationRuntimeSettings('tenant-1', 2, settings.settings)).resolves.toMatchObject({ revision: 3 });
    const [url, request] = fetchMock.mock.calls[1];
    expect(url).toBe('/api/v1/conversations/runtime-settings?tenantId=tenant-1');
    expect(request?.headers).toMatchObject({ 'X-XSRF-TOKEN': 'csrf', 'if-match': '"v2"' });
    expect(JSON.parse(String(request?.body))).toEqual(settings.settings);
  });

  it('lists open handoffs and uses the backend query contract for takeover and handback', async () => {
    const ticket = { id: 'handoff-1', conversationId: 'conversation-1', status: 'HUMAN_ACTIVE', version: 2 };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ items: [ticket], pageSize: 1, hasNext: false }))
      .mockResolvedValueOnce(Response.json({ token: 'csrf', headerName: 'X-XSRF-TOKEN' }))
      .mockResolvedValueOnce(Response.json({ ...ticket, tenantId: 'tenant-1' }))
      .mockResolvedValueOnce(Response.json({ token: 'csrf', headerName: 'X-XSRF-TOKEN' }))
      .mockResolvedValueOnce(Response.json({ ...ticket, status: 'CLOSED', version: 3 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(listOpenHandoffs()).resolves.toMatchObject({ items: [ticket] });
    await setConversationTakeover('tenant-1', 'conversation-1');
    await setConversationHandback('conversation-1', 2);
    expect(fetchMock.mock.calls[2][0]).toBe('/api/v1/conversations/conversation-1/takeover?tenantId=tenant-1');
    expect(fetchMock.mock.calls[4][0]).toBe('/api/v1/conversations/conversation-1/handback?expectedVersion=2');
  });

});
