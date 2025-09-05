import { useCallback, useMemo } from 'react';

import { getBiomarkerRanges } from '@/components/ui/charts/utils/get-biomarker-ranges';
import { getNewestValue } from '@/components/ui/charts/utils/get-newest-value';
import { getValueStatus } from '@/components/ui/charts/utils/get-value-status';
import { STATUS_TO_COLOR } from '@/const/status-to-color';
import type { Biomarker } from '@/types/api';

import type { ChartDimensions } from '../types/chart';
import {
  calculateChartDimensions,
  convertValueToY,
} from '../utils/chart-dimensions';

import { CHART_CONFIG } from './config';
import type {
  Circle,
  LineSegment,
  RangeBackgroundBounds,
} from './types/sparkline-chart';

const getRangeBackgroundBounds = (
  dimensions: ChartDimensions,
  value: number,
): RangeBackgroundBounds => {
  const hasNormalRange =
    dimensions.normalLow !== dimensions.optimalLow ||
    dimensions.normalHigh !== dimensions.optimalHigh;

  if (value >= dimensions.optimalLow && value <= dimensions.optimalHigh) {
    return { top: dimensions.optimalHigh, bottom: dimensions.optimalLow };
  }

  if (hasNormalRange) {
    if (value >= dimensions.normalLow && value <= dimensions.normalHigh) {
      if (value > dimensions.optimalHigh) {
        return { top: dimensions.normalHigh, bottom: dimensions.optimalHigh };
      } else if (value < dimensions.optimalLow) {
        return { top: dimensions.optimalLow, bottom: dimensions.normalLow };
      }
    }
  }

  if (value < Math.min(dimensions.normalLow, dimensions.optimalLow)) {
    const minLow = Math.min(dimensions.normalLow, dimensions.optimalLow);
    const maxHigh = Math.max(dimensions.normalHigh, dimensions.optimalHigh);
    return {
      top: minLow,
      bottom: Math.max(
        dimensions.chartMinValue,
        value - (maxHigh - minLow) / 2,
      ),
    };
  }

  if (value > Math.max(dimensions.normalHigh, dimensions.optimalHigh)) {
    const minLow = Math.min(dimensions.normalLow, dimensions.optimalLow);
    const maxHigh = Math.max(dimensions.normalHigh, dimensions.optimalHigh);
    return {
      top: Math.min(dimensions.chartMaxValue, value + (maxHigh - minLow) / 2),
      bottom: maxHigh,
    };
  }

  return { top: dimensions.optimalHigh, bottom: dimensions.optimalLow };
};

export const useSparklineChart = ({
  biomarker,
  maxValuesToShow,
  svgWidth,
}: {
  biomarker: Biomarker;
  maxValuesToShow: number;
  svgWidth: number;
}) => {
  const { value } = biomarker;

  const { ranges, sortedValues: allSortedValues } =
    getBiomarkerRanges(biomarker);

  const newestValueInfo = useMemo(() => getNewestValue(value), [value]);

  // Limit to most recent values for chart display based on max values to show const, oldest first for chronological rendering inside the chart
  const sortedValues = useMemo(
    () => allSortedValues.slice(0, maxValuesToShow).reverse(),
    [allSortedValues, maxValuesToShow],
  );

  const dimensions = useMemo(() => {
    return calculateChartDimensions(
      ranges,
      sortedValues
        .map((v) => v.quantity.value)
        .filter((v) => Number.isFinite(v)),
      CHART_CONFIG.RANGE_EXTENSION_FACTOR,
    );
  }, [ranges, sortedValues]);

  const valueToY = useCallback(
    (val: number) => convertValueToY(dimensions, val),
    [dimensions],
  );

  const { SVG_HEIGHT, PADDING, CIRCLE_RADIUS, STROKE_WIDTH } = CHART_CONFIG;
  const xStep =
    sortedValues.length > 1
      ? (svgWidth - PADDING * 8) / (sortedValues.length - 1)
      : 0;

  const pointPositions = useMemo(
    () =>
      sortedValues.map((v, index) => {
        const x =
          sortedValues.length === 1
            ? svgWidth - PADDING * 6
            : PADDING * 6 + index * xStep;
        const y =
          (valueToY(v.quantity.value) / 100) * (SVG_HEIGHT - 2 * PADDING) +
          PADDING;

        return {
          x: Number.isFinite(x) ? x : svgWidth / 2,
          y: Number.isFinite(y) ? y : SVG_HEIGHT / 2,
          value: v.quantity.value,
          timestamp: v.timestamp,
          index,
          source: v.source || 'quest',
          status: getValueStatus(dimensions, v.quantity.value, newestValueInfo),
        };
      }),
    [
      sortedValues,
      svgWidth,
      PADDING,
      xStep,
      valueToY,
      SVG_HEIGHT,
      dimensions,
      newestValueInfo,
    ],
  );

  const chartData = useMemo(() => {
    if (!sortedValues.length) {
      return { lines: [], circles: [], backgroundRect: null };
    }

    const lastValue = sortedValues[sortedValues.length - 1];
    const lastValueStatus = getValueStatus(
      dimensions,
      lastValue.quantity.value,
      newestValueInfo,
    );
    const rangeBounds = getRangeBackgroundBounds(
      dimensions,
      lastValue.quantity.value,
    );

    const lines: LineSegment[] = [];
    const circles: Circle[] = [];

    const topY =
      (valueToY(rangeBounds.top) / 100) * (SVG_HEIGHT - 2 * PADDING) + PADDING;
    const bottomY =
      (valueToY(rangeBounds.bottom) / 100) * (SVG_HEIGHT - 2 * PADDING) +
      PADDING;
    const rectY = Math.min(topY, bottomY);
    const rectHeight = Math.abs(bottomY - topY);

    if (sortedValues.length > 0) {
      const firstValue = sortedValues[0];
      const y =
        (valueToY(firstValue.quantity.value) / 100) *
          (SVG_HEIGHT - 2 * PADDING) +
        PADDING;

      if (Number.isFinite(y)) {
        if (sortedValues.length === 1) {
          lines.push({
            key: 'lead-in',
            x1: 0,
            y1: y,
            x2: svgWidth - PADDING * 6,
            y2: y,
            stroke:
              STATUS_TO_COLOR[
                getValueStatus(
                  dimensions,
                  firstValue.quantity.value,
                  newestValueInfo,
                ) as keyof typeof STATUS_TO_COLOR
              ],
            strokeWidth: STROKE_WIDTH,
            strokeLinecap: 'round',
            opacity: 0.6,
          });
        } else {
          lines.push({
            key: 'lead-in',
            x1: 0,
            y1: y,
            x2: PADDING * 6,
            y2: y,
            stroke:
              STATUS_TO_COLOR[
                getValueStatus(
                  dimensions,
                  firstValue.quantity.value,
                  newestValueInfo,
                ) as keyof typeof STATUS_TO_COLOR
              ],
            strokeWidth: STROKE_WIDTH,
            strokeLinecap: 'round',
            opacity: 0.6,
          });
        }
      }
    }

    sortedValues.forEach((v, index) => {
      const position = pointPositions[index];
      const { x, y, status } = position;

      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
      }

      const circleRadius =
        sortedValues.length === 1 ? CIRCLE_RADIUS + 1 : CIRCLE_RADIUS;

      circles.push({
        key: `${v.timestamp}-${index}`,
        cx: x,
        cy: y,
        r: circleRadius,
        fill: STATUS_TO_COLOR[status as keyof typeof STATUS_TO_COLOR],
        stroke: 'white',
        strokeWidth: STROKE_WIDTH,
      });

      if (index < sortedValues.length - 1) {
        const nextValue = sortedValues[index + 1];
        const nextPosition = pointPositions[index + 1];
        const x2 = PADDING * 6 + (index + 1) * xStep;
        const y2 =
          (valueToY(nextValue.quantity.value) / 100) *
            (SVG_HEIGHT - 2 * PADDING) +
          PADDING;

        if (!Number.isFinite(x2) || !Number.isFinite(y2)) {
          return;
        }

        const intersections: Array<{ x: number; y: number; value: number }> =
          [];

        intersections.push({ x, y, value: v.quantity.value });

        const rangeBoundaries = [
          dimensions.optimalLow,
          dimensions.optimalHigh,
          dimensions.normalLow,
          dimensions.normalHigh,
        ].sort((a, b) => a - b);

        const startValue = v.quantity.value;
        const endValue = nextValue.quantity.value;
        const minValue = Math.min(startValue, endValue);
        const maxValue = Math.max(startValue, endValue);

        for (const boundary of rangeBoundaries) {
          if (boundary > minValue && boundary < maxValue) {
            const t = (boundary - startValue) / (endValue - startValue);
            const intersectionX = x + t * (x2 - x);
            const intersectionY = y + t * (y2 - y);

            if (
              Number.isFinite(intersectionX) &&
              Number.isFinite(intersectionY)
            ) {
              intersections.push({
                x: intersectionX,
                y: intersectionY,
                value: boundary,
              });
            }
          }
        }

        intersections.push({ x: x2, y: y2, value: nextValue.quantity.value });

        intersections.sort((a, b) => a.x - b.x);

        for (let i = 0; i < intersections.length - 1; i += 1) {
          const segment = intersections[i];
          const nextSegment = intersections[i + 1];

          if (
            !Number.isFinite(segment.x) ||
            !Number.isFinite(segment.y) ||
            !Number.isFinite(nextSegment.x) ||
            !Number.isFinite(nextSegment.y)
          ) {
            // Continue with next iteration
          } else {
            let segmentStatus: keyof typeof STATUS_TO_COLOR;

            // If this is a direct line between two points (no intersections) and both points have the same status,
            // use that status for the line
            if (intersections.length === 2 && status === nextPosition.status) {
              segmentStatus = status as keyof typeof STATUS_TO_COLOR;
            } else {
              // Otherwise, use the midpoint calculation
              const segmentValue = (segment.value + nextSegment.value) / 2;
              segmentStatus = getValueStatus(
                dimensions,
                segmentValue,
                newestValueInfo,
              );
            }

            lines.push({
              key: `line-${v.timestamp}-${index}-${i}`,
              x1: segment.x,
              y1: segment.y,
              x2: nextSegment.x,
              y2: nextSegment.y,
              stroke:
                STATUS_TO_COLOR[segmentStatus as keyof typeof STATUS_TO_COLOR],
              strokeWidth: STROKE_WIDTH,
              strokeLinecap: 'round',
            });
          }
        }
      }
    });

    const backgroundRect =
      rectHeight > 0 &&
      Number.isFinite(rectY) &&
      Number.isFinite(rectHeight) &&
      ranges.length > 0
        ? {
            x: -3,
            y: rectY,
            width: svgWidth,
            height: rectHeight,
            fill: STATUS_TO_COLOR[
              lastValueStatus as keyof typeof STATUS_TO_COLOR
            ],
            opacity: 0.1,
          }
        : null;

    return { lines, circles, backgroundRect };
  }, [
    sortedValues,
    dimensions,
    pointPositions,
    valueToY,
    svgWidth,
    SVG_HEIGHT,
    PADDING,
    CIRCLE_RADIUS,
    STROKE_WIDTH,
    xStep,
    newestValueInfo,
  ]);

  const meta = {
    hasData: sortedValues.length > 0,
    biomarkerName: biomarker.name,
    isSingleValue: sortedValues.length === 1,
  };

  const config = {
    SVG_WIDTH: svgWidth,
    SVG_HEIGHT,
    PADDING,
    CIRCLE_RADIUS,
    STROKE_WIDTH,
    TOOLTIP_OFFSET: CHART_CONFIG.TOOLTIP_OFFSET,
  };

  const rangeStack = useMemo(() => {
    return {
      range: ranges,
      values: sortedValues.map((v) => v.quantity.value),
      dimensions,
    };
  }, [ranges, sortedValues, dimensions]);

  return {
    meta,
    data: {
      sortedValues,
      pointPositions,
      lines: chartData.lines,
      circles: chartData.circles,
      backgroundRect: chartData.backgroundRect,
    },
    rangeStack,
    config,
  };
};
