import NumberFlow from '@number-flow/react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import React, { memo, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { STATUS_TO_COLOR } from '@/const/status-to-color';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Biomarker } from '@/types/api';
import { getDisplayComparator } from '@/utils/get-display-comparator';

import { ChartTooltip } from '../chart-tooltip';
import { RangeStack } from '../range-stack';
import { TooltipSource } from '../tooltip-source';

import { CHART_CONFIG } from './config';
import { Pagination } from './pagination';
import { useTimeSeriesChart } from './use-time-series-chart';

const MemoizedYAxisLabel = memo(
  ({ value, x, y }: { value: number; x: number; y: number }) => {
    return (
      <foreignObject x={x} y={y - 18} width="60" height="24">
        <NumberFlow
          value={value}
          format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
          className="pointer-events-none text-xs text-gray-600"
          style={{ fontSize: '12px', color: '#666' }}
          transformTiming={{ duration: 250, easing: 'ease-in-out' }}
          spinTiming={{ duration: 150, easing: 'ease-out' }}
          opacityTiming={{ duration: 350, easing: 'ease-out' }}
        />
      </foreignObject>
    );
  },
);

MemoizedYAxisLabel.displayName = 'MemoizedYAxisLabel';

interface DisplayedPoint {
  value: number;
  timestamp: string;
  position: { x: number; y: number };
  pointIndex: number;
  source?: string;
  unit?: string;
  rangeLabel?: string;
  file?: { id: string; name: string };
}

export const TimeSeriesChart = ({
  biomarker,
  height,
}: {
  biomarker: Biomarker;
  height?: number;
}) => {
  const { containerRef, containerWidth } = useContainerWidth(755);
  const isMobile = useIsMobile();

  const svgHeight = height ?? CHART_CONFIG.SVG_HEIGHT;
  const svgWidth = Math.max(40, containerWidth);

  const [currentPage, setCurrentPage] = useState(0);

  const [displayedPoint, setDisplayedPoint] = useState<DisplayedPoint | null>(
    null,
  );

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isRevealRoute = pathname.startsWith('/protocol/reveal');

  const { meta, data, axes, optimal, rangeStack, config } = useTimeSeriesChart({
    biomarker,
    svgWidth,
    svgHeight,
    isMobile,
    currentPage,
    itemsPerPage: isMobile
      ? CHART_CONFIG.ITEMS_PER_PAGE_MOBILE
      : CHART_CONFIG.ITEMS_PER_PAGE_DESKTOP,
    hoveredSource: displayedPoint?.source,
    showNextTest: !isRevealRoute,
  });

  const sortedValues = [...biomarker.value].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const itemsPerPage = isMobile
    ? CHART_CONFIG.ITEMS_PER_PAGE_MOBILE
    : CHART_CONFIG.ITEMS_PER_PAGE_DESKTOP;

  const {
    svgRef,
    clearDisplayedPoint,
    handleMouseLeave,
    handleMouseMove,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
  } = useTimeSeriesDisplayedPoint({
    dataPoints: data.dataPoints,
    displayedPoint,
    setDisplayedPoint,
    sortedValues,
    currentPage,
    itemsPerPage,
    isMobile,
  });

  const handlePreviousPage = useCallback(() => {
    if (currentPage < meta.totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
      clearDisplayedPoint();
    }
  }, [currentPage, meta.totalPages, clearDisplayedPoint]);

  const handleNextPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      clearDisplayedPoint();
    }
  }, [currentPage, clearDisplayedPoint]);

  if (!meta.hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-500">
        No data available for this biomarker
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <div className="relative overflow-x-auto">
        <TimeSeriesChartSvg
          svgRef={svgRef}
          svgWidth={svgWidth}
          svgHeight={svgHeight}
          meta={meta}
          axes={axes}
          data={data}
          optimal={optimal}
          rangeStack={rangeStack}
          config={config}
          displayedPoint={displayedPoint}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          currentPage={currentPage}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />
      </div>

      <TimeSeriesChartTooltipPortal
        displayedPoint={displayedPoint}
        dataPoints={data.dataPoints}
        biomarkerUnit={biomarker.unit}
        hideBookNow={isRevealRoute}
        onBookNow={() => {
          void navigate({ to: '/marketplace' });
        }}
        onMouseEnter={handleTooltipMouseEnter}
        onMouseLeave={handleTooltipMouseLeave}
      />
    </div>
  );
};

function useContainerWidth(initialWidth: number) {
  const [containerWidth, setContainerWidth] = useState(initialWidth);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const resizeHandlerRef = useRef<(() => void) | null>(null);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (resizeObserverRef.current !== null) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    if (resizeHandlerRef.current !== null) {
      window.removeEventListener('resize', resizeHandlerRef.current);
      resizeHandlerRef.current = null;
    }

    if (node === null) {
      return;
    }

    const updateWidth = () => {
      const nextWidth = node.offsetWidth;

      setContainerWidth((currentWidth) => {
        if (currentWidth === nextWidth) {
          return currentWidth;
        }

        return nextWidth;
      });
    };

    updateWidth();

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        updateWidth();
      });

      resizeObserver.observe(node);
      resizeObserverRef.current = resizeObserver;
      return;
    }

    resizeHandlerRef.current = updateWidth;
    window.addEventListener('resize', updateWidth);
  }, []);

  return { containerRef, containerWidth };
}

function useTimeSeriesDisplayedPoint({
  dataPoints,
  displayedPoint,
  setDisplayedPoint,
  sortedValues,
  currentPage,
  itemsPerPage,
  isMobile,
}: {
  dataPoints: Array<{ id: string; x: number; y: number; status: string }>;
  displayedPoint: DisplayedPoint | null;
  setDisplayedPoint: React.Dispatch<
    React.SetStateAction<DisplayedPoint | null>
  >;
  sortedValues: Array<{
    timestamp: string;
    quantity?: { value: number; comparator?: string; unit?: string };
    valueRange?: { low: number; high: number; unit?: string };
    source?: string;
    file?: { id: string; name: string };
  }>;
  currentPage: number;
  itemsPerPage: number;
  isMobile: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const lastPointRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const touchResetTimeoutRef = useRef<number | null>(null);
  const isTouchDevice = useRef<boolean>(false);
  const setSvgRef = useCallback((node: SVGSVGElement | null) => {
    svgRef.current = node;

    if (node !== null) {
      return;
    }

    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (debounceTimerRef.current !== null) {
      window.cancelAnimationFrame(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (touchResetTimeoutRef.current !== null) {
      window.clearTimeout(touchResetTimeoutRef.current);
      touchResetTimeoutRef.current = null;
    }
  }, []);

  const clearDisplayedPoint = useCallback(() => {
    lastPointRef.current = null;
    setDisplayedPoint(null);
  }, [setDisplayedPoint]);

  const handleInteraction = useCallback(
    (clientX: number) => {
      if (!svgRef.current || !dataPoints.length) return;

      if (hideTimeoutRef.current !== null) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      if (debounceTimerRef.current !== null) {
        window.cancelAnimationFrame(debounceTimerRef.current);
      }

      debounceTimerRef.current = window.requestAnimationFrame(() => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = clientX - rect.left;

        const nearestPoint = dataPoints.reduce((nearest, current) => {
          const currentDistance = Math.abs(current.x - mouseX);
          const nearestDistance = Math.abs(nearest.x - mouseX);
          return currentDistance < nearestDistance ? current : nearest;
        });

        const pointIndex = dataPoints.findIndex(
          (p) => p.id === nearestPoint.id,
        );

        if (lastPointRef.current !== pointIndex && pointIndex !== -1) {
          lastPointRef.current = pointIndex;
          const isNextTestPoint = dataPoints[pointIndex].status === 'next-test';

          if (isNextTestPoint) {
            setDisplayedPoint({
              value: 0,
              timestamp: '',
              position: {
                x: rect.left + nearestPoint.x + window.scrollX,
                y: rect.top + nearestPoint.y - 40 + window.scrollY,
              },
              pointIndex,
            });
            return;
          }

          const endIndex = sortedValues.length - currentPage * itemsPerPage;
          const startIndex = Math.max(0, endIndex - itemsPerPage);
          const globalPointIndex = startIndex + pointIndex;
          const originalValue = sortedValues[globalPointIndex];
          if (originalValue) {
            setDisplayedPoint({
              value:
                originalValue.quantity?.value ??
                (originalValue.valueRange
                  ? (originalValue.valueRange.low +
                      originalValue.valueRange.high) /
                    2
                  : 0),
              rangeLabel: originalValue.valueRange
                ? `${originalValue.valueRange.low}-${originalValue.valueRange.high}`
                : originalValue.quantity?.comparator &&
                    originalValue.quantity.comparator !== 'EQUALS'
                  ? `${getDisplayComparator(originalValue.quantity.comparator)}${originalValue.quantity.value}`
                  : undefined,
              timestamp: originalValue.timestamp,
              source: originalValue.source || 'quest',
              unit:
                originalValue.quantity?.unit || originalValue.valueRange?.unit,
              file: originalValue.file,
              position: {
                x: rect.left + nearestPoint.x + window.scrollX,
                y: rect.top + nearestPoint.y - 40 + window.scrollY,
              },
              pointIndex,
            });
          }
        }
      });
    },
    [dataPoints, sortedValues, currentPage, itemsPerPage, setDisplayedPoint],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isTouchDevice.current) {
        handleInteraction(e.clientX);
      }
    },
    [handleInteraction],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      if (touchResetTimeoutRef.current !== null) {
        window.clearTimeout(touchResetTimeoutRef.current);
        touchResetTimeoutRef.current = null;
      }

      isTouchDevice.current = true;
      e.preventDefault();
      if (e.touches.length === 1) {
        handleInteraction(e.touches[0].clientX);
      }
    },
    [handleInteraction],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        handleInteraction(e.touches[0].clientX);
      }
    },
    [handleInteraction],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      e.preventDefault();
      if (debounceTimerRef.current !== null) {
        window.cancelAnimationFrame(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // do not auto-hide tooltip on mobile for next-test points (which have buttons)
      const isNextTestPoint =
        displayedPoint &&
        dataPoints[displayedPoint.pointIndex]?.status === 'next-test';

      if (!isMobile || !isNextTestPoint) {
        hideTimeoutRef.current = window.setTimeout(() => {
          clearDisplayedPoint();
        }, 100);
      }

      if (touchResetTimeoutRef.current !== null) {
        window.clearTimeout(touchResetTimeoutRef.current);
      }

      touchResetTimeoutRef.current = window.setTimeout(() => {
        isTouchDevice.current = false;
        touchResetTimeoutRef.current = null;
      }, 300);
    },
    [displayedPoint, dataPoints, isMobile, clearDisplayedPoint],
  );

  const handleMouseLeave = useCallback(() => {
    if (!isTouchDevice.current) {
      if (debounceTimerRef.current !== null) {
        window.cancelAnimationFrame(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      hideTimeoutRef.current = window.setTimeout(() => {
        clearDisplayedPoint();
      }, 100);
    }
  }, [clearDisplayedPoint]);

  const handleTooltipMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    hideTimeoutRef.current = window.setTimeout(() => {
      clearDisplayedPoint();
    }, 100);
  }, [clearDisplayedPoint]);

  return {
    svgRef: setSvgRef,
    clearDisplayedPoint,
    handleMouseMove,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
  };
}

function TimeSeriesChartSvg({
  svgRef,
  svgWidth,
  svgHeight,
  meta,
  axes,
  data,
  optimal,
  rangeStack,
  config,
  displayedPoint,
  onMouseMove,
  onMouseLeave,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  currentPage,
  onPreviousPage,
  onNextPage,
}: {
  svgRef: React.Ref<SVGSVGElement>;
  svgWidth: number;
  svgHeight: number;
  meta: ReturnType<typeof useTimeSeriesChart>['meta'];
  axes: ReturnType<typeof useTimeSeriesChart>['axes'];
  data: ReturnType<typeof useTimeSeriesChart>['data'];
  optimal: ReturnType<typeof useTimeSeriesChart>['optimal'];
  rangeStack: ReturnType<typeof useTimeSeriesChart>['rangeStack'];
  config: ReturnType<typeof useTimeSeriesChart>['config'];
  displayedPoint: DisplayedPoint | null;
  onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent<SVGSVGElement>) => void;
  onTouchMove: (e: React.TouchEvent<SVGSVGElement>) => void;
  onTouchEnd: (e: React.TouchEvent<SVGSVGElement>) => void;
  currentPage: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}) {
  return (
    <svg
      ref={svgRef}
      width={svgWidth}
      height={svgHeight}
      className="block touch-manipulation"
      role="img"
      aria-label={`Time series chart for ${meta.biomarkerName} biomarker`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <defs>
        <pattern
          id="optimalPattern"
          patternUnits="userSpaceOnUse"
          width="1"
          height="4"
        >
          <rect width="1" height="2" fill={optimal.area?.fill} />
          <rect y="2" width="1" height="2" fill="transparent" />
        </pattern>
      </defs>

      {rangeStack.props && (
        <g transform={rangeStack.props.transform}>
          <RangeStack
            range={rangeStack.props.range}
            values={rangeStack.props.values}
            height={rangeStack.props.height}
            padding={rangeStack.props.padding}
            dimensions={rangeStack.props.dimensions}
            rangeExtensionFactor={rangeStack.props.rangeExtensionFactor}
          />
        </g>
      )}

      {optimal.area && (
        <rect
          x={optimal.area.x}
          y={optimal.area.y}
          width={optimal.area.width}
          height={optimal.area.height}
          fill={optimal.area.fill}
          opacity={optimal.area.opacity}
        />
      )}

      {optimal.lines.map((line) => (
        <line
          key={line.key}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={line.stroke}
          strokeWidth={line.strokeWidth}
          strokeDasharray={line.strokeDasharray}
        />
      ))}

      {optimal.label && (
        <text
          x={optimal.label.x}
          y={optimal.label.y}
          textAnchor={optimal.label.textAnchor}
          className={optimal.label.className}
          fill={optimal.label.fill}
        >
          {optimal.label.text}
        </text>
      )}

      {axes.yAxisLabels.map((label) => (
        <MemoizedYAxisLabel
          key={label.key}
          value={parseFloat(label.label)}
          x={label.x}
          y={label.y}
        />
      ))}

      <g>
        {data.lineSegments.map((segment) => (
          <line
            key={segment.key}
            x1={segment.x1}
            y1={segment.y1}
            x2={segment.x2}
            y2={segment.y2}
            stroke={segment.color}
            strokeWidth={config.strokeWidth}
            strokeDasharray={segment.strokeDasharray}
            fill="none"
          />
        ))}

        {data.dataPoints.map((point, index) => {
          const isNextTest = point.status === 'next-test';
          const color = isNextTest
            ? '#9CA3AF'
            : STATUS_TO_COLOR[
                point.status.toLowerCase() as keyof typeof STATUS_TO_COLOR
              ] || STATUS_TO_COLOR.pending;
          const isHovered = displayedPoint?.pointIndex === index;
          // Range biomarkers render as pills (rounded rects) spanning low-to-high;
          // quantity biomarkers render as circles.
          const isPill = point.yLow !== undefined && point.yHigh !== undefined;

          if (isPill) {
            const yLow = point.yLow!;
            const yHigh = point.yHigh!;
            const pillWidth = 8;
            const pillTop = Math.min(yHigh, yLow);
            const pillHeight = Math.max(pillWidth, Math.abs(yLow - yHigh));
            const rx = pillWidth / 2;

            return (
              <g key={point.id}>
                {isHovered && (
                  <rect
                    x={point.x - pillWidth / 2 - 2}
                    y={pillTop - 2}
                    width={pillWidth + 4}
                    height={pillHeight + 4}
                    rx={rx + 2}
                    fill={color}
                    opacity={0.25}
                  />
                )}
                <rect
                  x={point.x - pillWidth / 2}
                  y={pillTop}
                  width={pillWidth}
                  height={pillHeight}
                  rx={rx}
                  fill={color}
                  stroke="white"
                  strokeWidth={config.strokeWidth}
                />
              </g>
            );
          }

          return (
            <g key={point.id}>
              {isHovered && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={config.circleRadius! + 3}
                  fill="none"
                  stroke={color}
                  strokeWidth={4}
                  strokeOpacity={0.4}
                />
              )}
              <circle
                cx={point.x}
                cy={point.y}
                r={config.circleRadius! + 1}
                fill="white"
                stroke="white"
                strokeWidth={2}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={config.circleRadius!}
                fill={color}
                stroke="white"
                strokeWidth={1}
              />
            </g>
          );
        })}
      </g>

      <line
        x1={3}
        y1={svgHeight - 40}
        x2={svgWidth}
        y2={svgHeight - 40}
        stroke="#E4E4E7"
        strokeWidth={1}
      />

      {axes.xAxisLabels.map((label) => (
        <text
          key={label.key}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          className="text-xs"
          fill="#666"
        >
          {label.label}
        </text>
      ))}

      {meta.showPagination && (
        <foreignObject
          x={8}
          y={svgHeight - 32}
          width={svgWidth - 8}
          height={32}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={meta.totalPages}
            onPreviousPage={onPreviousPage}
            onNextPage={onNextPage}
            className="pointer-events-auto relative z-10"
          />
        </foreignObject>
      )}
    </svg>
  );
}

function TimeSeriesChartTooltipPortal({
  displayedPoint,
  dataPoints,
  biomarkerUnit,
  hideBookNow,
  onBookNow,
  onMouseEnter,
  onMouseLeave,
}: {
  displayedPoint: DisplayedPoint | null;
  dataPoints: Array<{ status: string }>;
  biomarkerUnit: string;
  hideBookNow?: boolean;
  onBookNow: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  if (!displayedPoint) return null;

  const status = dataPoints[displayedPoint.pointIndex]?.status;
  if (!status) return null;

  return createPortal(
    <ChartTooltip
      isOpen={true}
      position={displayedPoint.position}
      side="top"
      interactive={true}
      className={cn(status === 'next-test' && '-mt-20 rounded-xl p-1.5')}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {status === 'next-test' ? (
        <div className="pointer-events-auto flex max-w-32 items-center gap-4 p-2">
          <div className="text-sm">
            <div className="mb-3 text-center font-semibold">
              Schedule your annual re-test
            </div>
            <Button
              onClick={onBookNow}
              size="small"
              className="w-full rounded-md"
              disabled={hideBookNow}
            >
              Book now
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div
            className="size-3 rounded-full border border-white"
            style={{
              backgroundColor:
                STATUS_TO_COLOR[
                  status.toLowerCase() as keyof typeof STATUS_TO_COLOR
                ] || STATUS_TO_COLOR.pending,
            }}
          />
          <div className="text-xs">
            <div className="font-semibold">
              {displayedPoint.rangeLabel ?? displayedPoint.value.toFixed(2)}{' '}
              {displayedPoint.unit || biomarkerUnit}
            </div>
            <div className="text-muted-foreground">
              {format(new Date(displayedPoint.timestamp), 'MMM dd, yyyy')} (
              <TooltipSource
                source={displayedPoint.source ?? 'quest'}
                file={displayedPoint.file}
              />
              )
            </div>
          </div>
        </div>
      )}
    </ChartTooltip>,
    document.body,
  );
}
