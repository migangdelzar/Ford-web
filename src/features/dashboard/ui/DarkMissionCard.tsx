import React from 'react';
import { Sparkles, Target } from 'lucide-react';

export interface DarkMissionCardProps {
  currentGoal?: number;
  targetGoal?: number;
  unit?: string;
  isAsesor?: boolean;
}

export const DarkMissionCard: React.FC<DarkMissionCardProps> = ({
  currentGoal = 1240,
  targetGoal = 25000,
  isAsesor = false,
}) => {
  const percentage = Math.min(100, Math.round((currentGoal / targetGoal) * 100));

  return (
    <div className="flex flex-col gap-6 justify-between">
      {/* HIGH CONTRAST DARK THEME MISSION CARD (Matching Screenshot 2) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B132B] via-slate-900 to-[#0F172A] text-white p-6 shadow-xl border border-slate-800/80 flex-1 flex flex-col justify-between">
        {/* Ambient subtle glow background */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/25 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>

            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest font-mono bg-slate-800/90 text-slate-300 border border-slate-700/80 uppercase">
              MISIÓN
            </span>
          </div>

          {/* Inspirational Quote Typography */}
          <div className="mt-8">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug text-white">
              &ldquo;Tu arte es{' '}
              <span className="text-blue-400 underline decoration-blue-400/40 decoration-wavy underline-offset-4">
                único
              </span>
              . Tu gestión debe estar a la altura.&rdquo;
            </h3>
          </div>
        </div>

        {/* Philosophy Line Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          <span className="w-6 h-px bg-slate-700" />
          <span>{isAsesor ? 'FILOSOFÍA ASESOR FORD' : 'FILOSOFÍA CONCIERGE FORD'}</span>
        </div>
      </div>

      {/* WHITE MILESTONE GOAL CARD (Matching Screenshot 2) */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-card flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                HITO DEL MES
              </span>
              <h4 className="text-lg font-extrabold text-[#0F172A] tracking-tight mt-0.5">
                Objetivo.
              </h4>
            </div>

            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>

          {/* Value Progress */}
          <div className="mt-6 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                ${currentGoal >= 1000 ? `${(currentGoal / 1000).toFixed(1)}k` : `$${currentGoal}`}
              </span>
              <span className="text-xs text-slate-400 font-sans">
                de ${targetGoal >= 1000 ? `${(targetGoal / 1000).toFixed(0)}k` : `$${targetGoal}`}
              </span>
            </div>

            <span className="text-xs font-bold font-mono text-blue-600">
              {percentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.max(percentage, 5)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
