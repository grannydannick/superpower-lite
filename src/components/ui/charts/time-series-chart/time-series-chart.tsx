import NumberFlow from '@number-flow/react';
import moment from 'moment';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { STATUS_TO_COLOR } from '@/const/status-to-color';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Biomarker } from '@/types/api';

import { ChartTooltip } from '../chart-tooltip';
import { RangeStack } from '../range-stack';

import { CHART_CONFIG } from './config';
import { Pagination } from './pagination';
import { useTimeSeriesChart } from './use-time-series-chart';

const MemoizedYAxisLabel = memo(
  ({ value, x, y }: { value: number; x: number; y: number }) => {
    return (
      <foreignObject x={x} y={y - 18} width="60" height="24">
        <NumberFlow
          value={value}
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
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

export const TimeSeriesChart = ({
  biomarker,
  height,
}: {
  biomarker: Biomarker;
  height?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(755);
  const isMobile = useIsMobile();

  const svgHeight = height ?? CHART_CONFIG.SVG_HEIGHT;
  const svgWidth = Math.max(40, containerWidth);

  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const [displayedPoint, setDisplayedPoint] = useState<{
    value: number;
    timestamp: string;
    position: { x: number; y: number };
    pointIndex: number;
    source?: string;
  } | null>(null);

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
  });

  const navigate = useNavigate();

  const svgRef = useRef<SVGSVGElement>(null);
  const lastPointRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number>();
  const hideTimeoutRef = useRef<number>();
  const isTouchDevice = useRef<boolean>(false);

  const sortedValues = [...biomarker.value].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
      if (debounceTimerRef.current) {
        window.cancelAnimationFrame(debounceTimerRef.current);
      }
    };
  }, []);

  const handleInteraction = useCallback(
    (clientX: number) => {
      if (!svgRef.current || !data.dataPoints.length) return;

      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = undefined;
      }

      if (debounceTimerRef.current) {
        window.cancelAnimationFrame(debounceTimerRef.current);
      }

      debounceTimerRef.current = window.requestAnimationFrame(() => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = clientX - rect.left;

        const nearestPoint = data.dataPoints.reduce((nearest, current) => {
          const currentDistance = Math.abs(current.x - mouseX);
          const nearestDistance = Math.abs(nearest.x - mouseX);
          return currentDistance < nearestDistance ? current : nearest;
        });

        const pointIndex = data.dataPoints.findIndex(
          (p) => p.id === nearestPoint.id,
        );

        if (lastPointRef.current !== pointIndex && pointIndex !== -1) {
          lastPointRef.current = pointIndex;
          const isNextTestPoint =
            data.dataPoints[pointIndex].status === 'next-test';

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
          } else {
            const itemsPerPage = isMobile
              ? CHART_CONFIG.ITEMS_PER_PAGE_MOBILE
              : CHART_CONFIG.ITEMS_PER_PAGE_DESKTOP;
            const endIndex = sortedValues.length - currentPage * itemsPerPage;
            const startIndex = Math.max(0, endIndex - itemsPerPage);
            const globalPointIndex = startIndex + pointIndex;
            const originalValue = sortedValues[globalPointIndex];
            if (originalValue) {
              setDisplayedPoint({
                value: originalValue.quantity.value,
                timestamp: originalValue.timestamp,
                source: originalValue.source || 'quest',
                position: {
                  x: rect.left + nearestPoint.x + window.scrollX,
                  y: rect.top + nearestPoint.y - 40 + window.scrollY,
                },
                pointIndex,
              });
            }
          }
        }
      });
    },
    [data.dataPoints, sortedValues, currentPage, isMobile],
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
      if (debounceTimerRef.current) {
        window.cancelAnimationFrame(debounceTimerRef.current);
        debounceTimerRef.current = undefined;
      }

      // do not auto-hide tooltip on mobile for next-test points (which have buttons)
      const isNextTestPoint =
        displayedPoint &&
        data.dataPoints[displayedPoint.pointIndex]?.status === 'next-test';

      if (!isMobile || !isNextTestPoint) {
        hideTimeoutRef.current = window.setTimeout(() => {
          lastPointRef.current = null;
          setDisplayedPoint(null);
        }, 100);
      }

      setTimeout(() => {
        isTouchDevice.current = false;
      }, 300);
    },
    [displayedPoint, data.dataPoints, isMobile],
  );

  const handleMouseLeave = useCallback(() => {
    if (!isTouchDevice.current) {
      if (debounceTimerRef.current) {
        window.cancelAnimationFrame(debounceTimerRef.current);
        debounceTimerRef.current = undefined;
      }

      hideTimeoutRef.current = window.setTimeout(() => {
        lastPointRef.current = null;
        setDisplayedPoint(null);
      }, 100);
    }
  }, []);

  const handleTooltipMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    hideTimeoutRef.current = window.setTimeout(() => {
      lastPointRef.current = null;
      setDisplayedPoint(null);
    }, 100);
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (currentPage < meta.totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setDisplayedPoint(null);
    }
  }, [currentPage, meta.totalPages]);

  const handleNextPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setDisplayedPoint(null);
    }
  }, [currentPage]);

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
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          className="block touch-manipulation"
          role="img"
          aria-label={`Time series chart for ${meta.biomarkerName} biomarker`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
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

            {data.dataPoints.map((point, index) => (
              <g key={point.id}>
                {displayedPoint?.pointIndex === index && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={config.circleRadius! + 3}
                    fill="none"
                    stroke={
                      point.status === 'next-test'
                        ? '#9CA3AF'
                        : STATUS_TO_COLOR[
                            point.status.toLowerCase() as keyof typeof STATUS_TO_COLOR
                          ] || STATUS_TO_COLOR.pending
                    }
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
                  fill={
                    point.status === 'next-test'
                      ? '#9CA3AF'
                      : STATUS_TO_COLOR[
                          point.status.toLowerCase() as keyof typeof STATUS_TO_COLOR
                        ] || STATUS_TO_COLOR.pending
                  }
                  stroke="white"
                  strokeWidth={1}
                />
              </g>
            ))}
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
                onPreviousPage={handlePreviousPage}
                onNextPage={handleNextPage}
                className="pointer-events-auto relative z-10"
              />
            </foreignObject>
          )}
        </svg>
      </div>

      {displayedPoint &&
        createPortal(
          <ChartTooltip
            isOpen={true}
            position={displayedPoint.position}
            side="top"
            className={cn(
              data.dataPoints[displayedPoint.pointIndex].status ===
                'next-test' && 'p-1.5 -mt-20 rounded-xl',
            )}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            {data.dataPoints[displayedPoint.pointIndex].status ===
            'next-test' ? (
              <div className="pointer-events-auto flex max-w-32 items-center gap-4 p-2">
                <div className="text-sm">
                  <div className="mb-3 text-center font-semibold">
                    Schedule your annual re-test
                  </div>
                  <Button
                    onClick={() => {
                      navigate('/services');
                    }}
                    size="small"
                    className="w-full rounded-md"
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
                        data.dataPoints[
                          displayedPoint.pointIndex
                        ].status.toLowerCase() as keyof typeof STATUS_TO_COLOR
                      ] || STATUS_TO_COLOR.pending,
                  }}
                />
                <div className="text-xs">
                  <div className="font-semibold">
                    {displayedPoint.value.toFixed(1)} {biomarker.unit}
                  </div>
                  <div className="text-muted-foreground">
                    {moment(displayedPoint.timestamp).format('MMM DD, YYYY')} (
                    <span className="capitalize">{displayedPoint.source}</span>)
                  </div>
                </div>
              </div>
            )}
          </ChartTooltip>,
          document.body,
        )}
    </div>
  );
};
