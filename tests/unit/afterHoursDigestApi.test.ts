import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAfterHoursDigest } from '../../src/shared/api/afterHoursDigestApi';

describe('getAfterHoursDigest', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('requests the selected tenant through the same-origin authenticated API', async () => {
    const digest = {
      tenantId: 'tenant-1', businessDate: '2026-10-19', timeZone: 'America/Mexico_City',
      available: true, availableAt: '2026-10-19T14:45:00Z',
      windowStart: '2026-10-17T20:00:00Z', windowEnd: '2026-10-19T15:00:00Z',
      totalCount: 1, completePacketCount: 0, partialPacketCount: 1,
      items: [{ handoffId: 'handoff-1', conversationId: 'conversation-1',
        createdAt: '2026-10-19T14:50:00Z', status: 'HUMAN_PENDING', reason: 'CUSTOMER_REQUEST',
        packetCompleteness: 2, packetPartial: true }],
    };
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(digest), { status: 200 }));
    vi.stubGlobal('fetch', fetch);

    await expect(getAfterHoursDigest('tenant 1')).resolves.toEqual(digest);

    expect(fetch).toHaveBeenCalledWith('/api/v1/handoffs/after-hours-digest?tenantId=tenant+1', {
      credentials: 'same-origin', headers: { accept: 'application/json' },
    });
  });

  it('rejects an invalid Service response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [] }), { status: 200 })));

    await expect(getAfterHoursDigest('tenant-1')).rejects.toThrow('Ford-service returned an invalid after-hours digest');
  });

  it('surfaces an upstream authorization error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 })));

    await expect(getAfterHoursDigest('tenant-1')).rejects.toThrow('forbidden');
  });
});
