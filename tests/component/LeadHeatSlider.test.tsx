import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadHeatSlider } from '../../src/entities/conversation/ui/LeadHeatSlider';

describe('LeadHeatSlider Component', () => {
  it('renders all three temperature levels (Frío, Tibio, Caliente)', () => {
    render(<LeadHeatSlider temperature="warm" onChange={vi.fn()} />);
    expect(screen.getByText(/Frío/i)).toBeInTheDocument();
    expect(screen.getByText(/Tibio/i)).toBeInTheDocument();
    expect(screen.getByText(/Caliente/i)).toBeInTheDocument();
  });

  it('triggers onChange with the selected temperature when clicked', () => {
    const handleChange = vi.fn();
    render(<LeadHeatSlider temperature="cold" onChange={handleChange} />);
    const hotButton = screen.getByRole('button', { name: /Caliente/i });
    fireEvent.click(hotButton);
    expect(handleChange).toHaveBeenCalledWith('hot');
  });
});
