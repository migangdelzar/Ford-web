import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';

// ============================================================================
// ARCHETYPE A: The Dark Hero Metric (Maximum Contrast)
// Flagship metric card (e.g. Total Semanal, Pipeline Total, Valor Activo)
// ============================================================================

export interface DarkHeroMetricProps {
  eyebrow?: string;
  value: string | number;
  delta?: string;
  isPositive?: boolean;
  deltaContext?: React.ReactNode;
  icon?: LucideIcon;
  watermarkIcon?: LucideIcon;
  className?: string;
  onClick?: () => void;
  actionNode?: React.ReactNode;
}

export const DarkHeroMetric: React.FC<DarkHeroMetricProps> = ({
  eyebrow = "Total Semanal",
  value = "$48,200",
  delta = "+18%",
  isPositive = true,
  deltaContext,
  icon: Icon = TrendingUp,
  watermarkIcon: WatermarkIcon = TrendingUp,
  className,
  onClick,
  actionNode,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "bg-[#1D1D1F] p-5 sm:p-7 lg:p-8 rounded-[24px] sm:rounded-[32px] overflow-hidden relative group text-white border border-white/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.25)] select-none",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="relative z-10 flex flex-col justify-between h-full space-y-4 sm:space-y-6">
        {/* Top: Icon & Growth Pill */}
        <div className="flex items-center justify-between gap-3">
          <div className="size-10 sm:size-12 rounded-xl sm:rounded-2xl bg-white/[0.08] backdrop-blur-md flex items-center justify-center text-white border border-white/[0.08] shadow-inner transition-transform duration-300 group-hover:scale-105">
            <Icon className="size-5 sm:size-6" />
          </div>

          <div className="flex items-center gap-2">
            {actionNode}
            {delta && (
              <span
                className={cn(
                  "px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border transition-colors inline-flex items-center gap-1",
                  isPositive
                    ? "bg-[#34C759]/20 text-[#34C759] border-[#34C759]/30"
                    : "bg-[#FF453A]/20 text-[#FF453A] border-[#FF453A]/30"
                )}
              >
                {isPositive ? <ArrowUpRight className="size-3 stroke-[2.5]" /> : null}
                {delta}
              </span>
            )}
          </div>
        </div>

        {/* Bottom: 3-Tier Typographic Stack */}
        <div>
          <p className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/50">
            {eyebrow}
          </p>
          <h4 className="text-2xl sm:text-3xl lg:text-4xl font-display font-semibold tracking-tight text-white mt-0.5 sm:mt-1 tabular-nums">
            {value}
          </h4>
          {deltaContext ? (
            <p className="text-xs sm:text-sm font-medium text-white/60 mt-1 sm:mt-1.5 leading-relaxed">
              {deltaContext}
            </p>
          ) : (
            <p className="text-xs sm:text-sm font-medium text-white/60 mt-1 sm:mt-1.5 leading-relaxed">
              Crecimiento de <span className="text-white/90 font-semibold">{delta}</span> vs periodo anterior
            </p>
          )}
        </div>
      </div>

      {/* Watermark Graphic */}
      <div className="absolute -bottom-8 -right-8 opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-700 rotate-12 group-hover:scale-110 pointer-events-none">
        <WatermarkIcon className="size-44 sm:size-56 text-white" />
      </div>
    </motion.div>
  );
};

// ============================================================================
// ARCHETYPE B: The Squircle Widget Metric (Light Card)
// Standard 2-to-4 column stats grid metric
// ============================================================================

export interface SquircleWidgetMetricProps {
  eyebrow: string;
  value: string | number;
  unit?: string;
  contextText?: React.ReactNode;
  delta?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconTint?: 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'neutral';
  sparkline?: { y: number }[];
  className?: string;
  onClick?: () => void;
}

export const SquircleWidgetMetric: React.FC<SquircleWidgetMetricProps> = ({
  eyebrow,
  value,
  unit,
  contextText,
  delta,
  isPositive = true,
  icon: Icon,
  iconTint = 'blue',
  sparkline,
  className,
  onClick,
}) => {
  const getTintClasses = () => {
    switch (iconTint) {
      case 'green':
        return 'bg-[#34C759]/10 text-[#34C759] group-hover:bg-[#34C759]/15';
      case 'amber':
        return 'bg-[#FF9500]/10 text-[#FF9500] group-hover:bg-[#FF9500]/15';
      case 'purple':
        return 'bg-[#AF52DE]/10 text-[#AF52DE] group-hover:bg-[#AF52DE]/15';
      case 'red':
        return 'bg-[#FF3B30]/10 text-[#FF3B30] group-hover:bg-[#FF3B30]/15';
      case 'neutral':
        return 'bg-[#F5F5F7] text-[#1D1D1F] group-hover:bg-[#E5E5EA]';
      case 'blue':
      default:
        return 'bg-[#0071E3]/10 text-[#0071E3] group-hover:bg-[#0071E3]/15';
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group rounded-[20px] sm:rounded-[26px] bg-white border border-black/[0.04] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.03)] p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.06)] hover:border-black/[0.06]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Top Row: Tinted Squircle Icon & Delta Pill */}
      <div className="flex items-center justify-between gap-2">
        <div
          className={cn(
            "size-9 sm:size-10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105",
            getTintClasses()
          )}
        >
          <Icon className="size-4.5 sm:size-5" />
        </div>

        {delta && (
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider inline-flex items-center gap-0.5",
              isPositive
                ? "bg-[#34C759]/10 text-[#34C759]"
                : "bg-[#FF3B30]/10 text-[#FF3B30]"
            )}
          >
            {isPositive ? <ArrowUpRight className="size-2.5 stroke-[2.5]" /> : <TrendingDown className="size-2.5" />}
            {delta}
          </span>
        )}
      </div>

      {/* Middle & Bottom: 3-Tier Typographic Stack */}
      <div className="mt-3.5 space-y-0.5">
        <p className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#86868B]">
          {eyebrow}
        </p>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <h4 className="text-xl sm:text-2xl font-display font-semibold tracking-tight text-[#1D1D1F] tabular-nums">
            {value}
          </h4>
          {unit && (
            <span className="text-[11px] font-semibold text-[#86868B]">
              {unit}
            </span>
          )}
        </div>

        {contextText && (
          <p className="text-[11px] sm:text-xs font-medium text-[#86868B] leading-tight pt-0.5">
            {contextText}
          </p>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// ARCHETYPE C: The Goal Progress Metric (Interactive Gauge)
// Used for revenue targets, conversion targets, milestone gauges
// ============================================================================

export interface GoalProgressMetricProps {
  eyebrow?: string;
  percentage: number;
  targetFormatted?: string;
  currentFormatted?: string;
  growthLabel?: string;
  barGradientFrom?: string;
  barGradientTo?: string;
  className?: string;
}

export const GoalProgressMetric: React.FC<GoalProgressMetricProps> = ({
  eyebrow = "Progreso actual",
  percentage = 78,
  targetFormatted = "$25,000 MXN meta",
  currentFormatted,
  growthLabel,
  barGradientFrom = "#0071E3",
  barGradientTo = "#34C759",
  className,
}) => {
  const clampedPercent = Math.min(Math.max(percentage, 0), 100);

  return (
    <div
      className={cn(
        "rounded-[20px] sm:rounded-[26px] bg-white border border-black/[0.04] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.03)] p-4 sm:p-5 space-y-3",
        className
      )}
    >
      <div className="flex justify-between items-end gap-2 flex-wrap">
        <div>
          <p className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#86868B]">
            {eyebrow}
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <p className="text-2xl sm:text-3xl font-display font-semibold text-[#34C759] tabular-nums">
              {clampedPercent}%
            </p>
            {growthLabel && (
              <span className="text-[10.5px] font-bold text-[#34C759] bg-[#34C759]/10 px-2 py-0.5 rounded-full">
                {growthLabel}
              </span>
            )}
          </div>
          {currentFormatted && (
            <p className="text-[11px] sm:text-xs text-[#86868B] font-medium mt-0.5">
              {currentFormatted}
            </p>
          )}
        </div>

        <span className="text-[11px] sm:text-xs font-semibold text-[#1D1D1F] opacity-70">
          {targetFormatted}
        </span>
      </div>

      {/* Pill progress bar with dual gradient */}
      <div className="h-2.5 sm:h-3 w-full bg-[#F5F5F7] rounded-full overflow-hidden p-0.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedPercent}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(to right, ${barGradientFrom}, ${barGradientTo})`,
          }}
        />
      </div>
    </div>
  );
};
