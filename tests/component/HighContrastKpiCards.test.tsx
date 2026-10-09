import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HighContrastKpiCards } from '../../src/features/dashboard/ui/HighContrastKpiCards';
import { WeeklyComparisonSection } from '../../src/features/dashboard/ui/WeeklyComparisonSection';
import { DailyTrendSplineCard } from '../../src/features/dashboard/ui/DailyTrendSplineCard';
import { ChannelMixDonutCard } from '../../src/features/dashboard/ui/ChannelMixDonutCard';
import { DarkMissionCard } from '../../src/features/dashboard/ui/DarkMissionCard';

describe('High-Contrast Dashboard & KPI Cards Integration', () => {
  const mockDashboardData = {
    leads: {
      val: '142',
      change: '+14.6%',
      subtext: 'vs. mes anterior',
      sparkline: [{ y: 10 }, { y: 20 }, { y: 15 }],
    },
    conversion: {
      val: '38.0',
      numeric: 38.0,
      change: '+4.2%',
      subtext: '54 citas / apartados',
    },
    latency: {
      val: '380',
      change: '-65ms',
      subtext: 'Inferencia Concierge IA',
    },
    handoff: {
      val: '27.4',
      numeric: 27.4,
      change: '-2.1%',
      subtext: '39 transferidos a asesor',
    },
  };

  it('renders alternating dark theme and crisp white KPI cards with correct metrics', () => {
    render(<HighContrastKpiCards dashboardData={mockDashboardData} isAsesor={false} />);

    // Dark card 1: Total Leads
    expect(screen.getByText(/TOTAL PROSPECTOS ATENDIDOS/i)).toBeInTheDocument();
    expect(screen.getByText('142')).toBeInTheDocument();
    expect(screen.getByText('+14.6%')).toBeInTheDocument();

    // White card 2: Confirmed Appointments & Conversion
    expect(screen.getByText(/TASA DE CONVERSIÓN/i)).toBeInTheDocument();
    expect(screen.getByText('38.0%')).toBeInTheDocument();
    expect(screen.getByText('54 citas / apartados')).toBeInTheDocument();

    // Dark card 3: Inferencia IA
    expect(screen.getByText(/LATENCIA CONCIERGE IA/i)).toBeInTheDocument();
    expect(screen.getByText('380')).toBeInTheDocument();

    // White card 4: Derivación a asesor
    expect(screen.getByText(/DERIVACIÓN A ASESOR/i)).toBeInTheDocument();
    expect(screen.getByText('27.4%')).toBeInTheDocument();
  });

  it('renders WeeklyComparisonSection with performance dual-bar chart and dark weekly total card', () => {
    render(<WeeklyComparisonSection isAsesor={false} />);

    expect(screen.getByText(/PERFORMANCE SEMANAL/i)).toBeInTheDocument();
    expect(screen.getByText(/Comparativa\./i)).toBeInTheDocument();
    expect(screen.getByText(/TOTAL SEMANAL/i)).toBeInTheDocument();
    expect(screen.getByText(/Ritmo Actual\./i)).toBeInTheDocument();
  });

  it('renders DailyTrendSplineCard with mini stats and spline chart', () => {
    render(<DailyTrendSplineCard isAsesor={false} />);

    expect(screen.getByText(/TENDENCIA DE INGRESOS DIARIOS/i)).toBeInTheDocument();
    expect(screen.getByText(/Septiembre 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/INGRESO MENSUAL/i)).toBeInTheDocument();
    expect(screen.getByText(/PROMEDIO POR DÍA ACTIVO/i)).toBeInTheDocument();
    expect(screen.getByText(/DÍA MÁS ALTO/i)).toBeInTheDocument();
  });

  it('renders ChannelMixDonutCard and DarkMissionCard', () => {
    render(
      <div>
        <ChannelMixDonutCard isAsesor={false} />
        <DarkMissionCard isAsesor={false} />
      </div>
    );

    expect(screen.getByText(/Mix Ingresos\./i)).toBeInTheDocument();
    expect(screen.getByText(/MISIÓN/i)).toBeInTheDocument();
    expect(screen.getByText(/Tu arte es/i)).toBeInTheDocument();
    expect(screen.getByText(/HITO DEL MES/i)).toBeInTheDocument();
  });
});
