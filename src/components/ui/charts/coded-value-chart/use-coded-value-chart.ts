import { STATUS_TO_COLOR } from '@/const/status-to-color';
import type { Biomarker, CodedRange } from '@/types/api';

import { CHART_CONFIG } from '../time-series-chart/config';
import { getCodedBiomarkerRanges } from '../utils/get-biomarker-ranges';

import type {
  CodedDataPoint,
  CodedLineSegment,
  CodedXAxisLabel,
  CodedYAxisBand,
} from './types';

const CODED_CIRCLE_RADIUS = CHART_CONFIG.CIRCLE_RADIUS;

const STATUS_COLORS = {
  optimal: STATUS_TO_COLOR.optimal,
  abnormal: STATUS_TO_COLOR.high,
} as const;

const formatDateLabel = (
  date: Date,
  hasNonCurrentYearData: boolean,
): string => {
  if (hasNonCurrentYearData) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }
  return date.toLocaleDateString('en-US', { month: 'short' });
};

const getStatusForValue = (
  valueCoded: string,
  codedRanges: CodedRange[],
): 'optimal' | 'abnormal' => {
  const match = codedRanges.find((r) => r.code === valueCoded);
  if (match) {
    return match.status;
  }
  return 'abnormal';
};

// Computes all chart geometry for the coded-value detail chart.
// Coded-value biomarkers have discrete text values (e.g. "clear", "cloudy") mapped
// to horizontal bands (optimal at bottom, abnormal at top). Each data point is placed
// at the center of its matching band. Includes pagination, "next test" projection,
// optimal zone highlighting, and responsive X-axis label spacing.
export const useCodedValueChart = ({
  biomarker,
  svgWidth,
  svgHeight,
  isMobile,
  currentPage = 0,
  itemsPerPage = 6,
}: {
  biomarker: Biomarker;
  svgWidth: number;
  svgHeight: number;
  isMobile: boolean;
  currentPage?: number;
  itemsPerPage?: number;
}) => {
  const { ranges: codedRanges } = getCodedBiomarkerRanges(biomarker);

  if (!biomarker.value?.length || codedRanges.length === 0) {
    return {
      meta: {
        hasData: false,
        biomarkerName: biomarker.name,
        totalPages: 0,
        showPagination: false,
      },
      data: {
        dataPoints: [] as CodedDataPoint[],
        lineSegments: [] as CodedLineSegment[],
      },
      axes: {
        yAxisBands: [] as CodedYAxisBand[],
        xAxisLabels: [] as CodedXAxisLabel[],
      },
      optimal: {
        areas: [] as Array<{
          x: number;
          y: number;
          width: number;
          height: number;
          fill: string;
          opacity: number;
        }>,
        label: null as null | {
          x: number;
          y: number;
          text: string;
          textAnchor: 'end';
          className: string;
          fill: string;
        },
      },
      config: {
        circleRadius: CODED_CIRCLE_RADIUS,
        strokeWidth: CHART_CONFIG.STROKE_WIDTH,
      },
    };
  }

  // Sort values oldest-first for left-to-right display
  const sortedValues = [...biomarker.value].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  // Pagination (same logic as time-series chart)
  const totalValues = sortedValues.length;
  const totalPages = Math.ceil(totalValues / itemsPerPage);
  const showPagination = totalPages > 1;
  const shouldShowNextTest = currentPage === 0;

  const endIndex = totalValues - currentPage * itemsPerPage;
  const startIndex = Math.max(0, endIndex - itemsPerPage);
  const pageValues = sortedValues.slice(startIndex, endIndex);

  // Chart dimensions
  const chartWidth =
    svgWidth - CHART_CONFIG.RIGHT_PADDING - CHART_CONFIG.LEFT_PADDING;
  const chartHeight =
    svgHeight - CHART_CONFIG.TOP_PADDING - CHART_CONFIG.BOTTOM_PADDING;

  // Build Y-axis bands: optimal values at bottom, abnormal at top
  // Sort so optimal codes come first (will be placed at bottom)
  const optimalCodes = codedRanges.filter((r) => r.status === 'optimal');
  const abnormalCodes = codedRanges.filter((r) => r.status === 'abnormal');
  const orderedCodes = [...optimalCodes, ...abnormalCodes];

  const bandCount = orderedCodes.length;
  const bandHeight = chartHeight / bandCount;

  const yAxisBands: CodedYAxisBand[] = orderedCodes.map((range, index) => {
    // Bottom-to-top: index 0 is at the bottom of the chart
    const invertedIndex = bandCount - 1 - index;
    const bandTop = CHART_CONFIG.TOP_PADDING + invertedIndex * bandHeight;
    const bandBottom = bandTop + bandHeight;
    const centerY = bandTop + bandHeight / 2;

    return {
      code: range.code,
      y: centerY,
      bandTop,
      bandBottom,
      isOptimal: range.status === 'optimal',
    };
  });

  // Build a lookup from coded value to band center Y
  const codeToBandCenterY = new Map<string, number>();
  for (const band of yAxisBands) {
    codeToBandCenterY.set(band.code, band.y);
  }

  // Build data points
  const dataPoints: CodedDataPoint[] = pageValues.map((point, index) => {
    const valueCoded = point.valueCoded || '';
    const bandCenterY = codeToBandCenterY.get(valueCoded);

    // Fall back to center of chart if coded value doesn't match any band
    const y = bandCenterY ?? CHART_CONFIG.TOP_PADDING + chartHeight / 2;

    let x: number;
    const totalPointsForSpacing = shouldShowNextTest
      ? pageValues.length + 1
      : pageValues.length;

    if (totalPointsForSpacing === 1) {
      x = CHART_CONFIG.LEFT_PADDING + chartWidth / 2;
    } else if (pageValues.length === 1 && shouldShowNextTest) {
      x = CHART_CONFIG.LEFT_PADDING + chartWidth * 0.25;
    } else {
      x =
        CHART_CONFIG.LEFT_PADDING +
        (index / (totalPointsForSpacing - 1)) * chartWidth;
    }

    const status = getStatusForValue(valueCoded, codedRanges);

    return {
      x,
      y,
      codedValue: valueCoded,
      timestamp: point.timestamp,
      status,
      id: point.id || `point-${startIndex + index}`,
    };
  });

  // Build line segments between consecutive data points.
  // When a line crosses between optimal and abnormal zones, split it at the
  // boundary so each portion gets the correct color.
  const lineSegments: CodedLineSegment[] = [];

  const optimalBandCount = optimalCodes.length;
  const boundaryY =
    CHART_CONFIG.TOP_PADDING + (bandCount - optimalBandCount) * bandHeight;

  for (let i = 0; i < dataPoints.length - 1; i += 1) {
    const start = dataPoints[i];
    const end = dataPoints[i + 1];

    if (start.status === end.status) {
      lineSegments.push({
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        color: STATUS_COLORS[end.status],
        key: `line-${i}`,
      });
    } else {
      const t = (boundaryY - start.y) / (end.y - start.y);
      const crossX = start.x + (end.x - start.x) * t;

      lineSegments.push({
        x1: start.x,
        y1: start.y,
        x2: crossX,
        y2: boundaryY,
        color: STATUS_COLORS[start.status],
        key: `line-${i}-a`,
      });

      lineSegments.push({
        x1: crossX,
        y1: boundaryY,
        x2: end.x,
        y2: end.y,
        color: STATUS_COLORS[end.status],
        key: `line-${i}-b`,
      });
    }
  }

  // Add "next test" dashed projection line from the last real point
  if (shouldShowNextTest && dataPoints.length > 0) {
    const lastPoint = dataPoints[dataPoints.length - 1];

    let nextTestX: number;
    if (pageValues.length === 1) {
      nextTestX = CHART_CONFIG.LEFT_PADDING + chartWidth * 0.85;
    } else {
      const totalPointsForSpacing = pageValues.length + 1;
      nextTestX =
        CHART_CONFIG.LEFT_PADDING +
        (pageValues.length / (totalPointsForSpacing - 1)) * chartWidth;
    }

    lineSegments.push({
      x1: lastPoint.x,
      y1: lastPoint.y,
      x2: nextTestX,
      y2: lastPoint.y,
      color: '#9CA3AF',
      key: 'next-test-line',
      strokeDasharray: '4,4',
    });
  }

  // Build optimal zone rects (covers all optimal bands)
  const optimalBands = yAxisBands.filter((b) => b.isOptimal);
  const optimalAreas = optimalBands.map((band, index) => ({
    x: 8,
    y: band.bandTop,
    width: svgWidth - 8,
    height: band.bandBottom - band.bandTop,
    fill: STATUS_TO_COLOR.optimal_light,
    opacity: 0.3,
    key: `optimal-area-${index}`,
  }));

  // Optimal label - position it in the first optimal band area if available
  const optimalLabel =
    optimalBands.length > 0
      ? {
          x: svgWidth - 16,
          y: optimalBands[0].bandTop + 16,
          text: 'Optimal',
          textAnchor: 'end' as const,
          className: 'text-xs font-medium',
          fill: STATUS_TO_COLOR.optimal,
        }
      : null;

  // Build X-axis labels
  const timestamps = pageValues.map((v) => v.timestamp);
  const currentYear = new Date().getFullYear();
  const hasNonCurrentYearData = timestamps.some(
    (ts) => new Date(ts).getFullYear() !== currentYear,
  );

  const responsiveLabelWidth = isMobile ? 60 : 80;
  const edgePadding = responsiveLabelWidth / 2;
  const minXLabelSpacing = isMobile ? 60 : 80;
  const availableWidth = svgWidth - 2 * edgePadding;
  const maxLabels = Math.floor(availableWidth / minXLabelSpacing);

  const xAxisLabels: CodedXAxisLabel[] = [];

  if (dataPoints.length <= maxLabels) {
    // Show all data points
    dataPoints.forEach((point, index) => {
      xAxisLabels.push({
        label: formatDateLabel(
          new Date(point.timestamp),
          hasNonCurrentYearData,
        ),
        x: Math.max(edgePadding, Math.min(svgWidth - edgePadding, point.x)),
        y: svgHeight - 16,
        key: `x-label-${index}`,
      });
    });
  } else {
    // Show subset with even distribution
    const step = Math.ceil(dataPoints.length / maxLabels);

    for (let i = 0; i < dataPoints.length; i += step) {
      const point = dataPoints[i];
      xAxisLabels.push({
        label: formatDateLabel(
          new Date(point.timestamp),
          hasNonCurrentYearData,
        ),
        x: Math.max(edgePadding, Math.min(svgWidth - edgePadding, point.x)),
        y: svgHeight - 16,
        key: `x-label-${i}`,
      });
    }

    // Include the last point if it has sufficient spacing
    const lastPoint = dataPoints[dataPoints.length - 1];
    const lastLabelX = Math.max(
      edgePadding,
      Math.min(svgWidth - edgePadding, lastPoint.x),
    );
    const hasLastPoint = xAxisLabels.some(
      (label) => Math.abs(label.x - lastLabelX) < 10,
    );
    const hasEnoughSpacing =
      xAxisLabels.length === 0 ||
      xAxisLabels.every(
        (label) => Math.abs(label.x - lastLabelX) >= minXLabelSpacing,
      );

    if (!hasLastPoint && xAxisLabels.length < maxLabels && hasEnoughSpacing) {
      xAxisLabels.push({
        label: formatDateLabel(
          new Date(lastPoint.timestamp),
          hasNonCurrentYearData,
        ),
        x: lastLabelX,
        y: svgHeight - 16,
        key: 'x-label-last',
      });
    }
  }

  xAxisLabels.sort((a, b) => a.x - b.x);

  return {
    meta: {
      hasData: true,
      biomarkerName: biomarker.name,
      totalPages,
      showPagination,
    },
    data: {
      dataPoints,
      lineSegments,
    },
    axes: {
      yAxisBands,
      xAxisLabels,
    },
    optimal: {
      areas: optimalAreas,
      label: optimalLabel,
    },
    config: {
      circleRadius: CODED_CIRCLE_RADIUS,
      strokeWidth: CHART_CONFIG.STROKE_WIDTH,
    },
  };
};
