import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AiTelemetrySection } from '../../src/entities/message/ui/AiTelemetrySection';
import { Message } from '../../src/types';

const mockMessageWithDebug: Message = {
  id: 'msg-debug',
  conversationId: 'conv-1',
  channel: 'whatsapp',
  sender: 'bot',
  content: 'Respuesta del bot con telemetría',
  timestamp: '2026-09-20T10:00:00.000Z',
  status: 'read',
  aiDebug: {
    model: 'gemini-1.5-flash',
    latencyMs: 240,
    tokensIn: 320,
    tokensOut: 45,
    temperature: 0.7,
    suggestedTemperature: 'warm',
    handoffSuggested: false,
    systemPromptSent: 'Prompt de prueba',
    handoffReason: 'Interés detectado en compra directa',
    extractedFields: { name: 'Sofía' },
    rawResponse: {},
    contextWindowSent: [
      { role: 'user', content: 'Quiero información de la Territory' },
    ],
  },
};

describe('AiTelemetrySection Component', () => {
  it('returns null if message has no aiDebug', () => {
    const emptyMsg: Message = {
      id: 'msg-empty',
      conversationId: 'conv-1',
      channel: 'whatsapp',
      sender: 'customer',
      content: 'Hola',
      timestamp: '2026-09-20T10:00:00.000Z',
      status: 'read',
    };
    const { container } = render(<AiTelemetrySection message={emptyMsg} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders progressive disclosure button with latency ms', () => {
    render(<AiTelemetrySection message={mockMessageWithDebug} />);
    expect(screen.getByText(/240ms/i)).toBeInTheDocument();
  });

  it('expands telemetry details when clicked', () => {
    render(<AiTelemetrySection message={mockMessageWithDebug} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getAllByText(/Concierge 1.5 Flash/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/240 ms/i)).toBeInTheDocument();
  });
});
