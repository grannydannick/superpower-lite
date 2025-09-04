import { useMemo } from 'react';

import { STATUS_TO_COLOR } from '@/const/status-to-color';
import type { Biomarker, Comparator, Range } from '@/types/api';

import {
  isBinaryBiomarker,
  getBinaryBiomarkerDimensions,
} from '../utils/binary-biomarker';
import { getBiomarkerRanges } from '../utils/get-biomarker-ranges';
import { getNewestValue } from '../utils/get-newest-value';
import { getValueStatus } from '../utils/get-value-status';

import { CHART_CONFIG } from './config';
import type {
  DataPoint,
  LineSegment,
  TimeScale,
  XAxisLabel,
  YAxisLabel,
} from './types/time-series-chart';

interface ChartDimensions {
  minValue: number;
  maxValue: number;
  chartMinValue: number;
  chartMaxValue: number;
  totalRange: number;
  optimalLow: number;
  optimalHigh: number;
  normalLow: number;
  normalHigh: number;
}

const calculateChartDimensions = (
  range: Range[],
  values: number[],
  rangeExtensionFactor: number,
): ChartDimensions => {
  if (!values.length || values.some((v) => !Number.isFinite(v))) {
    return {
      minValue: 0,
      maxValue: 100,
      chartMinValue: 0,
      chartMaxValue: 100,
      totalRange: 100,
      optimalLow: 0,
      optimalHigh: 100,
      normalLow: 0,
      normalHigh: 100,
    };
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const optimalRange = range.find((r) => r.status === 'OPTIMAL');
  const normalRange = range.find((r) => r.status === 'NORMAL');

  // Check for binary biomarkers and use forced ranges
  if (isBinaryBiomarker(optimalRange, normalRange)) {
    return getBinaryBiomarkerDimensions(minValue, maxValue);
  }

  if (!optimalRange) {
    const totalRange = maxValue - minValue || 1;
    return {
      minValue,
      maxValue,
      chartMinValue: minValue,
      chartMaxValue: maxValue,
      totalRange,
      optimalLow: minValue,
      optimalHigh: maxValue,
      normalLow: minValue,
      normalHigh: maxValue,
    };
  }

  let optimalLow: number;
  let optimalHigh: number;

  if (
    optimalRange.low?.value !== undefined &&
    optimalRange.high?.value !== undefined
  ) {
    optimalLow = optimalRange.low.value;
    optimalHigh = optimalRange.high.value;
  } else if (
    optimalRange.low?.value !== undefined &&
    optimalRange.high?.value === undefined
  ) {
    optimalLow = optimalRange.low.value;
    optimalHigh = Math.max(maxValue, optimalLow * 2);
  } else if (
    optimalRange.low?.value === undefined &&
    optimalRange.high?.value !== undefined
  ) {
    optimalHigh = optimalRange.high.value;
    optimalLow = Math.min(minValue, optimalHigh * 0.5);
  } else {
    optimalLow = minValue;
    optimalHigh = maxValue;
  }

  if (!normalRange) {
    const rangeSpan = optimalHigh - optimalLow;
    const rangeExtension = rangeSpan * rangeExtensionFactor;
    const chartMinValue = Math.min(minValue, optimalLow - rangeExtension);
    const chartMaxValue = Math.max(maxValue, optimalHigh + rangeExtension);
    const totalRange = chartMaxValue - chartMinValue || 1;

    return {
      minValue,
      maxValue,
      chartMinValue,
      chartMaxValue,
      totalRange,
      optimalLow,
      optimalHigh,
      normalLow: optimalLow,
      normalHigh: optimalHigh,
    };
  }

  const normalLow = normalRange.low?.value ?? optimalLow;
  const normalHigh = normalRange.high?.value ?? optimalHigh;

  const rangeExtension = (normalHigh - normalLow) * rangeExtensionFactor;
  const chartMinValue = Math.min(
    minValue,
    normalLow,
    optimalLow,
    normalLow - rangeExtension,
  );
  const chartMaxValue = Math.max(
    maxValue,
    normalHigh,
    optimalHigh,
    normalHigh + rangeExtension,
  );
  const totalRange = chartMaxValue - chartMinValue || 1;

  return {
    minValue,
    maxValue,
    chartMinValue,
    chartMaxValue,
    totalRange,
    optimalLow,
    optimalHigh,
    normalLow,
    normalHigh,
  };
};

const convertValueToY = (dimensions: ChartDimensions, val: number): number => {
  if (!Number.isFinite(val) || dimensions.totalRange === 0) {
    return 50;
  }

  const percentage =
    ((val - dimensions.chartMinValue) / dimensions.totalRange) * 100;
  const result = 100 - percentage;

  return Number.isFinite(result) ? result : 50;
};

const getTimeSpan = (timestamps: string[]) => {
  const dates = timestamps.map((ts) => new Date(ts));
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
  const spanMs = maxDate.getTime() - minDate.getTime();

  const days = spanMs / (1000 * 60 * 60 * 24);
  const months = days / 30.44;
  const years = days / 365.25;

  return { minDate, maxDate, days, months, years };
};

const determineTimeScale = (
  span: ReturnType<typeof getTimeSpan>,
  availableWidth: number,
  timestamps: string[],
): TimeScale => {
  const { days, months, years } = span;
  const maxLabels = Math.floor(availableWidth / 80); // Space for "MMM YYYY" format

  const currentYear = new Date().getFullYear();
  const dataYears = timestamps.map((ts) => new Date(ts).getFullYear());
  const hasNonCurrentYearData = dataYears.some((year) => year !== currentYear);

  if (months > 1) {
    const monthInterval = Math.max(1, Math.ceil(months / maxLabels));
    return {
      type: 'months',
      interval: monthInterval,
      format: (date: Date) => {
        if (years > 1 || hasNonCurrentYearData) {
          return date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          });
        }
        return date.toLocaleDateString('en-US', { month: 'short' });
      },
    };
  }

  if (months > 1.5) {
    return {
      type: 'weeks',
      interval: 1,
      format: (date: Date) =>
        hasNonCurrentYearData
          ? date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
    };
  }

  if (days > 7) {
    if (maxLabels >= days) {
      return {
        type: 'days',
        interval: 1,
        format: (date: Date) =>
          hasNonCurrentYearData
            ? date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
      };
    }

    const weekInterval = Math.max(1, Math.ceil(days / 7 / maxLabels));
    return {
      type: 'weeks',
      interval: weekInterval,
      format: (date: Date) =>
        hasNonCurrentYearData
          ? date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
    };
  }

  const dayInterval = Math.max(1, Math.ceil(days / maxLabels));
  return {
    type: 'days',
    interval: dayInterval,
    format: (date: Date) =>
      hasNonCurrentYearData
        ? date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
};

export const useTimeSeriesChart = ({
  biomarker,
  svgWidth,
  svgHeight,
  isMobile,
  currentPage = 0,
  itemsPerPage = 6,
  hoveredSource,
}: {
  biomarker: Biomarker;
  svgWidth: number;
  svgHeight: number;
  isMobile: boolean;
  currentPage?: number;
  itemsPerPage?: number;
  hoveredSource?: string;
}) => {
  const newestValueInfo = useMemo(
    () => getNewestValue(biomarker.value),
    [biomarker.value],
  );

  if (!biomarker.value?.length) {
    return {
      meta: {
        hasData: false,
        biomarkerName: biomarker.name,
        totalPages: 0,
        showPagination: false,
      },
      data: {
        dataPoints: [],
        lineSegments: [],
      },
      axes: {
        yAxisLabels: [],
        xAxisLabels: [],
      },
      optimal: {
        area: null,
        lines: [],
        label: null,
      },
      rangeStack: {
        props: null,
      },
      config: {
        circleRadius: CHART_CONFIG.CIRCLE_RADIUS,
        strokeWidth: CHART_CONFIG.STROKE_WIDTH,
        getStatusColor: (status: string) => {
          const statusKey =
            status.toLowerCase() as keyof typeof STATUS_TO_COLOR;
          return STATUS_TO_COLOR[statusKey] || STATUS_TO_COLOR.pending;
        },
      },
    };
  }

  const sortedValues = [...biomarker.value].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const totalValues = sortedValues.length;
  const totalPages = Math.ceil(totalValues / itemsPerPage);
  const showPagination = totalPages > 1;
  const shouldShowNextTest = currentPage === 0;

  const endIndex = totalValues - currentPage * itemsPerPage;
  const startIndex = Math.max(0, endIndex - itemsPerPage);
  const pageValues = sortedValues.slice(startIndex, endIndex);

  const values = pageValues.map((v) => v.quantity.value);

  const { ranges } = getBiomarkerRanges(biomarker);
  const dimensions = calculateChartDimensions(
    ranges,
    values,
    CHART_CONFIG.RANGE_EXTENSION_FACTOR,
  );

  const hoveredRange = (() => {
    if (!hoveredSource || !biomarker.ranges) {
      return ranges;
    }

    const sourceRange =
      biomarker.ranges[hoveredSource as keyof typeof biomarker.ranges];
    return sourceRange && sourceRange.length > 0 ? sourceRange : ranges;
  })();

  const hoveredDimensions = calculateChartDimensions(
    hoveredRange,
    values,
    CHART_CONFIG.RANGE_EXTENSION_FACTOR,
  );

  let nextTestValue = null;
  let allValuesWithNextTest = pageValues;

  if (shouldShowNextTest) {
    const lastTimestamp =
      pageValues.length > 0
        ? new Date(pageValues[pageValues.length - 1].timestamp)
        : new Date();

    const nextTestTimestamp = new Date(lastTimestamp);
    nextTestTimestamp.setMonth(nextTestTimestamp.getMonth() + 6);

    const now = new Date();
    if (nextTestTimestamp < now) {
      nextTestTimestamp.setTime(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    nextTestValue = {
      id: 'next-test',
      timestamp: nextTestTimestamp.toISOString(),
      quantity: { value: 0, comparator: 'EQUALS' as Comparator },
      component: [],
    };

    allValuesWithNextTest = [...pageValues, nextTestValue];
  }

  const chartWidth =
    svgWidth - CHART_CONFIG.RIGHT_PADDING - CHART_CONFIG.LEFT_PADDING;
  const chartHeight =
    svgHeight - CHART_CONFIG.TOP_PADDING - CHART_CONFIG.BOTTOM_PADDING;

  const timestamps = allValuesWithNextTest.map((v) => v.timestamp);

  const allDataPoints: DataPoint[] = allValuesWithNextTest.map(
    (point, index) => {
      let x: number;
      if (allValuesWithNextTest.length === 1) {
        x = CHART_CONFIG.LEFT_PADDING + chartWidth / 2;
      } else if (pageValues.length === 1 && shouldShowNextTest) {
        const isNextTest = point.id === 'next-test';
        if (isNextTest) {
          x = CHART_CONFIG.LEFT_PADDING + chartWidth * 0.85;
        } else {
          x = CHART_CONFIG.LEFT_PADDING + chartWidth * 0.25;
        }
      } else {
        // Equal visual spacing regardless of actual time intervals
        x =
          CHART_CONFIG.LEFT_PADDING +
          (index / (allValuesWithNextTest.length - 1)) * chartWidth;
      }

      const isNextTest = point.id === 'next-test';
      let y: number;
      let status: keyof typeof STATUS_TO_COLOR | 'next-test';

      if (isNextTest) {
        y =
          pageValues.length > 0
            ? CHART_CONFIG.TOP_PADDING +
              (convertValueToY(
                dimensions,
                pageValues[pageValues.length - 1].quantity.value,
              ) /
                100) *
                chartHeight
            : CHART_CONFIG.TOP_PADDING + chartHeight / 2;
        status = 'next-test';
      } else {
        const yPercent = convertValueToY(dimensions, point.quantity.value);
        y = CHART_CONFIG.TOP_PADDING + (yPercent / 100) * chartHeight;
        status = getValueStatus(
          dimensions,
          point.quantity.value,
          newestValueInfo,
        ) as 'optimal' | 'normal' | 'high' | 'low' | 'out of range';
      }

      return {
        x,
        y,
        value: point.quantity.value,
        timestamp: point.timestamp,
        status,
        id: point.id || `point-${startIndex + index}`,
      };
    },
  );

  const optimalTopY =
    CHART_CONFIG.TOP_PADDING +
    (convertValueToY(dimensions, dimensions.optimalHigh) / 100) * chartHeight;
  const optimalBottomY =
    CHART_CONFIG.TOP_PADDING +
    (convertValueToY(dimensions, dimensions.optimalLow) / 100) * chartHeight;
  const optimalHeight = Math.abs(optimalBottomY - optimalTopY);

  const getColorForRange = (range: keyof typeof STATUS_TO_COLOR): string => {
    return STATUS_TO_COLOR[range] || STATUS_TO_COLOR.pending;
  };

  const getRangeBoundaries = () => {
    const boundaries = [];

    if (dimensions.normalHigh !== dimensions.optimalHigh) {
      boundaries.push({
        value: dimensions.normalHigh,
        y:
          CHART_CONFIG.TOP_PADDING +
          (convertValueToY(dimensions, dimensions.normalHigh) / 100) *
            chartHeight,
      });
    }

    boundaries.push({
      value: dimensions.optimalHigh,
      y:
        CHART_CONFIG.TOP_PADDING +
        (convertValueToY(dimensions, dimensions.optimalHigh) / 100) *
          chartHeight,
    });

    boundaries.push({
      value: dimensions.optimalLow,
      y:
        CHART_CONFIG.TOP_PADDING +
        (convertValueToY(dimensions, dimensions.optimalLow) / 100) *
          chartHeight,
    });

    if (dimensions.normalLow !== dimensions.optimalLow) {
      boundaries.push({
        value: dimensions.normalLow,
        y:
          CHART_CONFIG.TOP_PADDING +
          (convertValueToY(dimensions, dimensions.normalLow) / 100) *
            chartHeight,
      });
    }

    return boundaries.sort((a, b) => a.y - b.y);
  };

  const getLineIntersection = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    boundaryY: number,
  ) => {
    if (y1 === y2) return null;

    const t = (boundaryY - y1) / (y2 - y1);
    if (t < 0 || t > 1) return null;

    const intersectionX = x1 + t * (x2 - x1);
    return { x: intersectionX, y: boundaryY };
  };

  const dataPoints = allDataPoints.filter(
    (point) => point.status !== 'next-test',
  );

  const lineSegments: LineSegment[] = [];
  const boundaries = getRangeBoundaries();

  const normalTopY =
    CHART_CONFIG.TOP_PADDING +
    (convertValueToY(dimensions, dimensions.normalHigh) / 100) * chartHeight;
  const normalBottomY =
    CHART_CONFIG.TOP_PADDING +
    (convertValueToY(dimensions, dimensions.normalLow) / 100) * chartHeight;

  for (let i = 0; i < dataPoints.length - 1; i += 1) {
    const start = dataPoints[i];
    const end = dataPoints[i + 1];

    const intersections = [];

    for (const boundary of boundaries) {
      const intersection = getLineIntersection(
        start.x,
        start.y,
        end.x,
        end.y,
        boundary.y,
      );
      if (
        intersection &&
        intersection.y > Math.min(start.y, end.y) &&
        intersection.y < Math.max(start.y, end.y)
      ) {
        intersections.push({
          ...intersection,
          boundaryValue: boundary.value,
        });
      }
    }

    intersections.sort((a, b) => {
      if (start.y < end.y) {
        return a.y - b.y;
      }

      return b.y - a.y;
    });

    const points = [start, ...intersections, end];

    for (let j = 0; j < points.length - 1; j += 1) {
      const segmentStart = points[j];
      const segmentEnd = points[j + 1];

      const midY = (segmentStart.y + segmentEnd.y) / 2;

      let range: keyof typeof STATUS_TO_COLOR;

      if (
        midY >= Math.min(optimalTopY, optimalBottomY) &&
        midY <= Math.max(optimalTopY, optimalBottomY)
      ) {
        range = 'optimal';
      } else if (
        midY >= Math.min(normalTopY, normalBottomY) &&
        midY <= Math.max(normalTopY, normalBottomY)
      ) {
        range = 'normal';
      } else if (
        midY < Math.min(normalTopY, normalBottomY, optimalTopY, optimalBottomY)
      ) {
        range = 'high';
      } else {
        range = 'low';
      }

      const color = getColorForRange(range);

      lineSegments.push({
        x1: segmentStart.x,
        y1: segmentStart.y,
        x2: segmentEnd.x,
        y2: segmentEnd.y,
        color,
        key: `line-${i}-${j}`,
      });
    }
  }

  const nextTestPoint = allDataPoints.find(
    (point) => point.status === 'next-test',
  );
  if (dataPoints.length > 0 && nextTestPoint) {
    const lastPoint = dataPoints[dataPoints.length - 1];
    lineSegments.push({
      x1: lastPoint.x,
      y1: lastPoint.y,
      x2: nextTestPoint.x,
      y2: nextTestPoint.y,
      color: '#9CA3AF',
      key: 'next-test-line',
      strokeDasharray: '4,4',
    });
  }

  const timeSpan = getTimeSpan(timestamps);
  const timeScale = determineTimeScale(timeSpan, chartWidth, timestamps);

  const responsiveLabelWidth = isMobile ? 60 : 80;
  const minXLabelSpacing = isMobile ? 60 : 80;
  const edgePadding = responsiveLabelWidth / 2;

  const createSimpleLabels = (points: DataPoint[]): XAxisLabel[] => {
    if (points.length === 0) return [];

    const actualDataPoints = points.filter((p) => p.status !== 'next-test');
    const nextTestPoints = points.filter((p) => p.status === 'next-test');

    if (actualDataPoints.length === 0) return [];

    const labels: XAxisLabel[] = [];

    // Simple approach: just show labels directly under each data point
    // but limit to avoid overcrowding
    const availableWidth = svgWidth - 2 * edgePadding;
    const maxLabels = Math.floor(availableWidth / minXLabelSpacing);

    if (actualDataPoints.length <= maxLabels) {
      // Show all data points if they fit
      actualDataPoints.forEach((point, index) => {
        labels.push({
          label: timeScale.format(new Date(point.timestamp)),
          x: Math.max(edgePadding, Math.min(svgWidth - edgePadding, point.x)),
          y: svgHeight - 16,
          key: `x-label-${index}`,
        });
      });
    } else {
      // Show subset with even distribution
      const step = Math.ceil(actualDataPoints.length / maxLabels);

      for (let i = 0; i < actualDataPoints.length; i += step) {
        const point = actualDataPoints[i];
        labels.push({
          label: timeScale.format(new Date(point.timestamp)),
          x: Math.max(edgePadding, Math.min(svgWidth - edgePadding, point.x)),
          y: svgHeight - 16,
          key: `x-label-${i}`,
        });
      }

      // Only include the last point if it has sufficient spacing from existing labels
      const lastPoint = actualDataPoints[actualDataPoints.length - 1];
      const lastLabelX = Math.max(
        edgePadding,
        Math.min(svgWidth - edgePadding, lastPoint.x),
      );
      const hasLastPoint = labels.some(
        (label) => Math.abs(label.x - lastLabelX) < 10,
      );

      // Check if adding the last point would violate spacing requirements
      const hasEnoughSpacing =
        labels.length === 0 ||
        labels.every(
          (label) => Math.abs(label.x - lastLabelX) >= minXLabelSpacing,
        );

      if (!hasLastPoint && labels.length < maxLabels && hasEnoughSpacing) {
        labels.push({
          label: timeScale.format(new Date(lastPoint.timestamp)),
          x: lastLabelX,
          y: svgHeight - 16,
          key: 'x-label-last',
        });
      }
    }

    // Add next test point if it exists
    if (nextTestPoints.length === 1) {
      const nextTestX = Math.max(
        edgePadding,
        Math.min(svgWidth - edgePadding, nextTestPoints[0].x),
      );

      // Check if there's enough space from the nearest existing label
      const tooClose = labels.some(
        (label) => Math.abs(label.x - nextTestX) < minXLabelSpacing * 0.6,
      );

      // check if we're using a subset of labels (step > 1) for visual balance
      const usingSubset = actualDataPoints.length > maxLabels;
      const step = Math.ceil(actualDataPoints.length / maxLabels);

      // if we're skipping labels for balance and the next test would be shown,
      // also skip it to maintain visual consistency otherwise it'd look bad.
      const shouldHideForBalance = usingSubset && step > 1;

      if (!tooClose && !shouldHideForBalance) {
        labels.push({
          label: timeScale.format(new Date(nextTestPoints[0].timestamp)),
          x: nextTestX,
          y: svgHeight - 16,
          key: 'x-label-next-test',
        });
      }
    }

    return labels.sort((a, b) => a.x - b.x);
  };

  const xAxisLabels = createSimpleLabels(allDataPoints);

  const baseYAxisLabels = [
    {
      baseValue: dimensions.normalHigh,
      hoveredValue: hoveredDimensions.normalHigh,
      priority: 3,
    },
    {
      baseValue: dimensions.optimalHigh,
      hoveredValue: hoveredDimensions.optimalHigh,
      priority: 2,
    },
    {
      baseValue: dimensions.optimalLow,
      hoveredValue: hoveredDimensions.optimalLow,
      priority: 2,
    },
    {
      baseValue: dimensions.normalLow,
      hoveredValue: hoveredDimensions.normalLow,
      priority: 3,
    },
  ].filter(
    (item, index, arr) =>
      arr.findIndex(
        (other) => Math.abs(other.baseValue - item.baseValue) < 0.01,
      ) === index,
  );

  const minLabelSpacing = 25;
  const processedYAxisLabels = baseYAxisLabels
    .sort((a, b) => b.baseValue - a.baseValue)
    .reduce(
      (acc, current) => {
        const currentY =
          CHART_CONFIG.TOP_PADDING +
          (convertValueToY(dimensions, current.baseValue) / 100) * chartHeight;

        if (acc.length === 0) {
          acc.push({ ...current, y: currentY });
          return acc;
        }

        const tooClose = acc.some((existing) => {
          const distance = Math.abs(existing.y - currentY);
          return distance < minLabelSpacing;
        });

        if (!tooClose) {
          acc.push({ ...current, y: currentY });
        } else {
          const conflictingLabel = acc.find(
            (existing) => Math.abs(existing.y - currentY) < minLabelSpacing,
          );
          if (
            conflictingLabel &&
            current.priority < conflictingLabel.priority
          ) {
            const index = acc.indexOf(conflictingLabel);
            acc.splice(index, 1);
            acc.push({ ...current, y: currentY });
          }
        }

        return acc;
      },
      [] as Array<{
        baseValue: number;
        hoveredValue: number;
        priority: number;
        y: number;
      }>,
    );

  const yAxisLabels: YAxisLabel[] = processedYAxisLabels.map((label) => ({
    value: label.hoveredValue,
    label: label.hoveredValue.toFixed(1),
    x: 12,
    y: label.y + 14,
    key: `y-label-${label.baseValue}`,
  }));

  const getStatusColorLight = (status: string): string => {
    const statusKey =
      `${status.toLowerCase()}_light` as keyof typeof STATUS_TO_COLOR;
    return STATUS_TO_COLOR[statusKey] || STATUS_TO_COLOR.pending_light;
  };

  const optimalArea = {
    x: 0,
    y: optimalTopY,
    width: svgWidth,
    height: optimalHeight,
    fill: getStatusColorLight('optimal'),
    opacity: 0.3,
  };

  const optimalLines = [
    {
      x1: 0,
      y1: optimalTopY,
      x2: svgWidth,
      y2: optimalTopY,
      stroke: STATUS_TO_COLOR.optimal,
      strokeWidth: 1,
      strokeDasharray: '3,3',
      key: 'optimal-line-top',
    },
    {
      x1: 0,
      y1: optimalBottomY,
      x2: svgWidth,
      y2: optimalBottomY,
      stroke: STATUS_TO_COLOR.optimal,
      strokeWidth: 1,
      strokeDasharray: '3,3',
      key: 'optimal-line-bottom',
    },
  ];

  const minHeightForInsideLabel = 24;
  const shouldShowLabelAbove = optimalHeight < minHeightForInsideLabel;

  const optimalLabel = {
    x: svgWidth - 16,
    y: shouldShowLabelAbove ? optimalTopY - 8 : optimalTopY + 16,
    text: 'Optimal',
    textAnchor: 'end' as const,
    className: 'text-xs font-medium',
    fill: STATUS_TO_COLOR.optimal,
  };

  const rangeStackProps = {
    range: ranges,
    values,
    height: chartHeight,
    padding: 0,
    dimensions,
    rangeExtensionFactor: CHART_CONFIG.RANGE_EXTENSION_FACTOR,
    transform: `translate(0, ${CHART_CONFIG.TOP_PADDING})`,
  };

  return {
    meta: {
      hasData: true,
      biomarkerName: biomarker.name,
      totalPages,
      showPagination,
    },
    data: {
      dataPoints: allDataPoints,
      lineSegments,
    },
    axes: {
      yAxisLabels,
      xAxisLabels,
    },
    optimal: {
      area: optimalArea,
      lines: optimalLines,
      label: optimalLabel,
    },
    rangeStack: {
      props: rangeStackProps,
    },
    config: {
      circleRadius: CHART_CONFIG.CIRCLE_RADIUS,
      strokeWidth: CHART_CONFIG.STROKE_WIDTH,
      getStatusColor: (status: string) => {
        const statusKey = status.toLowerCase() as keyof typeof STATUS_TO_COLOR;
        return STATUS_TO_COLOR[statusKey] || STATUS_TO_COLOR.pending;
      },
    },
  };
};
