/**
 * Ford CRM Concierge - Role-Based (RBAC) & Attribute-Based Access Control (ABAC) System
 * Authoritative Base Conditions, Role Matrix, and Dynamic Lead Attribution Engine
 */

import { Conversation } from '../../types';

export type UserRole = 'propietario' | 'gerente' | 'asesor';

export interface DealershipAdvisor {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarUrl?: string;
  status: 'available' | 'in_meeting' | 'away';
  isBot?: boolean;
}

export const DEALERSHIP_TEAM: DealershipAdvisor[] = [
  {
    id: 'adv-01',
    name: 'Miky Delzar',
    role: 'Propietario / Dir. General',
    email: 'miky.delzar@fordmexico.com.mx',
    status: 'available',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'adv-02',
    name: 'Lic. Sofía Alarcón',
    role: 'Gerente Comercial',
    email: 'sofia.gerente@fordmexico.com.mx',
    status: 'available',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'adv-03',
    name: 'Carlos Mendoza',
    role: 'Asesor Senior Ventas',
    email: 'carlos.mendoza@fordmexico.com.mx',
    status: 'available',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'adv-04',
    name: 'Sofía Navarro',
    role: 'Asesora Digital CRM',
    email: 'sofia.navarro@fordmexico.com.mx',
    status: 'available',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'adv-bot',
    name: 'Concierge Ford IA',
    role: 'Asistente Autónomo',
    email: 'concierge.bot@fordmexico.com.mx',
    status: 'available',
    isBot: true,
  },
];

export interface RoleAuthorityConfig {
  role: UserRole;
  title: string;
  badgeLabel: string;
  tierDescription: string;
  color: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    ring: string;
  };
}

export const ROLE_AUTHORITIES: Record<UserRole, RoleAuthorityConfig> = {
  propietario: {
    role: 'propietario',
    title: 'Propietario / Administrador General',
    badgeLabel: 'Propietario',
    tierDescription: 'Acceso total ejecutivo, telemetría IA profunda, métricas financieras y control de reglas.',
    color: {
      bg: 'bg-indigo-50/80',
      border: 'border-indigo-200',
      text: 'text-indigo-900',
      badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      badgeText: 'text-indigo-700',
      ring: 'ring-indigo-500/20',
    },
  },
  gerente: {
    role: 'gerente',
    title: 'Gerente / Supervisor Comercial',
    badgeLabel: 'Gerente',
    tierDescription: 'Supervisión de equipo, reasignación de prospectos y métricas de desempeño de ventas.',
    color: {
      bg: 'bg-blue-50/80',
      border: 'border-blue-200',
      text: 'text-blue-900',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
      badgeText: 'text-blue-700',
      ring: 'ring-blue-500/20',
    },
  },
  asesor: {
    role: 'asesor',
    title: 'Asesor Comercial de Ventas',
    badgeLabel: 'Asesor',
    tierDescription: 'Atención personalizada de prospectos asignados, registro comercial y citas de manejo.',
    color: {
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeText: 'text-emerald-700',
      ring: 'ring-emerald-500/20',
    },
  },
};

/**
 * AUTHORITATIVE BASE CONDITIONS & ATTRIBUTE-BASED ACCESS CONTROL (ABAC)
 */
export const Authority = {
  // 1. Role-Based Permissions (RBAC)
  canReassignLead: (role: UserRole): boolean => role === 'propietario' || role === 'gerente',
  
  canTakeAnyChat: (role: UserRole): boolean => role === 'propietario' || role === 'gerente',

  canModifyProspectFile: (_role: UserRole): boolean => true,

  canViewDeepAiTelemetry: (role: UserRole): boolean => role === 'propietario',

  canViewExecutiveFinancials: (role: UserRole): boolean => role === 'propietario',

  canViewDealershipValuation: (role: UserRole): boolean => role === 'propietario' || role === 'gerente',

  canForceBotState: (role: UserRole): boolean => role === 'propietario' || role === 'gerente',

  canViewDealershipGlobalMetrics: (role: UserRole): boolean => role === 'propietario' || role === 'gerente',

  canViewTeamLeaderboard: (role: UserRole): boolean => role === 'propietario' || role === 'gerente',

  canExportGlobalReports: (role: UserRole): boolean => role === 'propietario' || role === 'gerente',

  canConfigureBotPrompt: (role: UserRole): boolean => role === 'propietario',

  canConfigureHandoffRules: (role: UserRole): boolean => role === 'propietario',

  canAccessDiagnosticLab: (role: UserRole): boolean => role === 'propietario',

  canViewSystemAuditLog: (role: UserRole): boolean => role === 'propietario',

  canResetSimulator: (role: UserRole): boolean => role === 'propietario',

  // 2. Attribute-Based Access Control (ABAC)
  /**
   * Evaluates if a user can take over a conversation based on both role and lead attributes:
   * - Propietario / Gerente: Always authorized (Supervisory override).
   * - Asesor: Authorized if assigned to them, unassigned, or handled by Bot.
   */
  canTakeoverLeadABAC: (role: UserRole, conversation?: Conversation, advisorId?: string): boolean => {
    if (!conversation) return false;
    if (role === 'propietario' || role === 'gerente') return true;
    if (conversation.assignedTo === advisorId || !conversation.assignedTo || conversation.status === 'bot') {
      return true;
    }
    return false;
  },

  /**
   * Evaluates if a user can edit specific commercial parameters based on lead attributes:
   * - Propietario / Gerente: Always authorized.
   * - Asesor: Authorized for leads in their active pipeline.
   */
  canEditLeadAttributesABAC: (role: UserRole, conversation?: Conversation, advisorId?: string): boolean => {
    if (!conversation) return false;
    if (role === 'propietario' || role === 'gerente') return true;
    return conversation.assignedTo === advisorId;
  },

  /**
   * Resolves full lead attribution and authorship metadata for UI badges
   */
  getLeadAttribution: (conversation: Conversation) => {
    const assignedAdvisor = DEALERSHIP_TEAM.find((a) => a.id === conversation.assignedTo) || DEALERSHIP_TEAM[0];
    const isBotHandled = conversation.status === 'bot';
    const isHotLead = conversation.leadTemperature === 'hot';
    const isHumanQualified = conversation.temperatureSource === 'human';

    return {
      assignedAdvisor,
      activeHandler: isBotHandled ? 'Concierge Ford IA' : assignedAdvisor.name,
      handlerRole: isBotHandled ? 'Inteligencia Artificial' : assignedAdvisor.role,
      qualificationSource: isHumanQualified ? 'Calificación Humana Manual' : 'Calificado Automáticamente por IA',
      statusLabel: isBotHandled ? 'Asistente IA Activo' : `Atendido por ${assignedAdvisor.name}`,
      priorityScore: isHotLead ? 'Alta Prioridad Comercial' : 'Atención Estándar',
      attributionBadge: isBotHandled
        ? { text: 'Concierge IA', bg: 'bg-purple-100 text-purple-800 border-purple-300' }
        : { text: assignedAdvisor.name, bg: 'bg-blue-100 text-blue-800 border-blue-300' },
    };
  },
};

/**
 * Estimate vehicle price and dealership projected margin (Executive Propietario view)
 */
export const getVehicleValuationEstimate = (interest?: string) => {
  const norm = (interest || '').toLowerCase();
  
  if (norm.includes('mustang') || norm.includes('dark horse') || norm.includes('gt')) {
    return {
      price: '$1,390,000 MXN',
      priceRaw: 1390000,
      margin: '$145,000 MXN',
      marginPct: '10.4%',
      tier: 'High Margin Performance',
    };
  }
  if (norm.includes('bronco') || norm.includes('badlands') || norm.includes('raptor')) {
    return {
      price: '$1,150,000 MXN',
      priceRaw: 1150000,
      margin: '$125,000 MXN',
      marginPct: '10.8%',
      tier: 'High Demand SUV',
    };
  }
  if (norm.includes('explorer') || norm.includes('st') || norm.includes('platinum')) {
    return {
      price: '$1,280,000 MXN',
      priceRaw: 1280000,
      margin: '$130,000 MXN',
      marginPct: '10.1%',
      tier: 'Family Luxury SUV',
    };
  }
  if (norm.includes('territory') || norm.includes('titanium')) {
    return {
      price: '$680,000 MXN',
      priceRaw: 680000,
      margin: '$65,000 MXN',
      marginPct: '9.5%',
      tier: 'Volume Fast Mover',
    };
  }
  if (norm.includes('ranger') || norm.includes('f-150') || norm.includes('wildtrak')) {
    return {
      price: '$890,000 MXN',
      priceRaw: 890000,
      margin: '$92,000 MXN',
      marginPct: '10.3%',
      tier: 'Commercial & Pickup',
    };
  }
  if (norm.includes('mach-e')) {
    return {
      price: '$1,420,000 MXN',
      priceRaw: 1420000,
      margin: '$150,000 MXN',
      marginPct: '10.5%',
      tier: 'EV Flagship',
    };
  }

  // Default valuation
  return {
    price: '$720,000 MXN',
    priceRaw: 720000,
    margin: '$75,000 MXN',
    marginPct: '10.4%',
    tier: 'Inventario Seminuevo / Nuevo',
  };
};
