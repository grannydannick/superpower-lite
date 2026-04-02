import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Skeleton } from '@/components/ui/skeleton';

import { ChartTooltip } from '../chart-tooltip';

import { CHART_CONFIG } from './config';
import {
  Interval,
  ChartDataPoint,
  useWearablesSeriesChart,
} from './use-wearables-series-chart';

function useContainerWidth(
  ref: React.RefObject<HTMLDivElement | null>,
  fallback: number,
) {
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    setWidth(el.clientWidth);

    return () => ro.disconnect();
  }, [ref]);

  return width;
}

export const WearablesSeriesChart = ({
  data,
  unit,
  formatValue,
  interval,
  baseline,
  baselineLabel,
  height = CHART_CONFIG.SVG_HEIGHT,
  isLoading,
  onPrevious,
  onNext,
  canGoBack,
  canGoForward,
}: {
  data: ChartDataPoint[];
  unit: string;
  formatValue: (v: number) => string;
  interval: Interval;
  baseline?: number;
  baselineLabel?: string;
  height?: number;
  isLoading?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastPointRef = useRef<string | null>(null);

  const svgWidth = useContainerWidth(containerRef, 600);

  const chart = useWearablesSeriesChart({
    data,
    unit,
    formatValue,
    interval,
    baseline,
    svgWidth,
    svgHeight: height,
  });

  const [hovered, setHovered] = useState<{
    x: number;
    y: number;
    value: number;
    timestamp: string;
    position: { x: number; y: number };
  } | null>(null);

  // Stable key for fade-in animation when data changes
  const dataKey = useMemo(() => {
    if (data.length === 0) return '';
    return `${data[0].timestamp}-${data[data.length - 1].timestamp}-${data.length}`;
  }, [data]);

  const handleInteraction = useCallback(
    (clientX: number) => {
      if (!svgRef.current || !chart.hasData || chart.points.length === 0)
        return;

      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const relX = clientX - rect.left;

        // Linear scan — reliable for all point counts in visible windows
        let nearest = chart.points[0];
        let minDist = Math.abs(nearest.x - relX);

        for (let i = 1; i < chart.points.length; i++) {
          const d = Math.abs(chart.points[i].x - relX);
          if (d < minDist) {
            minDist = d;
            nearest = chart.points[i];
          }
        }

        if (lastPointRef.current === nearest.timestamp) return;
        lastPointRef.current = nearest.timestamp;

        setHovered({
          x: nearest.x,
          y: nearest.y,
          value: nearest.value,
          timestamp: nearest.timestamp,
          position: {
            x: rect.left + nearest.x + window.scrollX,
            y: rect.top + nearest.y - 40 + window.scrollY,
          },
        });
      });
    },
    [chart],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => handleInteraction(e.clientX),
    [handleInteraction],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) handleInteraction(e.touches[0].clientX);
    },
    [handleInteraction],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1) handleInteraction(e.touches[0].clientX);
    },
    [handleInteraction],
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
    return (
      <div ref={containerRef} className="w-full">
        <Skeleton className="w-full bg-zinc-100" style={{ height }} />
      </div>
    );
  }

  if (!chart.hasData) {
    const drawHeight = Math.max(
      1,
      height - CHART_CONFIG.TOP_PADDING - CHART_CONFIG.BOTTOM_PADDING,
    );
    const drawWidth = Math.max(
      1,
      svgWidth - CHART_CONFIG.LEFT_PADDING - CHART_CONFIG.RIGHT_PADDING,
    );
    const axisBottom = CHART_CONFIG.TOP_PADDING + drawHeight + 12;

    return (
      <div ref={containerRef} className="w-full">
        <svg width={svgWidth} height={height} className="overflow-visible">
          {/* Y-axis border */}
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={axisBottom}
            stroke="#e4e4e7"
            strokeWidth={1}
          />
          {/* X-axis border */}
          <line
            x1={0}
            y1={axisBottom}
            x2={CHART_CONFIG.LEFT_PADDING + drawWidth}
            y2={axisBottom}
            stroke="#e4e4e7"
            strokeWidth={1}
          />
          {/* Navigation arrows */}
          {onPrevious && onNext && (
            <foreignObject x={0} y={height - 28} width={svgWidth} height={28}>
              <div className="flex w-full select-none justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrevious();
                  }}
                  disabled={!canGoBack}
                  className="pointer-events-auto flex size-7 touch-manipulation items-center justify-center rounded-lg border border-zinc-200 bg-white p-0 transition-transform hover:bg-zinc-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Previous period"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 19 19"
                    fill="none"
                    className={canGoBack ? 'text-zinc-600' : 'text-zinc-300'}
                  >
                    <path
                      d="M12.0625 13.6934L7.5625 9.19336L12.0625 4.69336"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                  disabled={!canGoForward}
                  className="pointer-events-auto flex size-7 touch-manipulation items-center justify-center rounded-lg border border-zinc-200 bg-white p-0 transition-transform hover:bg-zinc-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Next period"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 19 19"
                    fill="none"
                    className={canGoForward ? 'text-zinc-600' : 'text-zinc-300'}
                  >
                    <path
                      d="M7.25 13.5391L11.75 9.03906L7.25 4.53906"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </foreignObject>
          )}
        </svg>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <svg
        ref={svgRef}
        width={svgWidth}
        height={height}
        className="touch-manipulation overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={clearHover}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={clearHover}
      >
        {/* Transparent hit area — ensures hover events fire everywhere */}
        <rect
          x={chart.drawArea.x}
          y={chart.drawArea.y}
          width={chart.drawArea.width}
          height={chart.drawArea.height}
          fill="transparent"
        />

        {/* Y-axis border (left edge) */}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={chart.drawArea.y + chart.drawArea.height + 12}
          stroke="#e4e4e7"
          strokeWidth={1}
        />

        {/* X-axis border (below draw area, above labels) */}
        <line
          x1={0}
          y1={chart.drawArea.y + chart.drawArea.height + 12}
          x2={chart.drawArea.x + chart.drawArea.width}
          y2={chart.drawArea.y + chart.drawArea.height + 12}
          stroke="#e4e4e7"
          strokeWidth={1}
        />

        {/* Y-axis grid lines + labels */}
        {chart.yTicks.map((tick) => (
          <g key={tick.value}>
            <line
              x1={chart.drawArea.x}
              y1={tick.y}
              x2={chart.drawArea.x + chart.drawArea.width}
              y2={tick.y}
              stroke="#f4f4f5"
              strokeWidth={1}
            />
            <text
              x={chart.drawArea.x - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="fill-zinc-400 text-[11px]"
            >
              {tick.label}
            </text>
          </g>
        ))}

        {/* Baseline dashed line (behind data) */}
        {chart.baselineY != null && (
          <line
            x1={chart.drawArea.x}
            y1={chart.baselineY}
            x2={chart.drawArea.x + chart.drawArea.width}
            y2={chart.baselineY}
            stroke={CHART_CONFIG.BASELINE_COLOR}
            strokeWidth={1}
            strokeDasharray="6 4"
          />
        )}

        {/* Baseline label (behind data) */}
        {chart.baselineY != null && baselineLabel && (
          <g>
            <rect
              x={chart.drawArea.x + chart.drawArea.width - 52}
              y={chart.baselineY - 18}
              width={52}
              height={16}
              rx={2}
              fill="white"
            />
            <text
              x={chart.drawArea.x + chart.drawArea.width}
              y={chart.baselineY - 6}
              textAnchor="end"
              className="fill-zinc-400 text-[11px]"
            >
              {baselineLabel}
            </text>
          </g>
        )}

        {/* Data line with fade-in on data change */}
        <g key={dataKey} className="duration-300 animate-in fade-in">
          <path
            d={chart.path}
            fill="none"
            stroke={CHART_CONFIG.LINE_COLOR}
            strokeWidth={CHART_CONFIG.STROKE_WIDTH}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Data point circles */}
          {chart.points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={chart.points.length === 1 ? 6 : 5}
              fill={CHART_CONFIG.LINE_COLOR}
              stroke="white"
              strokeWidth={3}
            />
          ))}

          {/* Hover circle outline */}
          {hovered && (
            <circle
              cx={hovered.x}
              cy={hovered.y}
              r={7}
              fill="none"
              stroke={CHART_CONFIG.LINE_COLOR}
              strokeWidth={4}
              strokeOpacity={0.4}
            />
          )}
        </g>

        {/* X-axis labels */}
        {chart.xLabels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={height - 8}
            textAnchor="middle"
            className="fill-zinc-400 text-[11px]"
          >
            {label.label}
          </text>
        ))}

        {/* Navigation arrows at x-axis level */}
        {onPrevious && onNext && (
          <foreignObject x={0} y={height - 28} width={svgWidth} height={28}>
            <div className="flex w-full select-none justify-between gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrevious();
                }}
                disabled={!canGoBack}
                className="pointer-events-auto flex size-7 touch-manipulation items-center justify-center rounded-lg border border-zinc-200 bg-white p-0 transition-transform hover:bg-zinc-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous period"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 19 19"
                  fill="none"
                  className={canGoBack ? 'text-zinc-600' : 'text-zinc-300'}
                >
                  <path
                    d="M12.0625 13.6934L7.5625 9.19336L12.0625 4.69336"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                disabled={!canGoForward}
                className="pointer-events-auto flex size-7 touch-manipulation items-center justify-center rounded-lg border border-zinc-200 bg-white p-0 transition-transform hover:bg-zinc-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next period"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 19 19"
                  fill="none"
                  className={canGoForward ? 'text-zinc-600' : 'text-zinc-300'}
                >
                  <path
                    d="M7.25 13.5391L11.75 9.03906L7.25 4.53906"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </foreignObject>
        )}
      </svg>

      {hovered &&
        createPortal(
          <ChartTooltip isOpen={true} position={hovered.position} side="top">
            <div className="text-xs">
              <div className="font-semibold">
                {formatValue(hovered.value)} {unit}
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
};
