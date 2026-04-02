import { format } from 'date-fns';
import React, { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { STATUS_TO_COLOR } from '@/const/status-to-color';
import { useIsMobile } from '@/hooks/use-mobile';
import { Biomarker, Lab } from '@/types/api';

import { ChartTooltip } from '../chart-tooltip';
import { RangeStack } from '../range-stack';
import { TooltipSource } from '../tooltip-source';

import { CHART_CONFIG } from './config';
import { useSparklineChart } from './use-sparkline-chart';

interface SparklineDisplayedPoint {
  index: number;
  value: number;
  timestamp: string;
  position: { x: number; y: number };
  status: string;
  source: Lab;
  unit?: string;
  comparatorLabel?: string;
  file?: { id: string; name: string };
}

const SparklineLineChart = ({
  biomarker,
  maxValuesToShow,
  svgWidth,
  onHover,
  onHoverEnd,
  hoveredPointIndex,
}: {
  biomarker: Biomarker;
  maxValuesToShow: number;
  svgWidth: number;
  onHover: (data: {
    index: number;
    value: number;
    timestamp: string;
    position: { x: number; y: number };
    status: string;
    source: Lab;
    unit?: string;
    comparatorLabel?: string;
    file?: { id: string; name: string };
  }) => void;
  onHoverEnd: () => void;
  hoveredPointIndex?: number | null;
}) => {
  const { meta, data, config } = useSparklineChart({
    biomarker,
    maxValuesToShow,
    svgWidth,
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const lastPointRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const touchResetTimeoutRef = useRef<number | null>(null);
  const isTouchDevice = useRef<boolean>(false);

  const setSvgRef = useCallback((node: SVGSVGElement | null) => {
    svgRef.current = node;

    if (node !== null) {
      return;
    }

    if (debounceTimerRef.current !== null) {
      window.cancelAnimationFrame(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (touchResetTimeoutRef.current !== null) {
      window.clearTimeout(touchResetTimeoutRef.current);
      touchResetTimeoutRef.current = null;
    }

    lastPointRef.current = null;
  }, []);

  const handleInteraction = useCallback(
    (clientX: number) => {
      if (!svgRef.current) return;

      if (debounceTimerRef.current !== null) {
        window.cancelAnimationFrame(debounceTimerRef.current);
      }

      debounceTimerRef.current = window.requestAnimationFrame(() => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const interactionX = clientX - rect.left;

        const nearestPoint = data.pointPositions.reduce((nearest, current) => {
          const currentDistance = Math.abs(current.x - interactionX);
          const nearestDistance = Math.abs(nearest.x - interactionX);
          return currentDistance < nearestDistance ? current : nearest;
        });

        if (lastPointRef.current !== nearestPoint.index) {
          lastPointRef.current = nearestPoint.index;
          onHover({
            index: nearestPoint.index,
            value: nearestPoint.value,
            timestamp: nearestPoint.timestamp,
            position: {
              x: rect.left + nearestPoint.x + window.scrollX,
              y:
                rect.top +
                nearestPoint.y -
                config.TOOLTIP_OFFSET +
                window.scrollY,
            },
            status: nearestPoint.status as string,
            source: nearestPoint.source as Lab,
            unit: nearestPoint.unit,
            comparatorLabel: nearestPoint.comparatorLabel,
            file: nearestPoint.file,
          });
        }
      });
    },
    [data.pointPositions, onHover, config.TOOLTIP_OFFSET],
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
      lastPointRef.current = null;
      onHoverEnd();

      if (touchResetTimeoutRef.current !== null) {
        window.clearTimeout(touchResetTimeoutRef.current);
      }

      touchResetTimeoutRef.current = window.setTimeout(() => {
        isTouchDevice.current = false;
        touchResetTimeoutRef.current = null;
      }, 300);
    },
    [onHoverEnd],
  );

  const handleMouseLeave = useCallback(() => {
    if (!isTouchDevice.current) {
      if (debounceTimerRef.current !== null) {
        window.cancelAnimationFrame(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      lastPointRef.current = null;
      onHoverEnd();
    }
  }, [onHoverEnd]);

  if (!meta.hasData) {
    return <div className="relative flex overflow-visible" />;
  }

  const hoveredCircles = data.pointPositions
    .filter((pos, index) => hoveredPointIndex === index && !pos.comparatorLabel)
    .map((position) => (
      <circle
        key={`${position.timestamp}-outline`}
        cx={position.x}
        cy={position.y}
        r={config.CIRCLE_RADIUS + 2}
        fill="none"
        stroke={
          STATUS_TO_COLOR[position.status as keyof typeof STATUS_TO_COLOR]
        }
        strokeWidth={4}
        strokeOpacity={0.4}
      />
    ));

  return (
    <div className="relative flex overflow-visible">
      <svg
        ref={setSvgRef}
        width={svgWidth}
        height={config.SVG_HEIGHT}
        className="touch-manipulation overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {data.backgroundRect && (
          <rect
            x={data.backgroundRect.x}
            y={data.backgroundRect.y}
            width={data.backgroundRect.width}
            height={data.backgroundRect.height}
            fill={data.backgroundRect.fill}
            opacity={data.backgroundRect.opacity}
          />
        )}
        {data.lines.map((line) => (
          <line
            key={line.key}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.stroke}
            strokeWidth={line.strokeWidth}
            strokeLinecap={line.strokeLinecap}
            opacity={line.opacity}
          />
        ))}
        {hoveredCircles}
        {data.circles.map((circle) => (
          <circle
            key={circle.key}
            cx={circle.cx}
            cy={circle.cy}
            r={circle.r}
            fill={circle.fill}
            stroke={circle.stroke}
            strokeWidth={circle.strokeWidth}
          />
        ))}
        {data.pills.map((pill) => {
          const isHovered = hoveredPointIndex === pill.pointIndex;
          const rx = pill.width / 2;
          return (
            <g key={pill.key}>
              {isHovered && (
                <rect
                  x={pill.x - 2}
                  y={pill.yTop - 2}
                  width={pill.width + 4}
                  height={pill.height + 4}
                  rx={rx + 2}
                  fill={pill.color}
                  opacity={0.25}
                />
              )}
              <rect
                x={pill.x}
                y={pill.yTop}
                width={pill.width}
                height={pill.height}
                rx={rx}
                fill={pill.color}
                stroke="white"
                strokeWidth={config.STROKE_WIDTH}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const SparklineChart = ({
  biomarker,
  maxValuesToShow = 4,
}: {
  biomarker: Biomarker;
  maxValuesToShow?: number;
}) => {
  const isMobile = useIsMobile();
  const svgWidth = isMobile
    ? CHART_CONFIG.SVG_WIDTH_MOBILE
    : CHART_CONFIG.SVG_WIDTH_DESKTOP;

  const { rangeStack } = useSparklineChart({
    biomarker,
    maxValuesToShow,
    svgWidth,
  });
  const [displayedPoint, setDisplayedPoint] =
    useState<SparklineDisplayedPoint | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      return;
    }

    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handlePointHover = useCallback((point: SparklineDisplayedPoint) => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    setDisplayedPoint(point);
  }, []);

  const hideDisplayedPoint = useCallback(() => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = window.setTimeout(() => {
      setDisplayedPoint(null);
      hideTimeoutRef.current = null;
    }, 100);
  }, []);

  const handleTooltipMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    hideDisplayedPoint();
  }, [hideDisplayedPoint]);

  return (
    <div
      ref={setContainerRef}
      style={{
        maskImage: 'linear-gradient(to right, transparent 20%, black 35%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 20%, black 35%)',
      }}
      className="relative flex items-center justify-end gap-0 overflow-visible"
    >
      <div className="relative py-1">
        <SparklineLineChart
          biomarker={biomarker}
          maxValuesToShow={maxValuesToShow}
          svgWidth={svgWidth}
          onHover={handlePointHover}
          onHoverEnd={hideDisplayedPoint}
          hoveredPointIndex={displayedPoint?.index ?? null}
        />
      </div>
      <RangeStack
        range={rangeStack.range}
        values={rangeStack.values}
        dimensions={rangeStack.dimensions}
      />

      {displayedPoint &&
        createPortal(
          <ChartTooltip
            isOpen={true}
            position={displayedPoint.position}
            side="top"
            interactive={true}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <div className="flex items-center gap-2">
              <div
                className="size-3 shrink-0 rounded-full border border-white"
                style={{
                  backgroundColor:
                    STATUS_TO_COLOR[
                      displayedPoint.status as keyof typeof STATUS_TO_COLOR
                    ],
                }}
              />
              <div className="text-xs">
                <div className="font-semibold">
                  {displayedPoint.comparatorLabel ??
                    displayedPoint.value.toFixed(2)}{' '}
                  {displayedPoint.unit || biomarker.unit}
                </div>
                <div className="text-muted-foreground">
                  {format(new Date(displayedPoint.timestamp), 'MMM dd, yyyy')} (
                  <TooltipSource
                    source={displayedPoint.source}
                    file={displayedPoint.file}
                  />
                  )
                </div>
              </div>
            </div>
          </ChartTooltip>,
          document.body,
        )}
    </div>
  );
};
