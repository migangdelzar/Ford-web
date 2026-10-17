import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCrmStore } from '../../src/store/useCrmStore';
import { useSseEvents } from '../../src/shared/lib/useSseEvents';

class FakeEventSource extends EventTarget {
  static instances: FakeEventSource[] = [];
  readonly url: string;
  closed = false;

  constructor(url: string) {
    super();
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
  }
}

describe('useSseEvents', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    FakeEventSource.instances = [];
  });

  it('keeps one stream open while unrelated CRM state changes', () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    const store = renderHook(() => useCrmStore());
    const sse = renderHook(() => useSseEvents(true, 'tenant-1'));

    act(() => store.result.current.setChannelFilter('whatsapp'));

    expect(FakeEventSource.instances).toHaveLength(1);
    expect(FakeEventSource.instances[0].closed).toBe(false);
    sse.unmount();
    expect(FakeEventSource.instances[0].closed).toBe(true);
  });

  it('refreshes the conversation after the bot reply is committed', async () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ items: [], page: { pageSize: 50, hasNext: false } }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    ));
    vi.stubGlobal('fetch', fetchMock);
    const store = renderHook(() => useCrmStore());
    act(() => store.result.current.completeAuthCheck({
      operatorId: 'operator-1', displayName: 'Test', email: 'test@example.com', roles: ['ADMIN'], tenantIds: ['tenant-1'], hasPasskey: false,
    }));
    renderHook(() => useSseEvents(true, 'tenant-1'));

    await act(async () => {
      FakeEventSource.instances[0].dispatchEvent(
        new MessageEvent('conversation.updated', { data: JSON.stringify({ conversationId: 'conversation-1' }) }),
      );
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toContain('/api/v1/conversations?');
  });
});
