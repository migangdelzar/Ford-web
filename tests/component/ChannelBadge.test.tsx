import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChannelBadge } from '../../src/entities/conversation/ui/ChannelBadge';
import { LeadTempBadge } from '../../src/entities/conversation/ui/LeadTempBadge';
import { MetaWindowBadge } from '../../src/entities/conversation/ui/MetaWindowBadge';

describe('Conversation Entity Badges', () => {
  it('renders WhatsApp channel badge with label', () => {
    render(<ChannelBadge channel="whatsapp" showLabel={true} />);
    expect(screen.getByText(/WhatsApp/i)).toBeInTheDocument();
  });

  it('renders Instagram channel badge with label', () => {
    render(<ChannelBadge channel="instagram" showLabel={true} />);
    expect(screen.getByText(/Instagram/i)).toBeInTheDocument();
  });

  it('renders Messenger channel badge with label', () => {
    render(<ChannelBadge channel="messenger" showLabel={true} />);
    expect(screen.getByText(/Messenger/i)).toBeInTheDocument();
  });

  it('renders LeadTempBadge for hot leads', () => {
    render(<LeadTempBadge temperature="hot" showLabel={true} />);
    expect(screen.getByText(/Caliente/i)).toBeInTheDocument();
  });

  it('renders LeadTempBadge for warm leads', () => {
    render(<LeadTempBadge temperature="warm" showLabel={true} />);
    expect(screen.getByText(/Tibio/i)).toBeInTheDocument();
  });

  it('renders LeadTempBadge for cold leads', () => {
    render(<LeadTempBadge temperature="cold" showLabel={true} />);
    expect(screen.getByText(/Frío/i)).toBeInTheDocument();
  });

  it('renders MetaWindowBadge when window is open (+24h)', () => {
    const handleSimulate = vi.fn();
    render(<MetaWindowBadge isOpen={true} onReopen={vi.fn()} onSimulateExpire={handleSimulate} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('+24h');
    fireEvent.click(btn);
    expect(handleSimulate).toHaveBeenCalled();
  });

  it('renders MetaWindowBadge when closed (HSM button)', () => {
    const handleReopen = vi.fn();
    render(<MetaWindowBadge isOpen={false} onReopen={handleReopen} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('HSM');
    fireEvent.click(btn);
    expect(handleReopen).toHaveBeenCalled();
  });
});
