// src/features/onboarding-circle/components/progress-ring.tsx

import { m } from 'framer-motion';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { SOURCES, type SourceId } from '../const/sources';

const CX = 130;
const CY = 130;
const R = 105;
const GAP_DEG = 8;
const ARC_SPAN = (360 - GAP_DEG * 4) / 4;
const STROKE_WIDTH = 18;

function polarToCart(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CX + R * Math.cos(rad), CY + R * Math.sin(rad)] as const;
}

function arcPath(startAngle: number, endAngle: number) {
  const [x1, y1] = polarToCart(startAngle);
  const [x2, y2] = polarToCart(endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
}

function midPoint(startAngle: number, endAngle: number) {
  const mid = (startAngle + endAngle) / 2;
  const rad = ((mid - 90) * Math.PI) / 180;
  return [CX + (R + 28) * Math.cos(rad), CY + (R + 28) * Math.sin(rad)] as const;
}

function arcLength(startAngle: number, endAngle: number) {
  return ((endAngle - startAngle) / 360) * 2 * Math.PI * R;
}

interface ArcDef {
  id: SourceId;
  start: number;
  end: number;
}

const ARCS: ArcDef[] = SOURCES.map((_, i) => ({
  id: SOURCES[i].id,
  start: GAP_DEG / 2 + i * (ARC_SPAN + GAP_DEG),
  end: GAP_DEG / 2 + ARC_SPAN + i * (ARC_SPAN + GAP_DEG),
}));

interface ProgressRingProps {
  completedSources: Set<SourceId>;
  completedCount: number;
  onArcClick: (source: SourceId) => void;
}

export function ProgressRing({ completedSources, completedCount, onArcClick }: ProgressRingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative mx-auto h-[260px] w-[260px]">
      <svg viewBox="0 0 260 260" className="size-full">
        <defs>
          {SOURCES.map((s) => (
            <linearGradient key={`g-${s.id}`} id={`g-${s.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={s.colorFrom} />
              <stop offset="100%" stopColor={s.colorTo} />
            </linearGradient>
          ))}
          {SOURCES.map((s) => (
            <filter key={`glow-${s.id}`} id={`glow-${s.id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor={s.colorFrom} floodOpacity="0.3" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="shadow" />
              <feMerge>
                <feMergeNode in="shadow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Track arcs */}
        {ARCS.map((arc) => (
          <path
            key={`track-${arc.id}`}
            d={arcPath(arc.start, arc.end)}
            fill="none"
            stroke="#f0eeeb"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
          />
        ))}

        {/* Fill arcs */}
        {ARCS.map((arc, i) => {
          const done = completedSources.has(arc.id);
          const len = arcLength(arc.start, arc.end);
          return (
            <path
              key={`fill-${arc.id}`}
              d={arcPath(arc.start, arc.end)}
              fill="none"
              stroke={`url(#g-${arc.id})`}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              filter={done ? `url(#glow-${arc.id})` : undefined}
              opacity={done ? 1 : 0.18}
              strokeDasharray={len}
              strokeDashoffset={mounted ? 0 : len}
              className={cn(
                'cursor-pointer transition-all duration-300',
                done ? 'hover:brightness-110' : 'hover:opacity-55',
              )}
              style={{
                transition: `stroke-dashoffset ${600 + i * 150}ms cubic-bezier(0.4, 0, 0.2, 1), opacity 500ms ease, filter 300ms ease`,
                ...(done ? { opacity: 1 } : {}),
              }}
              onClick={() => onArcClick(arc.id)}
            />
          );
        })}

        {/* Icon circles at midpoints */}
        {ARCS.map((arc) => {
          const [mx, my] = midPoint(arc.start, arc.end);
          const source = SOURCES.find((s) => s.id === arc.id)!;
          return (
            <g key={`icon-${arc.id}`} className="cursor-pointer" onClick={() => onArcClick(arc.id)}>
              <circle
                cx={mx}
                cy={my}
                r={15}
                fill={source.colorFrom}
                fillOpacity={completedSources.has(arc.id) ? 0.15 : 0.08}
                className="transition-all duration-250"
              />
              <text
                x={mx}
                y={my}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="14"
                className="pointer-events-none"
              >
                {source.icon}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Center content */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 w-[140px] -translate-x-1/2 -translate-y-1/2 text-center"
        style={{
          background: `radial-gradient(circle, rgba(252,95,43,${completedCount * 0.03}) 0%, transparent 70%)`,
          transition: 'background 0.6s ease',
        }}
      >
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="font-sans text-5xl font-light italic leading-none tracking-tight text-zinc-900">
            5
          </div>
          <div className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-zinc-400">
            days left
          </div>
        </m.div>
        <div className="mt-3 flex justify-center gap-[5px]">
          {[0, 1, 2, 3].map((i) => (
            <m.div
              key={i}
              className="size-1.5 rounded-full"
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                backgroundColor: i < completedCount ? '#FC5F2B' : '#e0ded9',
              }}
              transition={{
                delay: 0.5 + i * 0.1,
                type: 'spring',
                stiffness: 400,
                damping: 15,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
