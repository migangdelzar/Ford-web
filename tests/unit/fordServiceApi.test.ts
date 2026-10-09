import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendAiTurn } from '../../src/shared/api/fordServiceApi';

const answer = {
  conversationId: 'c47f9e67-8252-438a-a1e5-7bc15b63dc33',
  replyText: 'Respuesta basada en Ford-service.',
  suggestedTemperature: 'WARM',
  handoffSuggested: false,
  handoffReason: '',
  intent: 'VEHICLE_INFO',
  leadStage: 'DISCOVERY',
  toolFamily: 'vehicle',
  sourceDocumentIds: [],
};

describe('Ford-service API client', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends a typed AI turn through the authenticated same-origin BFF', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ token: 'csrf-value', headerName: 'X-XSRF-TOKEN' }))
      .mockResolvedValueOnce(Response.json(answer));
    vi.stubGlobal('fetch', fetchMock);

    await expect(sendAiTurn({ conversationId: answer.conversationId, messages: [{ role: 'user', content: 'Hola' }] }))
      .resolves.toEqual(answer);
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/v1/ai/respond', expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin',
      headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'csrf-value' }),
      body: JSON.stringify({ conversationId: answer.conversationId, messages: [{ role: 'user', content: 'Hola' }] }),
    }));
  });

  it('surfaces backend authorization failures without fabricating an answer', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(Response.json({ token: 'csrf-value', headerName: 'X-XSRF-TOKEN' }))
      .mockResolvedValueOnce(Response.json({ detail: 'No operator access' }, { status: 403 })));
    await expect(sendAiTurn({ messages: [{ role: 'user', content: 'Hola' }] })).rejects.toThrow('No operator access');
  });
});
