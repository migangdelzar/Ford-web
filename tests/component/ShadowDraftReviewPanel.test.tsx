import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ list: vi.fn(), review: vi.fn() }));
vi.mock('../../src/shared/api/shadowDraftApi', () => ({
  listShadowDrafts: api.list,
  reviewShadowDraft: api.review,
}));

import { ShadowDraftReviewPanel } from '../../src/widgets/conversation/ui/ShadowDraftReviewPanel';

const draft = {
  id: 'draft-1', conversationId: 'conversation-1', createdAt: '2026-10-18T10:00:00Z',
  expiresAt: '2026-10-25T10:00:00Z', reviewStatus: 'PENDING' as const,
  text: 'Hola, ¿qué modelo te interesa?',
};

describe('shadow draft review panel', () => {
  afterEach(() => vi.clearAllMocks());

  it('shows an unsent draft, records an internal review decision, and reloads it', async () => {
    api.list.mockResolvedValue([draft]);
    api.review.mockResolvedValue(undefined);
    render(<ShadowDraftReviewPanel tenantId="tenant-1" conversationId="conversation-1" isAuthenticated />);

    expect(await screen.findByText(draft.text)).toBeInTheDocument();
    expect(screen.getByText(/no se envían al cliente/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Nota de revisión'), { target: { value: 'Tono correcto' } });
    fireEvent.click(screen.getByRole('button', { name: 'Marcar útil' }));

    await waitFor(() => expect(api.review).toHaveBeenCalledWith('tenant-1', 'conversation-1', 'draft-1', 'ACCEPTED', 'Tono correcto'));
    await waitFor(() => expect(api.list).toHaveBeenCalledTimes(2));
  });

  it('does not load tenant data while the operator session is unavailable', () => {
    const { container } = render(<ShadowDraftReviewPanel tenantId="tenant-1" conversationId="conversation-1" isAuthenticated={false} />);
    expect(container).toBeEmptyDOMElement();
    expect(api.list).not.toHaveBeenCalled();
  });
});
