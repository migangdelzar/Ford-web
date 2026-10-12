import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  store: null as any,
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
  toast: vi.fn(),
}));

vi.mock('../../src/store/useCrmStore', () => ({ useCrmStore: () => mocks.store }));
vi.mock('../../src/shared/api/operatorCrmApi', () => ({
  getConversationRuntimeSettings: mocks.getSettings,
  updateConversationRuntimeSettings: mocks.updateSettings,
}));
vi.mock('../../src/shared/ui/SonnerToast', () => ({ useToast: () => ({ toast: mocks.toast }) }));

import { BotConfigWidget } from '../../src/widgets/bot-config/ui/BotConfigWidget';

const initialSettings = {
  tenantId: 'tenant-1', revision: 4,
  settings: { humanHandoffEnabled: true, memoryEnabled: true, promptRecentMessageLimit: 12 },
  updatedAt: null, updatedBy: null,
};

describe('bot runtime settings UI', () => {
  afterEach(() => vi.clearAllMocks());

  function mount() {
    mocks.store = {
      isAuthenticated: true, activeTenantId: 'tenant-1',
      botConfig: { mode: 'auto_reply', handoffKeywords: [], handoffOnUnsure: true, systemPrompt: '' },
      updateBotConfig: vi.fn(), resetBotConfig: vi.fn(),
    };
    mocks.getSettings.mockResolvedValue(initialSettings);
    return render(<BotConfigWidget />);
  }

  it('loads settings from Ford-service and saves updated values with the loaded revision', async () => {
    mocks.updateSettings.mockResolvedValue({ ...initialSettings, revision: 5 });
    mount();

    expect(await screen.findByText('Ajustes activos del backend')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Memoria del bot habilitada'));
    fireEvent.change(screen.getByLabelText('Mensajes recientes usados como contexto'), { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar ajustes' }));

    await waitFor(() => expect(mocks.updateSettings).toHaveBeenCalledWith('tenant-1', 4, {
      humanHandoffEnabled: true, memoryEnabled: false, promptRecentMessageLimit: 9,
    }));
  });
});
