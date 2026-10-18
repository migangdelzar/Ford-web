import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ShadowDraftReviewPanel } from '../../src/widgets/conversation/ui/ShadowDraftReviewPanel';

const draft = {
  id: 'draft-1', conversationId: 'conversation-1', createdAt: '2026-10-18T10:00:00Z',
  expiresAt: '2026-10-25T10:00:00Z', reviewStatus: 'PENDING' as const,
  text: 'Hola, ¿qué modelo te interesa?',
};

describe('shadow draft review panel', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows an unsent draft, records an internal review decision, and reloads it', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === '/api/auth/csrf') {
        return Response.json({ token: 'csrf-value', headerName: 'X-XSRF-TOKEN' });
      }
      if (url.includes('/shadow-drafts/') && init?.method === 'POST') {
        return new Response(null, { status: 204 });
      }
      if (url.includes('/shadow-drafts?')) return Response.json([draft]);
      return Response.json({ error: 'unexpected_request' }, { status: 404 });
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<ShadowDraftReviewPanel tenantId="tenant-1" conversationId="conversation-1" isAuthenticated />);

    expect(await screen.findByText(draft.text)).toBeInTheDocument();
    expect(screen.getByText(/no se envían al cliente/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Nota de revisión'), { target: { value: 'Tono correcto' } });
    fireEvent.click(screen.getByRole('button', { name: 'Marcar útil' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    expect(fetchMock).toHaveBeenNthCalledWith(1,
      '/api/v1/conversations/conversation-1/shadow-drafts?tenantId=tenant-1',
      expect.objectContaining({ credentials: 'same-origin' }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/auth/csrf', expect.objectContaining({ credentials: 'same-origin' }));
    expect(fetchMock).toHaveBeenNthCalledWith(3,
      '/api/v1/conversations/conversation-1/shadow-drafts/draft-1/review?tenantId=tenant-1',
      expect.objectContaining({ method: 'POST', headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'csrf-value' }) }));
    expect(fetchMock).toHaveBeenNthCalledWith(4,
      '/api/v1/conversations/conversation-1/shadow-drafts?tenantId=tenant-1',
      expect.objectContaining({ credentials: 'same-origin' }));
  });

  it('does not load tenant data while the operator session is unavailable', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { container } = render(<ShadowDraftReviewPanel tenantId="tenant-1" conversationId="conversation-1" isAuthenticated={false} />);
    expect(container).toBeEmptyDOMElement();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
