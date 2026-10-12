import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCrmStore } from '../../src/store/useCrmStore';

describe('useCrmStore State & Logic', () => {
  afterEach(() => vi.unstubAllGlobals());
  beforeEach(() => {
    const { result } = renderHook(() => useCrmStore());
    act(() => {
      result.current.resetAllData();
      result.current.completeAuthCheck({ operatorId: 'op-1', displayName: 'Admin', email: 'admin@example.com', roles: ['ADMIN'], tenantIds: ['tenant-1'] });
      // Unit tests exercise simulated store actions; production auth clears demo records.
      result.current.resetAllData();
    });
  });

  it('initializes with default seed conversations and propietario role', () => {
    const { result } = renderHook(() => useCrmStore());
    expect(result.current.conversations.length).toBeGreaterThan(0);
    expect(result.current.userRole).toBe('propietario');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('switches channel filter and updates channelFilter state', () => {
    const { result } = renderHook(() => useCrmStore());
    act(() => {
      result.current.setChannelFilter('whatsapp');
    });
    expect(result.current.channelFilter).toBe('whatsapp');

    act(() => {
      result.current.setChannelFilter('all');
    });
    expect(result.current.channelFilter).toBe('all');
  });

  it('updates lead temperature and records source', () => {
    const { result } = renderHook(() => useCrmStore());
    const convId = result.current.conversations[0].id;
    act(() => {
      result.current.updateLeadTemperature(convId, 'hot');
    });
    const updated = result.current.allConversations.find((c) => c.id === convId);
    expect(updated?.leadTemperature).toBe('hot');
  });

  it('toggles takeover through the backend between bot and human mode', async () => {
    const activeTicket = { id: 'handoff-1', conversationId: 'conv-1', tenantId: 'tenant-1', status: 'HUMAN_ACTIVE', version: 1 };
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(Response.json({ token: 'csrf', headerName: 'X-XSRF-TOKEN' }))
      .mockResolvedValueOnce(Response.json(activeTicket))
      .mockResolvedValueOnce(Response.json({ id: 'conv-1', tenantId: 'tenant-1', channel: 'WHATSAPP', state: 'HUMAN_ACTIVE', version: 2, participant: { providerId: 'p1' }, updatedAt: '2026-10-09T00:00:00Z' }))
      .mockResolvedValueOnce(Response.json({ items: [activeTicket], pageSize: 1, hasNext: false }))
      .mockResolvedValueOnce(Response.json({ token: 'csrf', headerName: 'X-XSRF-TOKEN' }))
      .mockResolvedValueOnce(Response.json({ ...activeTicket, status: 'CLOSED', version: 2 }))
      .mockResolvedValueOnce(Response.json({ id: 'conv-1', tenantId: 'tenant-1', channel: 'WHATSAPP', state: 'BOT_ACTIVE', version: 3, participant: { providerId: 'p1' }, updatedAt: '2026-10-09T00:01:00Z' })));
    const { result } = renderHook(() => useCrmStore());
    const convId = result.current.conversations[0].id;
    
    await act(async () => {
      await result.current.setTakeover(convId, 'human');
    });
    let conv = result.current.allConversations.find((c) => c.id === convId);
    expect(conv?.status).toBe('human');

    await act(async () => {
      await result.current.setTakeover(convId, 'bot');
    });
    conv = result.current.allConversations.find((c) => c.id === convId);
    expect(conv?.status).toBe('bot');
  });

  it('identifies bot and advisor messages from the API sender type', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(Response.json({
        items: [{
          id: 'conversation-1', tenantId: 'tenant-1', channel: 'WHATSAPP', state: 'HUMAN_ACTIVE', version: 1,
          participant: { providerId: 'customer-1' }, updatedAt: '2026-10-12T00:00:00Z',
        }],
        page: { pageSize: 50, hasNext: false },
      }))
      .mockResolvedValueOnce(Response.json({
        items: [
          { id: 'bot-1', conversationId: 'conversation-1', direction: 'OUTBOUND', senderType: 'BOT', content: 'Respuesta del bot', receivedAt: '2026-10-12T00:00:01Z' },
          { id: 'advisor-1', conversationId: 'conversation-1', direction: 'OUTBOUND', senderType: 'ADVISOR', sender: { providerId: 'operator-1', displayName: 'Ana asesora' }, content: 'Respuesta de Ana', receivedAt: '2026-10-12T00:00:02Z' },
        ],
        page: { pageSize: 100, hasNext: false },
      })));
    const { result } = renderHook(() => useCrmStore());

    await act(async () => result.current.fetchConversations());
    act(() => result.current.selectConversation('conversation-1'));
    await act(async () => Promise.resolve());

    expect(result.current.messages.map(({ sender, senderName }) => [sender, senderName])).toEqual([
      ['human', 'Ana asesora'], ['bot', undefined],
    ]);
  });

  it('manages 24-hour Meta window fast forward and reopen', () => {
    const { result } = renderHook(() => useCrmStore());
    const convId = result.current.conversations[0].id;

    act(() => {
      result.current.fastForward24Hours(convId);
    });
    let conv = result.current.allConversations.find((c) => c.id === convId);
    expect(conv?.isWindowOpen).toBe(false);

    act(() => {
      result.current.reopen24HourWindow(convId);
    });
    conv = result.current.allConversations.find((c) => c.id === convId);
    expect(conv?.isWindowOpen).toBe(true);
  });

  it('updates extracted lead fields', () => {
    const { result } = renderHook(() => useCrmStore());
    const convId = result.current.conversations[0].id;

    act(() => {
      result.current.updateExtractedFields(convId, {
        interest: 'Ford Maverick Lariat Hybrid',
        budget: '$720,000 MXN',
        urgency: 'alta',
      });
    });

    const conv = result.current.allConversations.find((c) => c.id === convId);
    expect(conv?.extractedFields?.interest).toBe('Ford Maverick Lariat Hybrid');
    expect(conv?.extractedFields?.budget).toBe('$720,000 MXN');
  });

  it('reassigns conversation to another advisor', () => {
    const { result } = renderHook(() => useCrmStore());
    const convId = result.current.conversations[0].id;

    act(() => {
      result.current.reassignConversation(convId, 'adv-03', 'Carlos Mendoza');
    });

    const conv = result.current.allConversations.find((c) => c.id === convId);
    expect(conv?.assignedTo).toBe('adv-03');
  });

  it('updates bot configuration rules and prompt', () => {
    const { result } = renderHook(() => useCrmStore());

    act(() => {
      result.current.updateBotConfig({
        ...result.current.botConfig,
        systemPrompt: 'Prompt de prueba personalizado para la agencia',
        handoffOnUnsure: false,
      });
    });

    expect(result.current.botConfig.systemPrompt).toBe('Prompt de prueba personalizado para la agencia');
    expect(result.current.botConfig.handoffOnUnsure).toBe(false);
  });
});

it('keeps the selected conversation and refreshes its messages when the list reloads', async () => {
  const conversation = (id: string, updatedAt: string) => ({
    id, tenantId: 'tenant-1', channel: 'WHATSAPP', state: 'HUMAN_ACTIVE', version: 1,
    participant: { providerId: `provider-${id}`, displayName: id }, updatedAt,
  });
  const page = { page: { pageSize: 50, hasNext: false } };
  const messages = (conversationId: string) => ({
    items: [{
      id: `message-${conversationId}`, conversationId, direction: 'INBOUND', content: `text-${conversationId}`,
      receivedAt: '2026-10-11T00:00:00Z',
    }],
    page: { pageSize: 100, hasNext: false },
  });
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(Response.json({ ...page, items: [conversation('a', '2026-10-11T00:00:00Z'), conversation('b', '2026-10-10T00:00:00Z')] }))
    .mockResolvedValueOnce(Response.json(messages('a')))
    .mockResolvedValueOnce(Response.json(messages('b')))
    .mockResolvedValueOnce(Response.json({ ...page, items: [conversation('a', '2026-10-11T00:01:00Z'), conversation('b', '2026-10-11T00:00:00Z')] }))
    .mockResolvedValueOnce(Response.json(messages('b')));
  vi.stubGlobal('fetch', fetchMock);

  const { result } = renderHook(() => useCrmStore());
  act(() => result.current.completeAuthCheck({
    operatorId: 'operator-1', displayName: 'Operator', email: 'operator@example.com', roles: ['ADMIN'], tenantIds: ['tenant-1'],
  }));
  await act(async () => result.current.fetchConversations());
  act(() => result.current.selectConversation('b'));
  await act(async () => Promise.resolve());
  await act(async () => result.current.fetchConversations());

  expect(result.current.selectedConversationId).toBe('b');
  expect(result.current.messages.map((message) => message.id)).toEqual(['message-b']);
});
