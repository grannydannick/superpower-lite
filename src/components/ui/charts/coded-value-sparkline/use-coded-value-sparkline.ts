import { useMemo } from 'react';

import { STATUS_TO_COLOR } from '@/const/status-to-color';
import type { Biomarker } from '@/types/api';

import { CHART_CONFIG } from '../sparkline-chart/config';
import { getCodedBiomarkerRanges } from '../utils/get-biomarker-ranges';

const getStatusColor = (status: 'optimal' | 'abnormal') =>
  status === 'optimal' ? STATUS_TO_COLOR.optimal : STATUS_TO_COLOR.high;

// Computes sparkline geometry for codedValue biomarkers in the data table.
// Maps discrete coded values (e.g. "clear", "cloudy") to horizontal Y-axis bands
// (optimal codes at bottom, abnormal at top). The background rect highlights
// the specific band matching the newest value's coded value to show current status.
export const useCodedValueSparkline = ({
  biomarker,
  maxValuesToShow,
  svgWidth,
}: {
  biomarker: Biomarker;
  maxValuesToShow: number;
  svgWidth: number;
}) => {
  const { ranges: codedRanges } = getCodedBiomarkerRanges(biomarker);

  const sortedValues = useMemo(() => {
    if (!biomarker.value?.length) return [];

    const sorted = [...biomarker.value].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    return sorted.slice(-maxValuesToShow);
  }, [biomarker.value, maxValuesToShow]);

  const { SVG_HEIGHT, PADDING, CIRCLE_RADIUS, STROKE_WIDTH } = CHART_CONFIG;
  const chartHeight = SVG_HEIGHT - 2 * PADDING;

  const optimalCodes = useMemo(
    () => codedRanges.filter((r) => r.status === 'optimal'),
    [codedRanges],
  );

  const abnormalCodes = useMemo(
    () => codedRanges.filter((r) => r.status === 'abnormal'),
    [codedRanges],
  );

  // Optimal codes first (placed at bottom of chart), abnormal second (placed at top)
  const orderedCodes = useMemo(
    () => [...optimalCodes, ...abnormalCodes],
    [optimalCodes, abnormalCodes],
  );

  const bandCount = orderedCodes.length || 2;
  const bandHeight = chartHeight / bandCount;

  const codeToBandPosition = useMemo(() => {
    const map = new Map<
      string,
      { y: number; status: 'optimal' | 'abnormal' }
    >();

    orderedCodes.forEach((range, index) => {
      const invertedIndex = bandCount - 1 - index;
      const bandTop = PADDING + invertedIndex * bandHeight;
      const centerY = bandTop + bandHeight / 2;
      map.set(range.code, { y: centerY, status: range.status });
    });

    return map;
  }, [orderedCodes, bandCount, bandHeight, PADDING]);

  const xStep =
    sortedValues.length > 1
      ? (svgWidth - PADDING * 8) / (sortedValues.length - 1)
      : 0;

  const pointPositions = useMemo(
    () =>
      sortedValues.map((v, index) => {
        const valueCoded = v.valueCoded || '';
        const band = codeToBandPosition.get(valueCoded);
        const y = band?.y ?? SVG_HEIGHT / 2;
        const status = band?.status ?? 'abnormal';

        const x =
          sortedValues.length === 1
            ? svgWidth - PADDING * 6
            : PADDING * 6 + index * xStep;

        return {
          x: Number.isFinite(x) ? x : svgWidth / 2,
          y: Number.isFinite(y) ? y : SVG_HEIGHT / 2,
          codedValue: valueCoded,
          timestamp: v.timestamp,
          index,
          source: v.source || 'quest',
          file: v.file,
          status,
        };
      }),
    [sortedValues, codeToBandPosition, svgWidth, PADDING, xStep, SVG_HEIGHT],
  );

  const chartData = useMemo(() => {
    if (!sortedValues.length) {
      return { lines: [], circles: [], backgroundRect: null };
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

    const circles: Array<{
      key: string;
      cx: number;
      cy: number;
      r: number;
      fill: string;
      stroke: string;
      strokeWidth: number;
    }> = [];

    // Lead-in line from left edge to first point
    const firstPos = pointPositions[0];
    if (firstPos && Number.isFinite(firstPos.y)) {
      lines.push({
        key: 'lead-in',
        x1: 0,
        y1: firstPos.y,
        x2: sortedValues.length === 1 ? firstPos.x : PADDING * 6,
        y2: firstPos.y,
        stroke: getStatusColor(firstPos.status),
        strokeWidth: STROKE_WIDTH,
        strokeLinecap: 'round',
        opacity: 0.6,
      });
    }

    pointPositions.forEach((pos, index) => {
      const circleRadius =
        sortedValues.length === 1 ? CIRCLE_RADIUS + 1 : CIRCLE_RADIUS;

      circles.push({
        key: `${pos.timestamp}-${index}`,
        cx: pos.x,
        cy: pos.y,
        r: circleRadius,
        fill: getStatusColor(pos.status),
        stroke: 'white',
        strokeWidth: STROKE_WIDTH,
      });

      // When a line crosses between optimal and abnormal zones, split it at
      // the boundary so each portion gets the correct color (green vs pink).
      if (index < pointPositions.length - 1) {
        const nextPos = pointPositions[index + 1];
        const optimalCount = optimalCodes.length;
        const boundaryY = PADDING + (bandCount - optimalCount) * bandHeight;

        if (pos.status === nextPos.status) {
          lines.push({
            key: `line-${pos.timestamp}-${index}`,
            x1: pos.x,
            y1: pos.y,
            x2: nextPos.x,
            y2: nextPos.y,
            stroke: getStatusColor(nextPos.status),
            strokeWidth: STROKE_WIDTH,
            strokeLinecap: 'round',
          });
        } else {
          const t = (boundaryY - pos.y) / (nextPos.y - pos.y);
          const crossX = pos.x + (nextPos.x - pos.x) * t;

          lines.push({
            key: `line-${pos.timestamp}-${index}-a`,
            x1: pos.x,
            y1: pos.y,
            x2: crossX,
            y2: boundaryY,
            stroke: getStatusColor(pos.status),
            strokeWidth: STROKE_WIDTH,
            strokeLinecap: 'round',
          });

          lines.push({
            key: `line-${pos.timestamp}-${index}-b`,
            x1: crossX,
            y1: boundaryY,
            x2: nextPos.x,
            y2: nextPos.y,
            stroke: getStatusColor(nextPos.status),
            strokeWidth: STROKE_WIDTH,
            strokeLinecap: 'round',
          });
        }
      }
    });

    // Background rect highlights all bands sharing the same status as the
    // newest value (e.g. all abnormal bands turn pink, not just the one band).
    // Optimal bands are always at the bottom, abnormal at the top.
    const lastPos = pointPositions[pointPositions.length - 1];
    let backgroundRect = null;
    if (lastPos) {
      const bandInfo = codeToBandPosition.get(lastPos.codedValue);
      if (bandInfo) {
        const isOptimal = bandInfo.status === 'optimal';
        const zoneCount = isOptimal
          ? optimalCodes.length
          : abnormalCodes.length;
        const topY = isOptimal
          ? PADDING + abnormalCodes.length * bandHeight
          : PADDING;

        backgroundRect = {
          x: -3,
          y: topY,
          width: svgWidth,
          height: zoneCount * bandHeight,
          fill: getStatusColor(bandInfo.status),
          opacity: 0.1,
        };
      }
    }

    return { lines, circles, backgroundRect };
  }, [
    sortedValues,
    pointPositions,
    STROKE_WIDTH,
    CIRCLE_RADIUS,
    PADDING,
    codeToBandPosition,
    optimalCodes,
    abnormalCodes,
    bandCount,
    bandHeight,
    svgWidth,
  ]);

  // Range stack segments for the right-side indicator.
  // One continuous green line for all optimal codes, one continuous pink line
  // for all abnormal codes (instead of one segment per individual coded value).
  const rangeStackSegments = useMemo(() => {
    const segments: Array<{ y: number; height: number; color: string }> = [];
    const segmentGap = 0.5;

    if (optimalCodes.length > 0) {
      const topY = PADDING + (bandCount - optimalCodes.length) * bandHeight;
      const bottomY = SVG_HEIGHT - PADDING;
      segments.push({
        y: topY + segmentGap / 2,
        height: bottomY - topY - segmentGap,
        color: getStatusColor('optimal'),
      });
    }

    if (abnormalCodes.length > 0) {
      const topY = PADDING;
      const bottomY = PADDING + abnormalCodes.length * bandHeight;
      segments.push({
        y: topY + segmentGap / 2,
        height: bottomY - topY - segmentGap,
        color: getStatusColor('abnormal'),
      });
    }

    return segments;
  }, [optimalCodes, abnormalCodes, bandCount, bandHeight, PADDING, SVG_HEIGHT]);

  return {
    meta: {
      hasData: sortedValues.length > 0 && codedRanges.length > 0,
      biomarkerName: biomarker.name,
    },
    data: {
      pointPositions,
      lines: chartData.lines,
      circles: chartData.circles,
      backgroundRect: chartData.backgroundRect,
    },
    rangeStack: rangeStackSegments,
    config: {
      SVG_WIDTH: svgWidth,
      SVG_HEIGHT,
      PADDING,
      CIRCLE_RADIUS,
      STROKE_WIDTH,
      TOOLTIP_OFFSET: CHART_CONFIG.TOOLTIP_OFFSET,
    },
  };
};
