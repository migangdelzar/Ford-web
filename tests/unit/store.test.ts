import { describe, it, expect } from 'vitest';
import { Authority, getVehicleValuationEstimate } from '../../src/shared/lib/authority';

describe('RBAC & Authority — Role Restrictions', () => {
  it('denies asesor access to agency financial margins and bot prompt rules', () => {
    expect(Authority.canViewExecutiveFinancials('asesor')).toBe(false);
    expect(Authority.canConfigureBotPrompt('asesor')).toBe(false);
    expect(Authority.canForceBotState('asesor')).toBe(false);
    expect(Authority.canReassignLead('asesor')).toBe(false);
    expect(Authority.canViewDeepAiTelemetry('asesor')).toBe(false);
  });

  it('allows gerente supervisory capabilities without executive financial/prompt modification', () => {
    expect(Authority.canReassignLead('gerente')).toBe(true);
    expect(Authority.canForceBotState('gerente')).toBe(true);
    expect(Authority.canViewDealershipValuation('gerente')).toBe(true);
    expect(Authority.canViewExecutiveFinancials('gerente')).toBe(false);
    expect(Authority.canConfigureBotPrompt('gerente')).toBe(false);
  });

  it('allows propietario complete root and financial access', () => {
    expect(Authority.canViewExecutiveFinancials('propietario')).toBe(true);
    expect(Authority.canConfigureBotPrompt('propietario')).toBe(true);
    expect(Authority.canForceBotState('propietario')).toBe(true);
    expect(Authority.canReassignLead('propietario')).toBe(true);
    expect(Authority.canViewDeepAiTelemetry('propietario')).toBe(true);
    expect(Authority.canAccessDiagnosticLab('propietario')).toBe(true);
    expect(Authority.canViewSystemAuditLog('propietario')).toBe(true);
  });
});

describe('ABAC — Attribute Based Access Control', () => {
  it('allows asesor to takeover unassigned or bot-handled leads', () => {
    const mockConv = {
      id: 'conv-1',
      status: 'bot' as const,
      assignedTo: undefined,
    } as any;
    expect(Authority.canTakeoverLeadABAC('asesor', mockConv, 'adv-03')).toBe(true);
  });

  it('allows asesor to takeover leads assigned directly to them', () => {
    const mockConv = {
      id: 'conv-2',
      status: 'human' as const,
      assignedTo: 'adv-03',
    } as any;
    expect(Authority.canTakeoverLeadABAC('asesor', mockConv, 'adv-03')).toBe(true);
  });

  it('denies asesor takeover for leads assigned to another advisor and already in human status', () => {
    const mockConv = {
      id: 'conv-3',
      status: 'human' as const,
      assignedTo: 'adv-04',
    } as any;
    expect(Authority.canTakeoverLeadABAC('asesor', mockConv, 'adv-03')).toBe(false);
  });
});

describe('Vehicle Valuation and Margin Engine', () => {
  it('correctly calculates vehicle margins for Mustang', () => {
    const valuation = getVehicleValuationEstimate('Ford Mustang GT');
    expect(valuation.price).toContain('1,390,000');
    expect(valuation.margin).toContain('145,000');
    expect(valuation.tier).toBe('High Margin Performance');
  });

  it('correctly calculates vehicle margins for Bronco', () => {
    const valuation = getVehicleValuationEstimate('Ford Bronco Badlands');
    expect(valuation.price).toContain('1,150,000');
    expect(valuation.margin).toContain('125,000');
  });
});
