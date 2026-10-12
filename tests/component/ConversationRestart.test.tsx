import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  store: null as any,
  restart: vi.fn(),
  toast: vi.fn(),
}));

vi.mock('../../src/store/useCrmStore', () => ({ useCrmStore: () => mocks.store }));
vi.mock('../../src/shared/api/operatorCrmApi', () => ({ restartConversationContext: mocks.restart }));
vi.mock('../../src/shared/ui/SonnerToast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('../../src/entities/conversation/ui/ConversationHeader', () => ({
  ConversationHeader: ({ onRestartMemory }: { onRestartMemory?: () => void }) => (
    <button aria-label="restart-memory" onClick={onRestartMemory}>Restart</button>
  ),
}));
vi.mock('../../src/entities/message/ui/MessageBubble', () => ({ MessageBubble: () => null }));
vi.mock('../../src/entities/message/ui/TypingIndicator', () => ({ TypingIndicator: () => null }));
vi.mock('../../src/features/composer/ui/OmniComposer', () => ({ OmniComposer: () => null }));
vi.mock('../../src/shared/ui/ConfirmDialog', () => ({
  ConfirmDialog: ({ isOpen, onConfirm, onClose }: { isOpen: boolean; onConfirm: () => void; onClose: () => void }) =>
    isOpen ? <div role="dialog"><button onClick={onConfirm}>confirm-reset</button><button onClick={onClose}>cancel-reset</button></div> : null,
}));

import { ConversationWidget } from '../../src/widgets/conversation/ui/ConversationWidget';

const conversation = {
  id: 'conversation-1', version: 7, channel: 'whatsapp', customerName: 'Cliente', customerHandle: '521',
  avatarUrl: '', status: 'bot', leadTemperature: 'cold', temperatureSource: 'ai', extractedFields: {},
  firstSeen: '2026-10-12T10:00:00Z', lastMessageAt: '2026-10-12T10:00:00Z',
  lastCustomerMessageAt: '2026-10-12T10:00:00Z', unreadCount: 0, isWindowOpen: true,
} as any;

describe('conversation memory restart UI', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
  });
  afterEach(() => vi.clearAllMocks());

  function mount() {
    mocks.store = {
      selectedConversationId: conversation.id, conversations: [conversation], messages: [],
      setTakeover: vi.fn(), toggleTakeover: vi.fn(), sendAgentMessage: vi.fn(), isAiTyping: false,
      selectedMessageId: null, setSelectedMessageId: vi.fn(), fastForward24Hours: vi.fn(),
      reopen24HourWindow: vi.fn(), retryFailedMessage: vi.fn(), selectConversation: vi.fn(),
      toggleInspector: vi.fn(), isInspectorOpen: false, activeTenantId: 'tenant-1',
      isAuthenticated: true, fetchConversations: vi.fn().mockResolvedValue(undefined),
    };
    return render(<ConversationWidget />);
  }

  it('confirms restart, calls backend, and refreshes the transcript view on success', async () => {
    mocks.restart.mockResolvedValue({ conversationId: conversation.id, conversationVersion: 8, contextStartedAt: '2026-10-12T10:01:00Z' });
    mount();

    fireEvent.click(screen.getByRole('button', { name: 'restart-memory' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'confirm-reset' }));

    await waitFor(() => expect(mocks.restart).toHaveBeenCalledWith('tenant-1', conversation.id, 7));
    await waitFor(() => expect(mocks.store.fetchConversations).toHaveBeenCalledOnce());
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
  });

  it('keeps local transcript untouched and shows retry guidance when a bot turn is active', async () => {
    mocks.restart.mockRejectedValue(new Error('conversation bot turn is active; retry after it finishes'));
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'restart-memory' }));
    fireEvent.click(screen.getByRole('button', { name: 'confirm-reset' }));

    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' })));
    expect(mocks.store.fetchConversations).not.toHaveBeenCalled();
  });
});
