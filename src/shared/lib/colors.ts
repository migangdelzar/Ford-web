/**
 * Ford CRM Design Tokens & Color Architecture
 * 60-30-10 Luxury Automotive Palette & Semantic Tiers
 */

export const COLOR_TIERS = {
  // 1. Structural Canvas Tiers (60%)
  canvas: {
    base: 'bg-white',
    subtle: 'bg-slate-50/60',
    muted: 'bg-slate-100/70',
    elevated: 'bg-white shadow-xs',
    frosted: 'bg-white/85 backdrop-blur-xl',
  },

  // 2. Structural & Typography Surfaces (30%)
  surface: {
    primaryText: 'text-slate-900',
    secondaryText: 'text-slate-600',
    tertiaryText: 'text-slate-400',
    hairline: 'border-slate-200/80',
    hairlineDark: 'border-slate-300',
    hairlineSubtle: 'border-slate-100',
  },

  // 3. Action Tiers (Primary, Secondary, Tertiary)
  actions: {
    primary: {
      bg: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
      text: 'text-white',
      border: 'border-blue-700/20',
      shadow: 'shadow-xs hover:shadow-blue-500/10',
    },
    secondary: {
      bg: 'bg-slate-900 hover:bg-black active:bg-slate-950',
      text: 'text-white',
      border: 'border-slate-800',
      shadow: 'shadow-xs hover:shadow-slate-900/10',
    },
    tertiary: {
      bg: 'bg-slate-100 hover:bg-slate-200/70 active:bg-slate-200',
      text: 'text-slate-700 hover:text-slate-900',
      border: 'border-slate-200/70',
      shadow: 'shadow-2xs',
    },
    subtlePrimary: {
      bg: 'bg-blue-50 hover:bg-blue-100/80 active:bg-blue-200/70',
      text: 'text-blue-700 font-semibold',
      border: 'border-blue-200/70',
    },
  },

  // 4. Semantic Support Tiers (Strict 10% Accent Purpose)
  semantic: {
    success: {
      base: 'text-emerald-700',
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200/80',
      solid: 'bg-emerald-600 text-white',
      dot: 'bg-emerald-500',
      glow: 'shadow-emerald-500/15',
    },
    warning: {
      base: 'text-amber-800',
      bg: 'bg-amber-50/80',
      border: 'border-amber-200/80',
      solid: 'bg-amber-600 text-white',
      dot: 'bg-amber-500',
      glow: 'shadow-amber-500/15',
    },
    error: {
      base: 'text-rose-700',
      bg: 'bg-rose-50/80',
      border: 'border-rose-200/80',
      solid: 'bg-rose-600 text-white',
      dot: 'bg-rose-500',
      glow: 'shadow-rose-500/15',
    },
    info: {
      base: 'text-sky-700',
      bg: 'bg-sky-50/80',
      border: 'border-sky-200/80',
      solid: 'bg-sky-600 text-white',
      dot: 'bg-sky-500',
      glow: 'shadow-sky-500/15',
    },
    ai: {
      base: 'text-purple-700',
      bg: 'bg-purple-50/80',
      border: 'border-purple-200/80',
      solid: 'bg-purple-600 text-white',
      dot: 'bg-purple-500',
      glow: 'shadow-purple-500/15',
    },
  },
} as const;
