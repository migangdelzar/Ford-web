import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Inbox } from 'lucide-react';
import { SidebarNavItem } from './SidebarNavItem';

describe('SidebarNavItem (Co-located Component Test)', () => {
  it('renders label and handles click', () => {
    const handleClick = vi.fn();
    render(
      <SidebarNavItem
        id="inbox"
        label="Bandeja de Entrada"
        icon={Inbox}
        isActive={false}
        isCollapsed={false}
        onClick={handleClick}
      />
    );

    const button = screen.getByRole('button');
    expect(screen.getByText('Bandeja de Entrada')).toBeDefined();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders active left border line and squircle highlight when active', () => {
    const { container } = render(
      <SidebarNavItem
        id="inbox"
        label="Bandeja de Entrada"
        icon={Inbox}
        isActive={true}
        isCollapsed={false}
        onClick={() => {}}
      />
    );

    // Left accent bar
    const leftBar = container.querySelector('.bg-\\[\\#0071E3\\]');
    expect(leftBar).not.toBeNull();
  });

  it('renders badge count when provided', () => {
    render(
      <SidebarNavItem
        id="inbox"
        label="Bandeja de Entrada"
        icon={Inbox}
        isActive={false}
        isCollapsed={false}
        badge={5}
        onClick={() => {}}
      />
    );

    expect(screen.getByText('5')).toBeDefined();
  });
});
