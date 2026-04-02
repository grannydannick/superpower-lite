import { useCallback, useMemo } from 'react';

import {
  getBiomarkerRanges,
  getRangesBySource,
} from '@/components/ui/charts/utils/get-biomarker-ranges';
import { getNewestValue } from '@/components/ui/charts/utils/get-newest-value';
import { STATUS_TO_COLOR } from '@/const/status-to-color';
import type { Biomarker } from '@/types/api';
import { getComparatorRange } from '@/utils/get-comparator-range';
import { getDisplayComparator } from '@/utils/get-display-comparator';

import type { ChartDimensions } from '../types/chart';
import {
  calculateChartDimensions,
  convertValueToY,
  mapValueAcrossDimensions,
} from '../utils/chart-dimensions';
import { getValueStatus } from '../utils/get-value-status';

import { CHART_CONFIG } from './config';
import type {
  Circle,
  LineSegment,
  Pill,
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
    // For one-sided "<=X" ranges (e.g. Metamyelocyte <=0), optimalLow is 0 so
    // top and bottom would be equal, yielding zero-height rect. Extend bottom
    // to chartMinValue to make the green background zone visible.
    const bottom =
      dimensions.optimalLow <= 0
        ? dimensions.chartMinValue
        : dimensions.optimalLow;
    return { top: dimensions.optimalHigh, bottom };
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
        .map((v) => v.quantity?.value ?? 0)
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
        // Map this value from its own source dimensions to the base dimensions
        const srcRanges =
          getRangesBySource(biomarker, (v.source as any) || 'quest') || ranges;
        const srcDims = calculateChartDimensions(
          srcRanges,
          sortedValues.map((sv) => sv.quantity?.value ?? 0),
          CHART_CONFIG.RANGE_EXTENSION_FACTOR,
        );
        const rawValue = v.quantity?.value ?? 0;
        const comparator = v.quantity?.comparator;
        const compRange =
          comparator && comparator !== 'EQUALS'
            ? getComparatorRange(comparator, rawValue, dimensions.chartMaxValue)
            : undefined;

        // For comparator quantities, use midpoint of the range so the line
        // connects to the center of the pill (same approach as range-sparkline).
        const valueForY = compRange
          ? (compRange.low + compRange.high) / 2
          : rawValue;
        const mapped = mapValueAcrossDimensions(valueForY, srcDims, dimensions);
        const y =
          (valueToY(mapped) / 100) * (SVG_HEIGHT - 2 * PADDING) + PADDING;

        const comparatorLabel = compRange
          ? `${getDisplayComparator(comparator)}${rawValue}`
          : undefined;

        return {
          x: Number.isFinite(x) ? x : svgWidth / 2,
          y: Number.isFinite(y) ? y : SVG_HEIGHT / 2,
          value: rawValue,
          timestamp: v.timestamp,
          index,
          source: v.source || 'quest',
          unit: v.quantity?.unit,
          file: v.file,
          status: getValueStatus(srcDims, rawValue, newestValueInfo),
          comparatorLabel,
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
      biomarker,
      ranges,
    ],
  );

  const chartData = useMemo(() => {
    if (!sortedValues.length) {
      return { lines: [], circles: [], pills: [], backgroundRect: null };
    }

    const lastValue = sortedValues[sortedValues.length - 1];
    const lastSrcRanges =
      getRangesBySource(biomarker, (lastValue.source as any) || 'quest') ||
      ranges;
    const lastSrcDims = calculateChartDimensions(
      lastSrcRanges,
      sortedValues.map((sv) => sv.quantity?.value ?? 0),
      CHART_CONFIG.RANGE_EXTENSION_FACTOR,
    );
    const lastMapped = mapValueAcrossDimensions(
      lastValue.quantity?.value ?? 0,
      lastSrcDims,
      dimensions,
    );
    const lastValueStatus = getValueStatus(
      dimensions,
      lastMapped,
      newestValueInfo,
    );
    const rangeBounds = getRangeBackgroundBounds(dimensions, lastMapped);

    const PILL_WIDTH = 10;
    const lines: LineSegment[] = [];
    const circles: Circle[] = [];
    const pills: Pill[] = [];

    const topY =
      (valueToY(rangeBounds.top) / 100) * (SVG_HEIGHT - 2 * PADDING) + PADDING;
    const bottomY =
      (valueToY(rangeBounds.bottom) / 100) * (SVG_HEIGHT - 2 * PADDING) +
      PADDING;
    const rectY = Math.min(topY, bottomY);
    const rectHeight = Math.abs(bottomY - topY);

    if (sortedValues.length > 0) {
      const firstValue = sortedValues[0];
      const firstPos = pointPositions[0];
      const y = firstPos?.y;

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
                (() => {
                  const srcRanges =
                    getRangesBySource(
                      biomarker,
                      (firstValue.source as any) || 'quest',
                    ) || ranges;
                  const srcDims = calculateChartDimensions(
                    srcRanges,
                    sortedValues.map((sv) => sv.quantity?.value ?? 0),
                    CHART_CONFIG.RANGE_EXTENSION_FACTOR,
                  );
                  const mapped = mapValueAcrossDimensions(
                    firstValue.quantity?.value ?? 0,
                    srcDims,
                    dimensions,
                  );
                  return getValueStatus(
                    dimensions,
                    mapped,
                    newestValueInfo,
                  ) as keyof typeof STATUS_TO_COLOR;
                })()
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
                (() => {
                  const srcRanges =
                    getRangesBySource(
                      biomarker,
                      (firstValue.source as any) || 'quest',
                    ) || ranges;
                  const srcDims = calculateChartDimensions(
                    srcRanges,
                    sortedValues.map((sv) => sv.quantity?.value ?? 0),
                    CHART_CONFIG.RANGE_EXTENSION_FACTOR,
                  );
                  const mapped = mapValueAcrossDimensions(
                    firstValue.quantity?.value ?? 0,
                    srcDims,
                    dimensions,
                  );
                  return getValueStatus(
                    dimensions,
                    mapped,
                    newestValueInfo,
                  ) as keyof typeof STATUS_TO_COLOR;
                })()
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

      const color = STATUS_TO_COLOR[status as keyof typeof STATUS_TO_COLOR];
      const comparator = v.quantity?.comparator;
      const compRange =
        comparator && comparator !== 'EQUALS'
          ? getComparatorRange(
              comparator,
              v.quantity?.value ?? 0,
              dimensions.chartMaxValue,
            )
          : undefined;

      if (compRange) {
        const srcRanges =
          getRangesBySource(biomarker, (v.source as any) || 'quest') || ranges;
        const srcDims = calculateChartDimensions(
          srcRanges,
          sortedValues.map((sv) => sv.quantity?.value ?? 0),
          CHART_CONFIG.RANGE_EXTENSION_FACTOR,
        );
        const mappedLow = mapValueAcrossDimensions(
          compRange.low,
          srcDims,
          dimensions,
        );
        const mappedHigh = mapValueAcrossDimensions(
          compRange.high,
          srcDims,
          dimensions,
        );
        const yLow =
          (valueToY(mappedLow) / 100) * (SVG_HEIGHT - 2 * PADDING) + PADDING;
        const yHigh =
          (valueToY(mappedHigh) / 100) * (SVG_HEIGHT - 2 * PADDING) + PADDING;
        const pillHeight = Math.max(4, Math.abs(yLow - yHigh));

        pills.push({
          key: `pill-${v.timestamp}-${index}`,
          x: x - PILL_WIDTH / 2,
          yTop: Math.min(yHigh, yLow),
          height: pillHeight,
          width: PILL_WIDTH,
          color,
          pointIndex: index,
        });
      } else {
        const circleRadius =
          sortedValues.length === 1 ? CIRCLE_RADIUS + 1 : CIRCLE_RADIUS;

        circles.push({
          key: `${v.timestamp}-${index}`,
          cx: x,
          cy: y,
          r: circleRadius,
          fill: color,
          stroke: 'white',
          strokeWidth: STROKE_WIDTH,
        });
      }

      if (index < sortedValues.length - 1) {
        const nextValue = sortedValues[index + 1];
        const nextPosition = pointPositions[index + 1];
        const x2 = PADDING * 6 + (index + 1) * xStep;
        const y2 = nextPosition?.y;

        if (!Number.isFinite(x2) || !Number.isFinite(y2)) {
          return;
        }

        const intersections: Array<{ x: number; y: number; mapped: number }> =
          [];

        // Compute mapped numeric values in base dimension space
        const startSrcRanges =
          getRangesBySource(biomarker, (v.source as any) || 'quest') || ranges;
        const startSrcDims = calculateChartDimensions(
          startSrcRanges,
          sortedValues.map((sv) => sv.quantity?.value ?? 0),
          CHART_CONFIG.RANGE_EXTENSION_FACTOR,
        );
        const startMapped = mapValueAcrossDimensions(
          v.quantity?.value ?? 0,
          startSrcDims,
          dimensions,
        );

        const endSrcRanges =
          getRangesBySource(biomarker, (nextValue.source as any) || 'quest') ||
          ranges;
        const endSrcDims = calculateChartDimensions(
          endSrcRanges,
          sortedValues.map((sv) => sv.quantity?.value ?? 0),
          CHART_CONFIG.RANGE_EXTENSION_FACTOR,
        );
        const endMapped = mapValueAcrossDimensions(
          nextValue.quantity?.value ?? 0,
          endSrcDims,
          dimensions,
        );

        intersections.push({ x, y, mapped: startMapped });

        const rangeBoundaries = [
          dimensions.optimalLow,
          dimensions.optimalHigh,
          dimensions.normalLow,
          dimensions.normalHigh,
        ].sort((a, b) => a - b);

        const minMapped = Math.min(startMapped, endMapped);
        const maxMapped = Math.max(startMapped, endMapped);

        for (const boundary of rangeBoundaries) {
          if (boundary > minMapped && boundary < maxMapped) {
            const t = (boundary - startMapped) / (endMapped - startMapped);
            const intersectionX = x + t * (x2 - x);
            const intersectionY = y + t * (y2 - y);

            if (
              Number.isFinite(intersectionX) &&
              Number.isFinite(intersectionY)
            ) {
              intersections.push({
                x: intersectionX,
                y: intersectionY,
                mapped: boundary,
              });
            }
          }
        }

        intersections.push({ x: x2, y: y2, mapped: endMapped });

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
            // skip invalid
          } else {
            let segmentStatus: keyof typeof STATUS_TO_COLOR;

            if (intersections.length === 2 && status === nextPosition.status) {
              segmentStatus = status as keyof typeof STATUS_TO_COLOR;
            } else {
              const midMapped = (segment.mapped + nextSegment.mapped) / 2;
              segmentStatus = getValueStatus(
                dimensions,
                midMapped,
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

    return { lines, circles, pills, backgroundRect };
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
    biomarker,
    ranges,
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
      values: sortedValues.map((v) => v.quantity?.value ?? 0),
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
      pills: chartData.pills,
      backgroundRect: chartData.backgroundRect,
    },
    rangeStack,
    config,
  };
};
