import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BotControlSwitch } from '../../src/features/takeover/ui/BotControlSwitch';

describe('BotControlSwitch — states and a11y', () => {
  it('applies bg-slate-900 + text-white when status is bot', () => {
    render(<BotControlSwitch status="bot" onToggle={vi.fn()} />);
    const botButton = screen.getByRole('button', { name: /bot/i });
    expect(botButton).toHaveClass('bg-slate-900', 'text-white');
    expect(botButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies bg-blue-600 + text-white when status is human (asesor)', () => {
    render(<BotControlSwitch status="human" onToggle={vi.fn()} />);
    const asesorButton = screen.getByRole('button', { name: /asesor/i });
    expect(asesorButton).toHaveClass('bg-blue-600', 'text-white');
    expect(asesorButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('inactive button shows text-slate-600, not white-on-transparent', () => {
    render(<BotControlSwitch status="bot" onToggle={vi.fn()} />);
    const asesorButton = screen.getByRole('button', { name: /asesor/i });
    expect(asesorButton).toHaveClass('text-slate-600');
    expect(asesorButton).not.toHaveClass('text-white');
  });

  it('dispatches onToggle when clicking on the inactive mode', () => {
    const onToggle = vi.fn();
    render(<BotControlSwitch status="bot" onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: /asesor/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('dispatches onSetMode with explicit target when onSetMode is provided', () => {
    const onSetMode = vi.fn();
    render(<BotControlSwitch status="bot" onToggle={vi.fn()} onSetMode={onSetMode} />);
    fireEvent.click(screen.getByRole('button', { name: /asesor/i }));
    expect(onSetMode).toHaveBeenCalledWith('human');
  });

  // Regression test for the original bug: multiple simultaneously-mounted
  // instances (desktop bar / mobile bar / drawer) must never desync their
  // active-state styling.
  it('keeps all mounted instances in sync when status is shared', () => {
    render(
      <>
        <BotControlSwitch id="desktop" status="bot" onToggle={vi.fn()} />
        <BotControlSwitch id="mobile" status="bot" onToggle={vi.fn()} />
        <BotControlSwitch id="drawer" status="bot" onToggle={vi.fn()} />
      </>
    );
    const botButtons = screen.getAllByRole('button', { name: /^bot$/i });
    expect(botButtons).toHaveLength(3);
    botButtons.forEach((btn) => {
      expect(btn).toHaveClass('bg-slate-900', 'text-white');
    });
  });
});
