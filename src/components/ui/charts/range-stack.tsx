import { STATUS_TO_COLOR } from '@/const/status-to-color';
import { Range } from '@/types/api';

import { ChartDimensions } from './types/chart';
import {
  calculateChartDimensions,
  convertValueToY,
} from './utils/chart-dimensions';

const CHART_CONFIG = {
  SVG_HEIGHT: 64,
  PADDING: 8,
  RANGE_EXTENSION_FACTOR: 0.2,
  SEGMENT_GAP: 0.5,
  VERTICAL_WIDTH: 3,
  // Smallest visible segment. When a status zone's natural height falls below
  // this (e.g. a value just barely out-of-range producing a sliver of "low"),
  // bump it up to the minimum so the zone remains legible. Overflow pixels
  // are taken from the largest surviving segment.
  MIN_SEGMENT_HEIGHT: 4,
} as const;

interface RangeSegment {
  y: number;
  height: number;
  color: string;
}

// Bumps any non-zero entry below minHeight up to minHeight, subtracting the
// stolen pixels proportionally from the largest entries so total height is
// preserved. Zero entries stay zero (that zone does not apply).
const enforceMinHeight = (heights: number[], minHeight: number): number[] => {
  const active = heights.map((h) => h > 0);
  const needBump = heights.map((h, i) => active[i] && h < minHeight);
  const bumpCount = needBump.filter(Boolean).length;
  if (bumpCount === 0) return heights;

  const deficit = needBump.reduce(
    (sum, bump, i) => (bump ? sum + (minHeight - heights[i]) : sum),
    0,
  );

  const donors = heights
    .map((h, i) => ({ h, i }))
    .filter(({ h, i }) => active[i] && !needBump[i] && h > minHeight);
  const donorExcess = donors.reduce((sum, { h }) => sum + (h - minHeight), 0);

  return heights.map((h, i) => {
    if (needBump[i]) return minHeight;
    if (!active[i] || donorExcess === 0) return h;
    const excess = Math.max(0, h - minHeight);
    return h - (deficit * excess) / donorExcess;
  });
};

// Builds colored vertical segments for the range stack indicator bar.
// Walks the chart dimension zones from top to bottom (high -> normal -> optimal -> normal -> low).
// For one-sided "<=X" ranges where optimalLow <= 0, everything below optimalHigh
// is merged into a single green (optimal) segment extending to the chart bottom.
const getVerticalSegments = (
  dimensions: ChartDimensions,
  valueToY: (val: number) => number,
  svgHeight: number,
  padding: number,
  segmentGap: number,
  minSegmentHeight: number,
): RangeSegment[] => {
  const segments: RangeSegment[] = [];
  const {
    chartMaxValue,
    normalHigh,
    optimalHigh,
    optimalLow,
    normalLow,
    chartMinValue,
  } = dimensions;

  const hasNormalRange = normalLow !== optimalLow || normalHigh !== optimalHigh;

  const getY = (value: number) =>
    (valueToY(value) / 100) * (svgHeight - 2 * padding) + padding;

  if (hasNormalRange) {
    const ranges = [];

    const maxValue = Math.max(normalHigh, optimalHigh);
    const minValue = Math.min(normalLow, optimalLow);

    if (chartMaxValue > maxValue) {
      ranges.push({
        from: chartMaxValue,
        to: maxValue,
        color: STATUS_TO_COLOR.high,
      });
    }

    if (normalHigh > optimalHigh) {
      ranges.push({
        from: normalHigh,
        to: optimalHigh,
        color: STATUS_TO_COLOR.normal,
      });
    }

    ranges.push({
      from: optimalHigh,
      to: optimalLow,
      color: STATUS_TO_COLOR.optimal,
    });

    if (normalLow < optimalLow) {
      ranges.push({
        from: optimalLow,
        to: normalLow,
        color: STATUS_TO_COLOR.normal,
      });
    }

    if (chartMinValue < minValue) {
      ranges.push({
        from: minValue,
        to: chartMinValue,
        color: STATUS_TO_COLOR.low,
      });
    }

    // Compute natural pixel heights, then enforce a minimum so status zones
    // that exist (e.g. "low" for a value just below optimal) stay legible.
    const rawHeights = ranges.map((range) =>
      Math.max(0, getY(range.to) - getY(range.from) - segmentGap),
    );

    const adjustedHeights = enforceMinHeight(rawHeights, minSegmentHeight);

    let currentY = padding + segmentGap / 2;
    ranges.forEach((range, index) => {
      const height = adjustedHeights[index];
      if (height > 0) {
        segments.push({
          y: currentY,
          height,
          color: range.color,
        });
        currentY += height + segmentGap;
      }
    });
  } else {
    let currentY = padding;

    if (chartMaxValue > optimalHigh) {
      const optimalHighY = getY(optimalHigh);
      const height = Math.max(0, optimalHighY - currentY - segmentGap);
      if (height > 0) {
        segments.push({
          y: currentY,
          height,
          color: STATUS_TO_COLOR.high,
        });
        currentY = optimalHighY + segmentGap;
      }
    }

    const optimalHighY = getY(optimalHigh);
    const optimalLowY = getY(optimalLow);
    const optimalStartY = Math.max(currentY, optimalHighY) + segmentGap / 2;

    // For one-sided "<=X" ranges where optimalLow <= 0, merge the optimal
    // segment with the below-optimal area so everything below optimalHigh is green
    const isOneSidedHigh = optimalLow <= 0;

    if (isOneSidedHigh) {
      const height = Math.max(
        4,
        svgHeight - padding - optimalStartY - segmentGap,
      );
      if (height > 0) {
        segments.push({
          y: optimalStartY,
          height,
          color: STATUS_TO_COLOR.optimal,
        });
      }
    } else {
      const optimalHeight = Math.max(
        0,
        optimalLowY - optimalStartY - segmentGap,
      );
      if (optimalHeight > 0) {
        segments.push({
          y: optimalStartY,
          height: optimalHeight,
          color: STATUS_TO_COLOR.optimal,
        });
        currentY = optimalLowY + segmentGap;
      }

      if (chartMinValue < optimalLow) {
        const height = Math.max(0, svgHeight - padding - currentY - segmentGap);
        if (height > 0) {
          segments.push({
            y: currentY,
            height,
            color: STATUS_TO_COLOR.low,
          });
        }
      }
    }
  }

  return segments.filter((segment) => segment.height > 0);
};

export interface RangeStackProps {
  range: Range[];
  values: number[];
  height?: number;
  padding?: number;
  dimensions?: ChartDimensions;
  rangeExtensionFactor?: number;
}

// renders range stack (vertical lines) to represent the ranges. It also takes the values into consideration as out-of-range isn't defined in the range object.
export const RangeStack = ({
  range,
  values,
  height,
  padding,
  dimensions: providedDimensions,
  rangeExtensionFactor,
}: RangeStackProps) => {
  const svgHeight = height ?? CHART_CONFIG.SVG_HEIGHT;
  const svgPadding = padding ?? CHART_CONFIG.PADDING;
  const extensionFactor =
    rangeExtensionFactor ?? CHART_CONFIG.RANGE_EXTENSION_FACTOR;

  const dimensions =
    providedDimensions ??
    calculateChartDimensions(range, values, extensionFactor);
  const valueToY = (val: number) => convertValueToY(dimensions, val);
  const segments = getVerticalSegments(
    dimensions,
    valueToY,
    svgHeight,
    svgPadding,
    CHART_CONFIG.SEGMENT_GAP,
    CHART_CONFIG.MIN_SEGMENT_HEIGHT,
  );

  if (!segments.length) return null;

  return (
    <svg
      width={CHART_CONFIG.VERTICAL_WIDTH}
      height={svgHeight}
      className="overflow-visible"
    >
      {segments.map((segment) => (
        <rect
          key={`${segment.color}-${segment.y}-${segment.height}`}
          x={0}
          y={segment.y}
          width={CHART_CONFIG.VERTICAL_WIDTH}
          height={segment.height}
          fill={segment.color}
          rx={CHART_CONFIG.VERTICAL_WIDTH / 2}
        />
      ))}
    </svg>
  );
};
