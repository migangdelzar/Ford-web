import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { InspectorWidget } from '../../src/widgets/inspector/ui/InspectorWidget';
import { useCrmStore } from '../../src/store/useCrmStore';

describe('InspectorWidget (Ficha del Prospecto)', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useCrmStore());
    act(() => {
      result.current.resetAllData();
      result.current.completeAuthCheck({ operatorId: 'op-1', displayName: 'Admin', email: 'admin@example.com', roles: ['ADMIN'], tenantIds: ['tenant-1'], hasPasskey: false });
      // Keep fixture data explicit: real authenticated sessions clear browser demo conversations.
      result.current.resetAllData();
      result.current.selectConversation('conv-1');
    });
  });

  it('renders customer name and phone handle in header', () => {
    render(<InspectorWidget />);
    expect(screen.getByText('Sofía Alarcón')).toBeInTheDocument();
    expect(screen.getByText('+52 55 8392 1044')).toBeInTheDocument();
  });

  it('renders purchase file and vehicle details', () => {
    render(<InspectorWidget />);
    expect(screen.getByText(/Expediente del Prospecto/i)).toBeInTheDocument();
  });

  it('renders action buttons for chat takeover and copying CRM file', () => {
    render(<InspectorWidget />);
    expect(screen.getByRole('button', { name: /Tomar Chat|Activar Bot/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copiar Expediente/i })).toBeInTheDocument();
  });

  it('copies prospect CRM data when clicking Copiar Expediente', () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    render(<InspectorWidget />);
    const copyBtn = screen.getByRole('button', { name: /Copiar Expediente/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
