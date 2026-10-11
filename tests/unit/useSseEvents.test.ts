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
});
