import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageBubble } from '../../src/entities/message/ui/MessageBubble';
import { Message, Conversation } from '../../src/types';

const mockConversation: Conversation = {
  id: 'conv-1',
  channel: 'whatsapp',
  customerName: 'Carlos Mendoza',
  customerHandle: '+52 55 1234 5678',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  status: 'bot',
  leadTemperature: 'warm',
  temperatureSource: 'ai',
  extractedFields: { name: 'Carlos Mendoza', interest: 'Mustang' },
  firstSeen: '2026-09-20T10:00:00.000Z',
  lastMessageAt: '2026-09-20T10:05:00.000Z',
  lastCustomerMessageAt: '2026-09-20T10:05:00.000Z',
  unreadCount: 0,
  isWindowOpen: true,
};

describe('MessageBubble Component', () => {
  it('renders customer message on the left with text content', () => {
    const customerMsg: Message = {
      id: 'msg-1',
      conversationId: 'conv-1',
      channel: 'whatsapp',
      sender: 'customer',
      content: 'Hola, me interesa el Mustang GT',
      timestamp: '2026-09-20T10:00:00.000Z',
      status: 'read',
    };

    render(<MessageBubble message={customerMsg} conversation={mockConversation} />);
    expect(screen.getByText('Hola, me interesa el Mustang GT')).toBeInTheDocument();
  });

  it('renders bot message with Bot badge and telemetry trigger', () => {
    const botMsg: Message = {
      id: 'msg-2',
      conversationId: 'conv-1',
      channel: 'whatsapp',
      sender: 'bot',
      content: 'Excelente elección, el Mustang GT cuenta con motor V8.',
      timestamp: '2026-09-20T10:01:00.000Z',
      status: 'read',
      aiDebug: {
        model: 'gemini-3.8-flash',
        latencyMs: 320,
        tokensIn: 450,
        tokensOut: 65,
        temperature: 0.7,
        suggestedTemperature: 'warm',
        handoffSuggested: false,
        systemPromptSent: 'Prompt de prueba',
        extractedFields: {},
        rawResponse: {},
        contextWindowSent: [],
      },
    };

    const handleSelect = vi.fn();
    render(
      <MessageBubble
        message={botMsg}
        conversation={mockConversation}
        onSelectBotMessage={handleSelect}
      />
    );
    expect(screen.getByText('Excelente elección, el Mustang GT cuenta con motor V8.')).toBeInTheDocument();
    expect(screen.getByText(/Bot/i)).toBeInTheDocument();
  });

  it('renders failed message with retry action button', () => {
    const failedMsg: Message = {
      id: 'msg-3',
      conversationId: 'conv-1',
      channel: 'whatsapp',
      sender: 'human',
      content: 'Mensaje que falló al enviar por red',
      timestamp: '2026-09-20T10:02:00.000Z',
      status: 'failed',
    };

    const handleRetry = vi.fn();
    render(
      <MessageBubble
        message={failedMsg}
        conversation={mockConversation}
        onRetryFailed={handleRetry}
      />
    );
    const retryBtn = screen.getByRole('button', { name: /reintentar/i });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledWith('msg-3');
  });

  it('renders internal advisor note with distinct badge', () => {
    const noteMsg: Message = {
      id: 'msg-4',
      conversationId: 'conv-1',
      channel: 'whatsapp',
      sender: 'human',
      content: 'Nota interna: El cliente busca financiamiento a 36 meses',
      timestamp: '2026-09-20T10:03:00.000Z',
      status: 'read',
      isInternalNote: true,
    };

    render(<MessageBubble message={noteMsg} conversation={mockConversation} />);
    expect(screen.getByText(/Nota interna:/i)).toBeInTheDocument();
  });
});
