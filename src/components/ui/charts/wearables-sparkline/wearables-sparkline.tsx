import { format } from 'date-fns';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Skeleton } from '@/components/ui/skeleton';
import { WearableMetric } from '@/features/wearables/const/wearable-metrics';
import { useIsMobile } from '@/hooks/use-mobile';

import { ChartTooltip } from '../chart-tooltip';

import { useWearablesSparkline } from './use-wearables-sparkline';

const SVG_HEIGHT = 64;
const SVG_WIDTH_MOBILE = 125;
const SVG_WIDTH_DESKTOP = 150;

export const WearablesSparkline = memo(function WearablesSparkline({
  items,
  metric,
  isLoading,
}: {
  items: Record<string, any>[];
  metric: WearableMetric;
  isLoading?: boolean;
}) {
  const isMobile = useIsMobile();
  const svgWidth = isMobile ? SVG_WIDTH_MOBILE : SVG_WIDTH_DESKTOP;
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastPointRef = useRef<string | null>(null);

  const { path, hasData, points, baselineY } = useWearablesSparkline({
    items,
    metric,
    svgWidth,
  });

  const [hovered, setHovered] = useState<{
    x: number;
    y: number;
    index: number;
    value: number;
    timestamp: string;
    position: { x: number; y: number };
  } | null>(null);

  const handleInteraction = useCallback(
    (clientX: number) => {
      if (!svgRef.current || points.length === 0) return;

      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const relX = clientX - rect.left;

        let nearest = points[0];
        let nearestIdx = 0;
        let minDist = Math.abs(nearest.x - relX);
        for (let i = 1; i < points.length; i++) {
          const d = Math.abs(points[i].x - relX);
          if (d < minDist) {
            minDist = d;
            nearest = points[i];
            nearestIdx = i;
          }
        }

        if (lastPointRef.current === nearest.timestamp) return;
        lastPointRef.current = nearest.timestamp;

        setHovered({
          x: nearest.x,
          y: nearest.y,
          index: nearestIdx,
          value: nearest.value,
          timestamp: nearest.timestamp,
          position: {
            x: rect.left + nearest.x + window.scrollX,
            y: rect.top + nearest.y - 32 + window.scrollY,
          },
        });
      });
    },
    [points],
  );

  const clearHover = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastPointRef.current = null;
    setHovered(null);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (isLoading) {
    return <Skeleton className="h-16 w-[150px] bg-zinc-100" />;
  }

  if (!hasData) {
    return <div className="h-16" />;
  }

  return (
    <div
      style={{
        maskImage: 'linear-gradient(to right, transparent 20%, black 35%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 20%, black 35%)',
      }}
      className="relative flex items-center justify-end gap-2 overflow-visible"
    >
      <svg
        ref={svgRef}
        width={svgWidth}
        height={SVG_HEIGHT}
        className="touch-manipulation overflow-visible"
        onMouseMove={(e) => handleInteraction(e.clientX)}
        onMouseLeave={clearHover}
        onTouchStart={(e) => {
          if (e.touches.length === 1) handleInteraction(e.touches[0].clientX);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          if (e.touches.length === 1) handleInteraction(e.touches[0].clientX);
        }}
        onTouchEnd={clearHover}
      >
        {/* Hit area */}
        <rect
          x={0}
          y={0}
          width={svgWidth}
          height={SVG_HEIGHT}
          fill="transparent"
        />

        {/* Baseline line (behind data) */}
        {baselineY != null && (
          <line
            x1={0}
            y1={baselineY}
            x2={svgWidth}
            y2={baselineY}
            stroke="#10b981"
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}

        {/* Data path — white outline then grey line */}
        <path
          d={path}
          fill="none"
          stroke="white"
          strokeWidth={4}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={path}
          fill="none"
          stroke="#a1a1aa"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data point circles */}
        {points.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={points.length === 1 ? 6 : 5}
            fill="#a1a1aa"
            stroke="white"
            strokeWidth={3}
          />
        ))}

        {/* Hover circle outline — matches main sparkline */}
        {hovered && (
          <circle
            cx={hovered.x}
            cy={hovered.y}
            r={7}
            fill="none"
            stroke="#a1a1aa"
            strokeWidth={4}
            strokeOpacity={0.4}
          />
        )}
      </svg>

      {/* Baseline indicator bar — grey segments with green dot at baseline */}
      {baselineY != null && (
        <svg
          width={7}
          height={SVG_HEIGHT}
          className="shrink-0 overflow-visible"
        >
          {/* Upper grey segment */}
          {baselineY - 5 > 4 && (
            <rect
              x={2}
              y={4}
              width={3}
              height={baselineY - 5 - 4}
              fill="#d4d4d8"
              rx={1.5}
            />
          )}
          {/* Baseline marker */}
          <rect
            x={2}
            y={baselineY - 4}
            width={3}
            height={8}
            fill="#10b981"
            rx={1.5}
          />
          {/* Lower grey segment */}
          {baselineY + 5 < SVG_HEIGHT - 4 && (
            <rect
              x={2}
              y={baselineY + 5}
              width={3}
              height={SVG_HEIGHT - 4 - (baselineY + 5)}
              fill="#d4d4d8"
              rx={1.5}
            />
          )}
        </svg>
      )}

      {hovered &&
        createPortal(
          <ChartTooltip isOpen={true} position={hovered.position} side="top">
            <div className="text-xs">
              <div className="font-semibold">
                {metric.format(hovered.value)} {metric.unit}
              </div>
              <div className="text-muted-foreground">
                {format(new Date(hovered.timestamp), 'MMM dd, yyyy')}
              </div>
            </div>
          </ChartTooltip>,
          document.body,
        )}
    </div>
  );
});
