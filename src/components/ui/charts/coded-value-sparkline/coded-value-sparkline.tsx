import { format } from 'date-fns';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { STATUS_TO_COLOR } from '@/const/status-to-color';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Biomarker } from '@/types/api';

import { ChartTooltip } from '../chart-tooltip';
import { CHART_CONFIG } from '../sparkline-chart/config';
import { TooltipSource } from '../tooltip-source';

import { useCodedValueSparkline } from './use-coded-value-sparkline';

const RANGE_STACK_WIDTH = 3;

interface CodedValueSparklineDisplayedPoint {
  index: number;
  codedValue: string;
  timestamp: string;
  position: { x: number; y: number };
  status: string;
  source: string;
  file?: { id: string; name: string };
}

// Inner SVG chart for codedValue sparkline in the data table.
// Renders circles for each discrete coded value positioned in horizontal bands.
const CodedValueSparklineChart = ({
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
    codedValue: string;
    timestamp: string;
    position: { x: number; y: number };
    status: string;
    source: string;
    file?: { id: string; name: string };
  }) => void;
  onHoverEnd: () => void;
  hoveredPointIndex?: number | null;
}) => {
  const { meta, data, config } = useCodedValueSparkline({
    biomarker,
    maxValuesToShow,
    svgWidth,
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const lastPointRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | undefined>(undefined);
  const isTouchDevice = useRef<boolean>(false);

  const handleInteraction = useCallback(
    (clientX: number) => {
      if (!svgRef.current || !data.pointPositions.length) return;

      if (debounceTimerRef.current) {
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
            codedValue: nearestPoint.codedValue,
            timestamp: nearestPoint.timestamp,
            position: {
              x: rect.left + nearestPoint.x + window.scrollX,
              y:
                rect.top +
                nearestPoint.y -
                config.TOOLTIP_OFFSET +
                window.scrollY,
            },
            status: nearestPoint.status,
            source: nearestPoint.source,
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
      lastPointRef.current = null;
      onHoverEnd();

      setTimeout(() => {
        isTouchDevice.current = false;
      }, 300);
    },
    [onHoverEnd],
  );

  const handleMouseLeave = useCallback(() => {
    if (!isTouchDevice.current) {
      if (debounceTimerRef.current) {
        window.cancelAnimationFrame(debounceTimerRef.current);
        debounceTimerRef.current = undefined;
      }
      lastPointRef.current = null;
      onHoverEnd();
    }
  }, [onHoverEnd]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.cancelAnimationFrame(debounceTimerRef.current);
      }
    };
  }, []);

  if (!meta.hasData) {
    return <div className="relative flex overflow-visible" />;
  }

  const hoveredCircles = data.pointPositions
    .filter((_, index) => hoveredPointIndex === index)
    .map((position) => (
      <circle
        key={`${position.timestamp}-outline`}
        cx={position.x}
        cy={position.y}
        r={config.CIRCLE_RADIUS + 2}
        fill="none"
        stroke={
          position.status === 'optimal'
            ? STATUS_TO_COLOR.optimal
            : STATUS_TO_COLOR.high
        }
        strokeWidth={4}
        strokeOpacity={0.4}
      />
    ));

  return (
    <div className="relative flex overflow-visible">
      <svg
        ref={svgRef}
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
      </svg>
    </div>
  );
};

// Data table sparkline for codedValue biomarkers. Wraps the inner chart with a
// CSS fade-in mask on the left, a vertical range stack on the right showing
// optimal/abnormal bands, and a portal tooltip on hover.
export const CodedValueSparkline = ({
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

  const { rangeStack, config } = useCodedValueSparkline({
    biomarker,
    maxValuesToShow,
    svgWidth,
  });

  const [displayedPoint, setDisplayedPoint] =
    useState<CodedValueSparklineDisplayedPoint | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current !== null) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const handlePointHover = useCallback(
    (point: CodedValueSparklineDisplayedPoint) => {
      if (hideTimeoutRef.current !== null) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      setDisplayedPoint(point);
    },
    [],
  );

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
      style={{
        maskImage: 'linear-gradient(to right, transparent 20%, black 35%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 20%, black 35%)',
      }}
      className="relative flex items-center justify-end gap-0 overflow-visible"
    >
      <div className="relative py-1">
        <CodedValueSparklineChart
          biomarker={biomarker}
          maxValuesToShow={maxValuesToShow}
          svgWidth={svgWidth}
          onHover={handlePointHover}
          onHoverEnd={hideDisplayedPoint}
          hoveredPointIndex={displayedPoint?.index ?? null}
        />
      </div>
      <svg
        width={RANGE_STACK_WIDTH}
        height={config.SVG_HEIGHT}
        className="overflow-visible"
      >
        {rangeStack.map((segment, index) => (
          <rect
            key={index}
            x={0}
            y={segment.y}
            width={RANGE_STACK_WIDTH}
            height={segment.height}
            fill={segment.color}
            rx={RANGE_STACK_WIDTH / 2}
          />
        ))}
      </svg>

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
