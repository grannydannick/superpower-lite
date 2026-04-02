import { useCallback, useMemo } from 'react';

import { getBiomarkerRanges } from '@/components/ui/charts/utils/get-biomarker-ranges';
import { getNewestValue } from '@/components/ui/charts/utils/get-newest-value';
import { STATUS_TO_COLOR } from '@/const/status-to-color';
import type { Biomarker } from '@/types/api';

import { CHART_CONFIG } from '../sparkline-chart/config';
import {
  calculateChartDimensions,
  convertValueToY,
} from '../utils/chart-dimensions';
import { getValueStatus } from '../utils/get-value-status';

const getMidpoint = (low: number, high: number): number => (low + high) / 2;

// Computes sparkline geometry for range biomarkers in the data table.
// Range biomarkers have low/high pairs instead of single numeric values.
// Each value is rendered as a pill (rounded rect) spanning from yHigh to yLow,
// with connecting lines between midpoints. Uses the midpoint for status determination.
export const useRangeSparkline = ({
  biomarker,
  maxValuesToShow,
  svgWidth,
}: {
  biomarker: Biomarker;
  maxValuesToShow: number;
  svgWidth: number;
}) => {
  const { ranges, sortedValues: allSortedValues } =
    getBiomarkerRanges(biomarker);

  const newestValueInfo = useMemo(
    () => getNewestValue(biomarker.value),
    [biomarker.value],
  );

  const sortedValues = useMemo(
    () => allSortedValues.slice(0, maxValuesToShow).reverse(),
    [allSortedValues, maxValuesToShow],
  );

  const midpoints = useMemo(
    () =>
      sortedValues.map((v) => {
        if (v.valueRange)
          return getMidpoint(v.valueRange.low, v.valueRange.high);
        return v.quantity?.value ?? 0;
      }),
    [sortedValues],
  );

  // Include all low AND high values so the Y-axis spans the full range of every pill
  const allValues = useMemo(() => {
    const vals: number[] = [];
    sortedValues.forEach((v) => {
      if (v.valueRange) {
        vals.push(v.valueRange.low, v.valueRange.high);
      } else if (v.quantity) {
        vals.push(v.quantity.value);
      }
    });
    return vals.filter((v) => Number.isFinite(v));
  }, [sortedValues]);

  const dimensions = useMemo(
    () =>
      calculateChartDimensions(
        ranges,
        allValues,
        CHART_CONFIG.RANGE_EXTENSION_FACTOR,
      ),
    [ranges, allValues],
  );

  const valueToY = useCallback(
    (val: number) => convertValueToY(dimensions, val),
    [dimensions],
  );

  const { SVG_HEIGHT, PADDING, STROKE_WIDTH, CIRCLE_RADIUS } = CHART_CONFIG;
  const PILL_WIDTH = 8;

  const xStep =
    sortedValues.length > 1
      ? (svgWidth - PADDING * 8) / (sortedValues.length - 1)
      : 0;

  const toPixelY = useCallback(
    (val: number): number =>
      (valueToY(val) / 100) * (SVG_HEIGHT - 2 * PADDING) + PADDING,
    [valueToY, SVG_HEIGHT, PADDING],
  );

  const pointPositions = useMemo(
    () =>
      sortedValues.map((v, index) => {
        const mid = midpoints[index];
        const lowVal = v.valueRange?.low ?? mid;
        const highVal = v.valueRange?.high ?? mid;
        const x =
          sortedValues.length === 1
            ? svgWidth - PADDING * 6
            : PADDING * 6 + index * xStep;
        const yMid = toPixelY(mid);
        const yLow = toPixelY(lowVal);
        const yHigh = toPixelY(highVal);

        return {
          x: Number.isFinite(x) ? x : svgWidth / 2,
          y: Number.isFinite(yMid) ? yMid : SVG_HEIGHT / 2,
          yLow: Number.isFinite(yLow) ? yLow : SVG_HEIGHT / 2,
          yHigh: Number.isFinite(yHigh) ? yHigh : SVG_HEIGHT / 2,
          midpoint: mid,
          low: lowVal,
          high: highVal,
          unit: v.valueRange?.unit ?? biomarker.unit,
          timestamp: v.timestamp,
          index,
          source: v.source || 'quest',
          file: v.file,
          status: getValueStatus(dimensions, mid, newestValueInfo),
        };
      }),
    [
      sortedValues,
      midpoints,
      svgWidth,
      PADDING,
      xStep,
      toPixelY,
      SVG_HEIGHT,
      dimensions,
      newestValueInfo,
      biomarker.unit,
    ],
  );

  const chartData = useMemo(() => {
    if (!sortedValues.length) {
      return { lines: [], pills: [], backgroundRect: null };
    }

    const lines: Array<{
      key: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      stroke: string;
      strokeWidth: number;
      strokeLinecap: 'round' | 'butt' | 'square';
      opacity?: number;
    }> = [];

    const pills: Array<{
      key: string;
      x: number;
      yTop: number;
      height: number;
      width: number;
      color: string;
    }> = [];

    // Lead-in line from left edge to first pill
    const firstPos = pointPositions[0];
    if (firstPos && Number.isFinite(firstPos.y)) {
      const color =
        STATUS_TO_COLOR[firstPos.status as keyof typeof STATUS_TO_COLOR];
      lines.push({
        key: 'lead-in',
        x1: 0,
        y1: firstPos.y,
        x2: sortedValues.length === 1 ? firstPos.x : PADDING * 6,
        y2: firstPos.y,
        stroke: color,
        strokeWidth: STROKE_WIDTH,
        strokeLinecap: 'round',
        opacity: 0.6,
      });
    }

    pointPositions.forEach((pos, index) => {
      const color = STATUS_TO_COLOR[pos.status as keyof typeof STATUS_TO_COLOR];
      const naturalHeight = Math.abs(pos.yLow - pos.yHigh);

      // When the pixel span is too small to look like a proper pill,
      // render as a circle (dot) centered on the midpoint instead.
      const dotSize = CIRCLE_RADIUS * 2;
      const isSmallRange = naturalHeight < PILL_WIDTH * 2;
      const pillHeight = isSmallRange ? dotSize : naturalHeight;
      const pillWidth = isSmallRange ? dotSize : PILL_WIDTH;
      const yTop = isSmallRange
        ? pos.y - dotSize / 2
        : Math.min(pos.yHigh, pos.yLow);

      pills.push({
        key: `pill-${pos.timestamp}-${index}`,
        x: pos.x - pillWidth / 2,
        yTop,
        height: pillHeight,
        width: pillWidth,
        color,
      });

      // Connecting line between midpoints
      if (index < pointPositions.length - 1) {
        const nextPos = pointPositions[index + 1];
        const nextColor =
          STATUS_TO_COLOR[nextPos.status as keyof typeof STATUS_TO_COLOR];
        lines.push({
          key: `line-${pos.timestamp}-${index}`,
          x1: pos.x,
          y1: pos.y,
          x2: nextPos.x,
          y2: nextPos.y,
          stroke: nextColor,
          strokeWidth: STROKE_WIDTH,
          strokeLinecap: 'round',
        });
      }
    });

    // Background rect highlights the zone the newest value falls in
    const lastPos = pointPositions[pointPositions.length - 1];
    let backgroundRect = null;
    if (lastPos && ranges.length > 0) {
      const lastMid = lastPos.midpoint;
      const statusColor =
        STATUS_TO_COLOR[lastPos.status as keyof typeof STATUS_TO_COLOR];

      let topVal: number;
      let bottomVal: number;

      if (lastMid > dimensions.optimalHigh) {
        // Value is HIGH - highlight zone above optimal
        topVal = dimensions.chartMaxValue;
        bottomVal = dimensions.optimalHigh;
      } else if (lastMid < dimensions.optimalLow) {
        // Value is LOW - highlight zone below optimal
        topVal = dimensions.optimalLow;
        bottomVal = dimensions.chartMinValue;
      } else {
        // Value is in OPTIMAL zone
        topVal = dimensions.optimalHigh;
        bottomVal = dimensions.optimalLow;
      }

      const topY = toPixelY(topVal);
      const bottomY = toPixelY(bottomVal);
      const rectY = Math.min(topY, bottomY);
      const rectHeight = Math.abs(bottomY - topY);

      if (rectHeight > 0 && Number.isFinite(rectY)) {
        backgroundRect = {
          x: -3,
          y: rectY,
          width: svgWidth,
          height: rectHeight,
          fill: statusColor,
          opacity: 0.1,
        };
      }
    }

    return { lines, pills, backgroundRect };
  }, [
    sortedValues,
    pointPositions,
    CIRCLE_RADIUS,
    PADDING,
    PILL_WIDTH,
    STROKE_WIDTH,
    svgWidth,
    ranges,
    dimensions,
    toPixelY,
  ]);

  const rangeStackData = useMemo(
    () => ({
      range: ranges,
      values: midpoints,
      dimensions,
    }),
    [ranges, midpoints, dimensions],
  );

  return {
    meta: {
      hasData: sortedValues.length > 0,
      biomarkerName: biomarker.name,
    },
    data: {
      pointPositions,
      lines: chartData.lines,
      pills: chartData.pills,
      backgroundRect: chartData.backgroundRect,
    },
    rangeStack: rangeStackData,
    config: {
      SVG_WIDTH: svgWidth,
      SVG_HEIGHT,
      PADDING,
      STROKE_WIDTH,
      TOOLTIP_OFFSET: CHART_CONFIG.TOOLTIP_OFFSET,
    },
  };
};
