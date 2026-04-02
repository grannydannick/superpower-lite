import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { STATUS_TO_COLOR } from '@/const/status-to-color';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { Biomarker } from '@/types/api';

import { ChartTooltip } from '../chart-tooltip';
import { CHART_CONFIG } from '../time-series-chart/config';
import { Pagination } from '../time-series-chart/pagination';
import { TooltipSource } from '../tooltip-source';
import { getCodedBiomarkerRanges } from '../utils/get-biomarker-ranges';

import { useCodedValueChart } from './use-coded-value-chart';

// Detail chart for codedValue biomarkers (shown in biomarker dialog).
// Renders discrete horizontal bands for each possible coded value (optimal at bottom,
// abnormal at top), with status icons (checkmark/exclamation) inside each data point,
// color-coded connecting lines, a "next test" gray projection, and hover tooltips.
export const CodedValueChart = ({
  biomarker,
  height,
}: {
  biomarker: Biomarker;
  height?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(755);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const { ranges: codedRanges } = getCodedBiomarkerRanges(biomarker);
  const categoryCount = codedRanges.length;

  // Scale chart height when there are many categories so bands aren't squished.
  // Base height (300px) works for up to 6 categories (~40px per band).
  // Beyond that, add 35px per extra category.
  const MIN_BAND_HEIGHT = 35;
  const CATEGORY_THRESHOLD = 6;
  const dynamicHeight =
    categoryCount > CATEGORY_THRESHOLD
      ? CHART_CONFIG.SVG_HEIGHT +
        (categoryCount - CATEGORY_THRESHOLD) * MIN_BAND_HEIGHT
      : CHART_CONFIG.SVG_HEIGHT;

  const svgHeight = height ?? dynamicHeight;
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
    codedValue: string;
    timestamp: string;
    source?: string;
    status: 'optimal' | 'abnormal';
    position: { x: number; y: number };
    pointIndex: number;
    isNextTest: boolean;
    file?: { id: string; name: string };
  } | null>(null);

  const { meta, data, axes, optimal, config } = useCodedValueChart({
    biomarker,
    svgWidth,
    svgHeight,
    isMobile,
    currentPage,
    itemsPerPage: isMobile
      ? CHART_CONFIG.ITEMS_PER_PAGE_MOBILE
      : CHART_CONFIG.ITEMS_PER_PAGE_DESKTOP,
  });

  const nextTestX = useMemo(() => {
    if (!data.dataPoints.length) return null;
    const lastSegment = data.lineSegments.find(
      (s) => s.key === 'next-test-line',
    );
    if (!lastSegment) return null;
    return { x: lastSegment.x2, y: lastSegment.y2 };
  }, [data.dataPoints, data.lineSegments]);

  const svgRef = useRef<SVGSVGElement>(null);
  const lastPointRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | undefined>(undefined);
  const hideTimeoutRef = useRef<number | undefined>(undefined);
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

        // Build list of hoverable positions: data points + next-test dot
        const hoverTargets: Array<{
          x: number;
          y: number;
          index: number;
          isNextTest: boolean;
        }> = data.dataPoints.map((p, i) => ({
          x: p.x,
          y: p.y,
          index: i,
          isNextTest: false,
        }));

        if (nextTestX) {
          hoverTargets.push({
            x: nextTestX.x,
            y: nextTestX.y,
            index: -1,
            isNextTest: true,
          });
        }

        if (hoverTargets.length === 0) return;

        const nearest = hoverTargets.reduce((best, current) => {
          return Math.abs(current.x - mouseX) < Math.abs(best.x - mouseX)
            ? current
            : best;
        });

        const hoverKey = nearest.isNextTest ? -999 : nearest.index;
        if (lastPointRef.current === hoverKey) return;
        lastPointRef.current = hoverKey;

        if (nearest.isNextTest) {
          setDisplayedPoint({
            codedValue: '',
            timestamp: '',
            source: '',
            status: 'optimal',
            isNextTest: true,
            position: {
              x: rect.left + nearest.x + window.scrollX,
              y: rect.top + nearest.y - 40 + window.scrollY,
            },
            pointIndex: -1,
          });
        } else {
          const pointIndex = nearest.index;
          const itemsPerPage = isMobile
            ? CHART_CONFIG.ITEMS_PER_PAGE_MOBILE
            : CHART_CONFIG.ITEMS_PER_PAGE_DESKTOP;
          const endIndex =
            sortedValues.length - currentPage * (itemsPerPage ?? 15);
          const startIndex = Math.max(0, endIndex - (itemsPerPage ?? 15));
          const globalPointIndex = startIndex + pointIndex;
          const originalValue = sortedValues[globalPointIndex];
          const nearestPoint = data.dataPoints[pointIndex];

          if (originalValue && nearestPoint) {
            setDisplayedPoint({
              codedValue: nearestPoint.codedValue,
              timestamp: originalValue.timestamp,
              source: originalValue.source || 'quest',
              file: originalValue.file,
              status: nearestPoint.status,
              isNextTest: false,
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
    [data.dataPoints, sortedValues, currentPage, isMobile, nextTestX],
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

      // Keep tooltip visible on mobile for next-test points so user can tap "Book now"
      const isNextTestPoint = displayedPoint?.isNextTest;
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
    [displayedPoint, isMobile],
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
          aria-label={`Coded value chart for ${meta.biomarkerName} biomarker`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Vertical range stack (Y-axis indicator) */}
          {axes.yAxisBands.map((band) => (
            <rect
              key={`range-stack-${band.code}`}
              x={3}
              y={band.bandTop + 0.25}
              width={3}
              height={band.bandBottom - band.bandTop - 0.5}
              fill={
                band.isOptimal ? STATUS_TO_COLOR.optimal : STATUS_TO_COLOR.high
              }
              rx={1.5}
            />
          ))}

          {/* Horizontal separator lines between Y-axis bands */}
          {axes.yAxisBands.map((band) => (
            <line
              key={`separator-${band.code}`}
              x1={3}
              y1={band.bandTop}
              x2={svgWidth}
              y2={band.bandTop}
              stroke="#E4E4E7"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
          ))}

          {/* Optimal zone rects */}
          {optimal.areas.map((area, index) => (
            <React.Fragment key={`optimal-zone-${index}`}>
              <rect
                x={area.x}
                y={area.y}
                width={area.width}
                height={area.height}
                fill={area.fill}
                opacity={area.opacity}
              />
              {/* Dashed border lines at band boundaries */}
              <line
                x1={area.x}
                y1={area.y}
                x2={svgWidth}
                y2={area.y}
                stroke={STATUS_TO_COLOR.optimal}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <line
                x1={area.x}
                y1={area.y + area.height}
                x2={svgWidth}
                y2={area.y + area.height}
                stroke={STATUS_TO_COLOR.optimal}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            </React.Fragment>
          ))}

          {/* Optimal label */}
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

          {/* Y-axis band labels */}
          {axes.yAxisBands.map((band) => (
            <text
              key={`y-label-${band.code}`}
              x={12}
              y={band.y + 4}
              className="text-xs capitalize"
              fill={
                band.isOptimal ? STATUS_TO_COLOR.optimal : STATUS_TO_COLOR.high
              }
            >
              {band.code}
            </text>
          ))}

          {/* Horizontal separator line at the bottom of the chart area */}
          <line
            x1={3}
            y1={svgHeight - 40}
            x2={svgWidth}
            y2={svgHeight - 40}
            stroke="#E4E4E7"
            strokeWidth={1}
          />

          {/* Line segments between data points */}
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

            {/* Data point circles with status icons */}
            {data.dataPoints.map((point, index) => {
              const fillColor =
                point.status === 'optimal'
                  ? STATUS_TO_COLOR.optimal
                  : STATUS_TO_COLOR.high;

              return (
                <g key={point.id}>
                  {/* Hover highlight ring */}
                  {displayedPoint?.pointIndex === index && (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={config.circleRadius + 3}
                      fill="none"
                      stroke={fillColor}
                      strokeWidth={4}
                      strokeOpacity={0.4}
                    />
                  )}

                  {/* White border circle */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={config.circleRadius + 1}
                    fill="white"
                    stroke="white"
                    strokeWidth={2}
                  />

                  {/* Colored circle */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={config.circleRadius}
                    fill={fillColor}
                    stroke="white"
                    strokeWidth={2}
                  />
                </g>
              );
            })}

            {/* Next test gray dot */}
            {nextTestX && (
              <g>
                <circle
                  cx={nextTestX.x}
                  cy={nextTestX.y}
                  r={config.circleRadius + 1}
                  fill="white"
                  stroke="white"
                  strokeWidth={2}
                />
                <circle
                  cx={nextTestX.x}
                  cy={nextTestX.y}
                  r={config.circleRadius}
                  fill="#9CA3AF"
                  stroke="white"
                  strokeWidth={1}
                />
              </g>
            )}
          </g>

          {/* X-axis date labels */}
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

          {/* Pagination */}
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

      {/* Tooltip */}
      {displayedPoint &&
        createPortal(
          <ChartTooltip
            isOpen={true}
            position={displayedPoint.position}
            side="top"
            interactive={true}
            className={cn(
              displayedPoint.isNextTest && '-mt-20 rounded-xl p-1.5',
            )}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            {displayedPoint.isNextTest ? (
              <div className="pointer-events-auto flex max-w-32 items-center gap-4 p-2">
                <div className="text-sm">
                  <div className="mb-3 text-center font-semibold">
                    Schedule your annual re-test
                  </div>
                  <Button
                    onClick={() => {
                      void navigate({ to: '/marketplace' });
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
                      displayedPoint.status === 'optimal'
                        ? STATUS_TO_COLOR.optimal
                        : STATUS_TO_COLOR.high,
                  }}
                />
                <div className="text-xs">
                  <div className="font-semibold capitalize">
                    {displayedPoint.codedValue}
                  </div>
                  <div className="text-muted-foreground">
                    {format(new Date(displayedPoint.timestamp), 'MMM dd, yyyy')}{' '}
                    (
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
        )}
    </div>
  );
};
