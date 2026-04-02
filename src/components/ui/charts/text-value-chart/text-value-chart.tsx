import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { MessageSquareText } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { Biomarker } from '@/types/api';

import { ChartTooltip } from '../chart-tooltip';
import { Pagination } from '../time-series-chart/pagination';
import { TooltipSource } from '../tooltip-source';

import { useTextValueChart } from './use-text-value-chart';

const SVG_HEIGHT = 300;

// Detail chart for text biomarkers (shown in biomarker dialog).
// Renders a horizontal timeline with gray circle icons (MessageSquareText inside) for
// each data point. Click selects a point and shows the lab comment text below the SVG.
// Hover shows date/source tooltip. Includes a "next test" gray projection dot.
export const TextValueChart = ({ biomarker }: { biomarker: Biomarker }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(755);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const svgWidth = Math.max(40, containerWidth);

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPointIndex, setSelectedPointIndex] = useState(-1);

  const [hoveredPoint, setHoveredPoint] = useState<{
    source: string;
    timestamp: string;
    position: { x: number; y: number };
    isNextTest: boolean;
    file?: { id: string; name: string };
  } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const lastHoveredRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | undefined>(undefined);
  const hideTimeoutRef = useRef<number | undefined>(undefined);
  const isTouchDevice = useRef<boolean>(false);

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

  const itemsPerPage = isMobile ? 3 : 6;

  const { meta, data, config } = useTextValueChart({
    biomarker,
    svgWidth,
    svgHeight: SVG_HEIGHT,
    isMobile,
    currentPage,
    itemsPerPage,
  });

  const effectiveSelectedIndex =
    selectedPointIndex >= 0 && selectedPointIndex < data.dataPoints.length
      ? selectedPointIndex
      : data.dataPoints.length - 1;

  const selectedPoint = data.dataPoints[effectiveSelectedIndex] || null;

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
        const centerY = data.dataPoints[0]?.y ?? SVG_HEIGHT * 0.4;

        // Build list of hoverable positions: data points + next-test dot
        const hoverTargets: Array<{
          x: number;
          index: number;
          isNextTest: boolean;
        }> = data.dataPoints.map((p, i) => ({
          x: p.x,
          index: i,
          isNextTest: false,
        }));

        if (data.nextTestX) {
          hoverTargets.push({
            x: data.nextTestX,
            index: -1,
            isNextTest: true,
          });
        }

        const nearest = hoverTargets.reduce((best, current) => {
          return Math.abs(current.x - mouseX) < Math.abs(best.x - mouseX)
            ? current
            : best;
        });

        const hoverKey = nearest.isNextTest ? -999 : nearest.index;
        if (lastHoveredRef.current === hoverKey) return;
        lastHoveredRef.current = hoverKey;

        if (nearest.isNextTest) {
          setHoveredPoint({
            source: '',
            timestamp: '',
            isNextTest: true,
            position: {
              x: rect.left + nearest.x + window.scrollX,
              y: rect.top + centerY - 40 + window.scrollY,
            },
          });
        } else {
          const point = data.dataPoints[nearest.index];
          if (point) {
            setHoveredPoint({
              source: point.source || 'quest',
              file: point.file,
              timestamp: point.timestamp,
              isNextTest: false,
              position: {
                x: rect.left + point.x + window.scrollX,
                y: rect.top + point.y - 40 + window.scrollY,
              },
            });
          }
        }
      });
    },
    [data.dataPoints, data.nextTestX],
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

      if (!isMobile || !hoveredPoint?.isNextTest) {
        hideTimeoutRef.current = window.setTimeout(() => {
          lastHoveredRef.current = null;
          setHoveredPoint(null);
        }, 100);
      }

      setTimeout(() => {
        isTouchDevice.current = false;
      }, 300);
    },
    [hoveredPoint, isMobile],
  );

  const handleMouseLeave = useCallback(() => {
    if (!isTouchDevice.current) {
      if (debounceTimerRef.current) {
        window.cancelAnimationFrame(debounceTimerRef.current);
        debounceTimerRef.current = undefined;
      }

      hideTimeoutRef.current = window.setTimeout(() => {
        lastHoveredRef.current = null;
        setHoveredPoint(null);
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
      lastHoveredRef.current = null;
      setHoveredPoint(null);
    }, 100);
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (currentPage < meta.totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setSelectedPointIndex(-1);
      setHoveredPoint(null);
    }
  }, [currentPage, meta.totalPages]);

  const handleNextPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setSelectedPointIndex(-1);
      setHoveredPoint(null);
    }
  }, [currentPage]);

  const handlePointClick = useCallback(
    (index: number) => {
      setSelectedPointIndex(index === effectiveSelectedIndex ? -1 : index);
    },
    [effectiveSelectedIndex],
  );

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
          height={SVG_HEIGHT}
          className="block touch-manipulation"
          role="img"
          aria-label={`Comment timeline for ${biomarker.name}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Connecting lines between icons */}
          {data.dataPoints.map((point, index) => {
            if (index >= data.dataPoints.length - 1) return null;

            const nextPoint = data.dataPoints[index + 1];
            return (
              <line
                key={`line-${index}`}
                x1={point.x + config.ICON_RADIUS}
                y1={point.y}
                x2={nextPoint.x - config.ICON_RADIUS}
                y2={nextPoint.y}
                stroke="#D4D4D8"
                strokeWidth={2}
              />
            );
          })}

          {/* Line to next test */}
          {data.nextTestX && data.dataPoints.length > 0 && (
            <line
              x1={
                data.dataPoints[data.dataPoints.length - 1].x +
                config.ICON_RADIUS
              }
              y1={data.dataPoints[data.dataPoints.length - 1].y}
              x2={data.nextTestX - 6}
              y2={data.dataPoints[data.dataPoints.length - 1].y}
              stroke="#D4D4D8"
              strokeWidth={2}
            />
          )}

          {/* Next test gray dot */}
          {data.nextTestX && data.dataPoints.length > 0 && (
            <>
              <circle
                cx={data.nextTestX}
                cy={data.dataPoints[data.dataPoints.length - 1].y}
                r={7}
                fill="white"
                stroke="white"
                strokeWidth={2}
              />
              <circle
                cx={data.nextTestX}
                cy={data.dataPoints[data.dataPoints.length - 1].y}
                r={6}
                fill="#D4D4D8"
                stroke="white"
                strokeWidth={1}
              />
            </>
          )}

          {/* Comment icons */}
          {data.dataPoints.map((point, index) => {
            const isSelected = effectiveSelectedIndex === index;
            return (
              <g
                key={point.id}
                className="cursor-pointer"
                onClick={() => handlePointClick(index)}
              >
                {isSelected && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={config.ICON_RADIUS + 4}
                    fill="none"
                    stroke="#A1A1AA"
                    strokeWidth={3}
                    strokeOpacity={0.3}
                  />
                )}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={config.ICON_RADIUS + 1}
                  fill="white"
                  stroke="white"
                  strokeWidth={2}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={config.ICON_RADIUS}
                  fill={isSelected ? '#3F3F46' : '#D4D4D8'}
                />
                <foreignObject
                  x={point.x - 10}
                  y={point.y - 10}
                  width={20}
                  height={20}
                >
                  <div className="flex size-full items-center justify-center">
                    <MessageSquareText
                      className="size-3.5 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Horizontal separator */}
          <line
            x1={3}
            y1={SVG_HEIGHT - 40}
            x2={svgWidth}
            y2={SVG_HEIGHT - 40}
            stroke="#E4E4E7"
            strokeWidth={1}
          />

          {/* X-axis date labels */}
          {data.xAxisLabels.map((label) => (
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
              y={SVG_HEIGHT - 32}
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

      {/* Hover tooltip */}
      {hoveredPoint &&
        createPortal(
          <ChartTooltip
            isOpen={true}
            position={hoveredPoint.position}
            side="top"
            interactive={true}
            className={cn(hoveredPoint.isNextTest && '-mt-20 rounded-xl p-1.5')}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            {hoveredPoint.isNextTest ? (
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
                <div className="text-xs">
                  <div className="font-semibold">Comment</div>
                  <div className="text-muted-foreground">
                    {format(new Date(hoveredPoint.timestamp), 'MMM dd, yyyy')} (
                    <TooltipSource
                      source={hoveredPoint.source}
                      file={hoveredPoint.file}
                    />
                    )
                  </div>
                </div>
              </div>
            )}
          </ChartTooltip>,
          document.body,
        )}

      {/* Selected comment card */}
      {selectedPoint && (
        <div className="mt-2 rounded-2xl border px-4 py-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-zinc-300">
            <MessageSquareText className="size-3.5" />
            <span className="text-xs">Lab Comment</span>
            <span className="text-xs">·</span>
            <span className="text-xs">
              {format(new Date(selectedPoint.timestamp), 'MMM dd, yyyy')}
            </span>
          </div>
          <p className="text-sm text-zinc-700">{selectedPoint.text}</p>
        </div>
      )}
    </div>
  );
};
