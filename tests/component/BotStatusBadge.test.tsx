import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BotStatusBadge } from '../../src/features/takeover/ui/BotStatusBadge';

describe('BotStatusBadge Component', () => {
  it('renders Bot status correctly', () => {
    render(<BotStatusBadge status="bot" />);
    expect(screen.getByText(/Bot/i)).toBeInTheDocument();
  });

  it('renders Human / Asesor status correctly', () => {
    render(<BotStatusBadge status="human" />);
    expect(screen.getByText(/Asesor/i)).toBeInTheDocument();
  });

  it('renders Waiting / Escalation status with pulse animation', () => {
    const { container } = render(<BotStatusBadge status="waiting" />);
    expect(screen.getByText(/Requiere Asesor/i)).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('handles click callback when passed', () => {
    const handleClick = vi.fn();
    render(<BotStatusBadge status="bot" onClick={handleClick} />);
    fireEvent.click(screen.getByText(/Bot/i));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
