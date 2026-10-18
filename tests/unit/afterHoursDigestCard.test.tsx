import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AfterHoursDigestCard } from '../../src/widgets/thread-list/ui/AfterHoursDigestCard';
import * as digestApi from '../../src/shared/api/afterHoursDigestApi';

const digest = {
  tenantId: 'tenant-1', businessDate: '2026-10-19', timeZone: 'America/Mexico_City',
  available: true, availableAt: '2026-10-19T14:45:00Z',
  windowStart: '2026-10-17T20:00:00Z', windowEnd: '2026-10-19T15:00:00Z',
  totalCount: 1, completePacketCount: 0, partialPacketCount: 1,
  items: [{ handoffId: 'handoff-1', conversationId: 'conversation-1',
    createdAt: '2026-10-19T14:50:00Z', status: 'HUMAN_PENDING' as const, reason: 'CUSTOMER_REQUEST',
    packetCompleteness: 2, packetPartial: true }],
};

describe('AfterHoursDigestCard', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows the ready after-hours handoff and opens its conversation', async () => {
    vi.spyOn(digestApi, 'getAfterHoursDigest').mockResolvedValue(digest);
    const onOpenConversation = vi.fn();
    render(<AfterHoursDigestCard tenantId="tenant-1" onOpenConversation={onOpenConversation} />);

    expect(await screen.findByText(/BDC · 19 de octubre de 2026/i)).toBeTruthy();
    expect(screen.getByText(/1 transferencia/)).toBeTruthy();
    expect(screen.getByText(/paquete parcial/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /abrir conversación/i }));
    expect(onOpenConversation).toHaveBeenCalledWith('conversation-1');
  });

  it('refreshes itself when the server-reported 08:45 availability time arrives', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-19T14:44:59Z'));
    const request = vi.spyOn(digestApi, 'getAfterHoursDigest')
      .mockResolvedValueOnce({ ...digest, available: false, items: [], totalCount: 0 })
      .mockResolvedValueOnce(digest);
    render(<AfterHoursDigestCard tenantId="tenant-1" onOpenConversation={vi.fn()} />);
    await act(async () => { await Promise.resolve(); });
    expect(request).toHaveBeenCalledTimes(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(request).toHaveBeenCalledTimes(2);
    expect(screen.getByText(/paquete parcial/i)).toBeTruthy();
    vi.useRealTimers();
  });

  it('does not expose digest details before its 08:45 availability', async () => {
    vi.spyOn(digestApi, 'getAfterHoursDigest').mockResolvedValue({ ...digest, available: false, items: [], totalCount: 0 });
    render(<AfterHoursDigestCard tenantId="tenant-1" onOpenConversation={vi.fn()} />);
    expect(await screen.findByText(/disponible a las 08:45/i)).toBeTruthy();
    expect(screen.queryByText(/paquete parcial/i)).toBeNull();
  });

  it('clears the prior tenant digest while loading a newly selected tenant', async () => {
    let resolveNext: ((value: typeof digest) => void) | undefined;
    const request = vi.spyOn(digestApi, 'getAfterHoursDigest')
      .mockResolvedValueOnce(digest)
      .mockImplementationOnce(() => new Promise((resolve) => { resolveNext = resolve; }));
    const { rerender } = render(<AfterHoursDigestCard tenantId="tenant-1" onOpenConversation={vi.fn()} />);
    expect(await screen.findByText(/paquete parcial/i)).toBeTruthy();
    rerender(<AfterHoursDigestCard tenantId="tenant-2" onOpenConversation={vi.fn()} />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    expect(screen.queryByText(/paquete parcial/i)).toBeNull();
    expect(screen.getByRole('status').textContent).toContain('Cargando');
    resolveNext?.({ ...digest, tenantId: 'tenant-2', items: [], totalCount: 0 });
    expect(await screen.findByText(/sin transferencias/i)).toBeTruthy();
  });

  it('offers a retry after a request failure', async () => {
    const request = vi.spyOn(digestApi, 'getAfterHoursDigest')
      .mockRejectedValueOnce(new Error('Service unavailable'))
      .mockResolvedValueOnce({ ...digest, items: [], totalCount: 0 });
    render(<AfterHoursDigestCard tenantId="tenant-1" onOpenConversation={vi.fn()} />);
    expect(await screen.findByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    expect(await screen.findByText(/sin transferencias/i)).toBeTruthy();
  });
});
