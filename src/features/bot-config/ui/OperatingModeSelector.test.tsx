import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { OperatingModeSelector } from './OperatingModeSelector';

describe('OperatingModeSelector (Co-located Unit/Component Test)', () => {
  it('renders all three intervention modes', () => {
    const handleChange = vi.fn();
    render(<OperatingModeSelector mode="auto_reply" onChangeMode={handleChange} />);

    expect(screen.getByText(/100% Autonomía/i)).toBeDefined();
    expect(screen.getByText(/Sugerencias IA/i)).toBeDefined();
    expect(screen.getByText(/100% Humano/i)).toBeDefined();
  });

  it('triggers onChangeMode when clicking a different mode', () => {
    const handleChange = vi.fn();
    render(<OperatingModeSelector mode="auto_reply" onChangeMode={handleChange} />);

    const copilotOption = screen.getByText(/Sugerencias IA/i).closest('button');
    expect(copilotOption).not.toBeNull();
    if (copilotOption) {
      fireEvent.click(copilotOption);
      expect(handleChange).toHaveBeenCalledWith('suggest_only');
    }
  });

  it('highlights the selected mode without dark jarring contrast', () => {
    const handleChange = vi.fn();
    const { container } = render(<OperatingModeSelector mode="suggest_only" onChangeMode={handleChange} />);

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(3);
    // Middle button should have active border class
    expect(buttons[1].className).toContain('border-[#0071E3]');
  });
});
