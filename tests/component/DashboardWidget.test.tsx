import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { DashboardWidget } from '../../src/widgets/dashboard/ui/DashboardWidget';
import { useCrmStore } from '../../src/store/useCrmStore';

describe('DashboardWidget Component', () => {
  it('renders correctly for Propietario with full metric suite', () => {
    render(<DashboardWidget />);

    expect(screen.getByRole('heading', { name: /Métricas/i })).toBeInTheDocument();
    expect(screen.getByText(/Pipeline Comercial Activo/i)).toBeInTheDocument();
    expect(screen.getByText(/Meta Mensual de Citas y Cierres/i)).toBeInTheDocument();
  });

  it('renders period selector (7 días, Este mes, Trimestre)', () => {
    render(<DashboardWidget />);

    expect(screen.getByRole('button', { name: /7 días/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Este mes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Trimestre/i })).toBeInTheDocument();
  });

  it('adapts terminology for Asesor role', () => {
    const { result } = renderHook(() => useCrmStore());
    act(() => {
      result.current.login('asesor');
    });

    render(<DashboardWidget />);
    expect(screen.getByText(/Cartera Comercial Asignada/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Mis Números/i })).toBeInTheDocument();
  });

  it('renders Telemetría IA tab for Propietario and switches to it', () => {
    const { result } = renderHook(() => useCrmStore());
    act(() => {
      result.current.login('propietario');
    });

    render(<DashboardWidget />);
    const tabButton = screen.getByRole('button', { name: /Telemetría IA/i });
    expect(tabButton).toBeInTheDocument();

    fireEvent.click(tabButton);
    expect(screen.getByText(/Tokens Totales Procesados/i)).toBeInTheDocument();
    expect(screen.getByText(/Costo Operativo Estimado/i)).toBeInTheDocument();
    expect(screen.getByText(/Motor Cognitivo & Autonomía/i)).toBeInTheDocument();
  });
});
