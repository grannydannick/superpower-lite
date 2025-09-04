import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { STATUS_TO_COLOR } from '@/const/status-to-color';
import { useIsMobile } from '@/hooks/use-mobile';
import { Biomarker, Lab } from '@/types/api';

import { ChartTooltip } from '../chart-tooltip';
import { RangeStack } from '../range-stack';

import { CHART_CONFIG } from './config';
import { useSparklineChart } from './use-sparkline-chart';

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
  const debounceTimerRef = useRef<number>();
  const isTouchDevice = useRef<boolean>(false);

  const handleInteraction = useCallback(
    (clientX: number) => {
      if (!svgRef.current) return;

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
          STATUS_TO_COLOR[position.status as keyof typeof STATUS_TO_COLOR]
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
  const [displayedPoint, setDisplayedPoint] = useState<{
    index: number;
    value: number;
    timestamp: string;
    position: { x: number; y: number };
    status: string;
    source: Lab;
  } | null>(null);

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
        <SparklineLineChart
          biomarker={biomarker}
          maxValuesToShow={maxValuesToShow}
          svgWidth={svgWidth}
          onHover={setDisplayedPoint}
          onHoverEnd={() => setDisplayedPoint(null)}
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
                  {displayedPoint.value.toFixed(1)} {biomarker.unit}
                </div>
                <div className="text-muted-foreground">
                  {moment(displayedPoint.timestamp).format('MMM DD, YYYY')} (
                  <span className="capitalize">{displayedPoint.source})</span>
                </div>
              </div>
            </div>
          </ChartTooltip>,
          document.body,
        )}
    </div>
  );
};
