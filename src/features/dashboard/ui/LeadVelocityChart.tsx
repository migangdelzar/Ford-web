import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Bot, UserCheck, Sparkles } from 'lucide-react';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';

export const LeadVelocityChart: React.FC = () => {
  const { t } = useTranslation();
  const [activeMetric, setActiveMetric] = useState<'total' | 'ai' | 'human'>('total');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const timeLabels = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  const chartData = [
    { label: '08:00', total: 12, ai: 10, human: 2 },
    { label: '10:00', total: 28, ai: 22, human: 6 },
    { label: '12:00', total: 45, ai: 35, human: 10 },
    { label: '14:00', total: 38, ai: 29, human: 9 },
    { label: '16:00', total: 62, ai: 48, human: 14 },
    { label: '18:00', total: 54, ai: 41, human: 13 },
    { label: '20:00', total: 32, ai: 26, human: 6 },
  ];

  const maxVal = 70;
  const svgWidth = 500;
  const svgHeight = 160;

  // Generate smooth SVG polyline & area path coordinates
  const getPoints = (key: 'total' | 'ai' | 'human') => {
    return chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * svgWidth;
      const y = svgHeight - (d[key] / maxVal) * (svgHeight - 20) - 10;
      return { x, y, val: d[key], label: d.label };
    });
  };

  const pointsTotal = getPoints('total');
  const pointsAi = getPoints('ai');
  const pointsHuman = getPoints('human');

  const makePath = (pts: { x: number; y: number }[]) =>
    pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`), '');

  const makeAreaPath = (pts: { x: number; y: number }[]) => {
    const line = makePath(pts);
    const firstX = pts[0].x;
    const lastX = pts[pts.length - 1].x;
    return `${line} L ${lastX},${svgHeight} L ${firstX},${svgHeight} Z`;
  };

  const activePoints =
    activeMetric === 'ai' ? pointsAi : activeMetric === 'human' ? pointsHuman : pointsTotal;

  return (
    <Card variant="default" padding="md" className="space-y-4 bg-white shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900">
              Velocidad de Ingesta & Derivación de Leads
            </h3>
            <Badge variant="primary" size="xs">
              En Vivo
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Ingreso por hora, resolución Concierge IA y handoff a asesores
          </p>
        </div>

        {/* Filter Toggle Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveMetric('total')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeMetric === 'total'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Total Leads
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('ai')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeMetric === 'ai'
                ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Concierge IA
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('human')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeMetric === 'human'
                ? 'bg-white text-amber-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Asesores
          </button>
        </div>
      </div>

      {/* Main SVG Area Chart */}
      <div className="relative pt-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 overflow-visible select-none"
        >
          <defs>
            {/* Gradient Fills for Area Shading */}
            <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16A34A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#16A34A" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="humanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 20, 40, 60].map((level) => {
            const y = svgHeight - (level / maxVal) * (svgHeight - 20) - 10;
            return (
              <line
                key={level}
                x1="0"
                y1={y}
                x2={svgWidth}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Render Area Paths */}
          {activeMetric === 'total' && (
            <path d={makeAreaPath(pointsTotal)} fill="url(#totalGrad)" />
          )}
          {activeMetric === 'ai' && (
            <path d={makeAreaPath(pointsAi)} fill="url(#aiGrad)" />
          )}
          {activeMetric === 'human' && (
            <path d={makeAreaPath(pointsHuman)} fill="url(#humanGrad)" />
          )}

          {/* Render Polyline Curves */}
          <path
            d={makePath(pointsTotal)}
            fill="none"
            stroke="#2563EB"
            strokeWidth={activeMetric === 'total' ? 3 : 1.5}
            strokeOpacity={activeMetric === 'total' ? 1 : 0.3}
          />
          <path
            d={makePath(pointsAi)}
            fill="none"
            stroke="#16A34A"
            strokeWidth={activeMetric === 'ai' ? 3 : 1.5}
            strokeOpacity={activeMetric === 'ai' ? 1 : 0.3}
          />
          <path
            d={makePath(pointsHuman)}
            fill="none"
            stroke="#D97706"
            strokeWidth={activeMetric === 'human' ? 3 : 1.5}
            strokeOpacity={activeMetric === 'human' ? 1 : 0.3}
          />

          {/* Interactive Hover Data Dots */}
          {activePoints.map((p, idx) => (
            <g key={idx} className="cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === idx ? 6 : 4}
                className={`transition-all ${
                  activeMetric === 'ai'
                    ? 'fill-emerald-600 stroke-white'
                    : activeMetric === 'human'
                    ? 'fill-amber-600 stroke-white'
                    : 'fill-blue-600 stroke-white'
                }`}
                strokeWidth="2"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              {hoveredIndex === idx && (
                <g>
                  <rect
                    x={p.x - 28}
                    y={p.y - 28}
                    width="56"
                    height="20"
                    rx="6"
                    className="fill-slate-900"
                  />
                  <text
                    x={p.x}
                    y={p.y - 15}
                    textAnchor="middle"
                    className="fill-white font-mono text-[10px] font-bold"
                  >
                    {p.val} leads
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>

        {/* X-Axis Time Labels */}
        <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
          {timeLabels.map((lbl) => (
            <span key={lbl}>{lbl}</span>
          ))}
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Peak Ingesta</span>
            <span className="font-mono font-bold text-slate-800">62 leads/h</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Resuelto IA</span>
            <span className="font-mono font-bold text-emerald-700">77% Tasa</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Handoff Asesor</span>
            <span className="font-mono font-bold text-amber-700">23% Derivado</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
