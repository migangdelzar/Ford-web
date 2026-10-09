import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCrmStore } from '../../src/store/useCrmStore';

describe('useCrmStore State & Logic', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useCrmStore());
    act(() => {
      result.current.resetAllData();
      result.current.login('propietario');
    });
  });

  it('initializes with default seed conversations and propietario role', () => {
    const { result } = renderHook(() => useCrmStore());
    expect(result.current.conversations.length).toBeGreaterThan(0);
    expect(result.current.userRole).toBe('propietario');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('switches channel filter and updates channelFilter state', () => {
    const { result } = renderHook(() => useCrmStore());
    act(() => {
      result.current.setChannelFilter('whatsapp');
    });
    expect(result.current.channelFilter).toBe('whatsapp');

    act(() => {
      result.current.setChannelFilter('all');
    });
    expect(result.current.channelFilter).toBe('all');
  });

  it('updates lead temperature and records source', () => {
    const { result } = renderHook(() => useCrmStore());
    const convId = result.current.conversations[0].id;
    act(() => {
      result.current.updateLeadTemperature(convId, 'hot');
    });
    const updated = result.current.allConversations.find((c) => c.id === convId);
    expect(updated?.leadTemperature).toBe('hot');
  });

  it('toggles takeover between bot and human mode', () => {
    const { result } = renderHook(() => useCrmStore());
    const convId = result.current.conversations[0].id;
    
    act(() => {
      result.current.setTakeover(convId, 'human');
    });
    let conv = result.current.allConversations.find((c) => c.id === convId);
    expect(conv?.status).toBe('human');

    act(() => {
      result.current.setTakeover(convId, 'bot');
    });
    conv = result.current.allConversations.find((c) => c.id === convId);
    expect(conv?.status).toBe('bot');
  });

  it('manages 24-hour Meta window fast forward and reopen', () => {
    const { result } = renderHook(() => useCrmStore());
    const convId = result.current.conversations[0].id;

    act(() => {
      result.current.fastForward24Hours(convId);
    });
    let conv = result.current.allConversations.find((c) => c.id === convId);
    expect(conv?.isWindowOpen).toBe(false);

    act(() => {
      result.current.reopen24HourWindow(convId);
    });
    conv = result.current.allConversations.find((c) => c.id === convId);
    expect(conv?.isWindowOpen).toBe(true);
  });

  it('updates extracted lead fields', () => {
    const { result } = renderHook(() => useCrmStore());
    const convId = result.current.conversations[0].id;

    act(() => {
      result.current.updateExtractedFields(convId, {
        interest: 'Ford Maverick Lariat Hybrid',
        budget: '$720,000 MXN',
        urgency: 'alta',
      });
    });

    const conv = result.current.allConversations.find((c) => c.id === convId);
    expect(conv?.extractedFields?.interest).toBe('Ford Maverick Lariat Hybrid');
    expect(conv?.extractedFields?.budget).toBe('$720,000 MXN');
  });

  it('reassigns conversation to another advisor', () => {
    const { result } = renderHook(() => useCrmStore());
    const convId = result.current.conversations[0].id;

    act(() => {
      result.current.reassignConversation(convId, 'adv-03', 'Carlos Mendoza');
    });

    const conv = result.current.allConversations.find((c) => c.id === convId);
    expect(conv?.assignedTo).toBe('adv-03');
  });

  it('updates bot configuration rules and prompt', () => {
    const { result } = renderHook(() => useCrmStore());

    act(() => {
      result.current.updateBotConfig({
        ...result.current.botConfig,
        systemPrompt: 'Prompt de prueba personalizado para la agencia',
        handoffOnUnsure: false,
      });
    });

    expect(result.current.botConfig.systemPrompt).toBe('Prompt de prueba personalizado para la agencia');
    expect(result.current.botConfig.handoffOnUnsure).toBe(false);
  });
});
