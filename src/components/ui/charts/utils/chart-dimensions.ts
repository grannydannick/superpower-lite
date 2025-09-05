import { Range } from '@/types/api';

import { ChartDimensions } from '../types/chart';

// calculates the dimensions of the chart, including the min and max values, the total range, and the optimal and normal ranges
export const calculateChartDimensions = (
  range: Range[],
  values: number[],
  rangeExtensionFactor: number,
): ChartDimensions => {
  if (!values.length || values.some((v) => !isFinite(v))) {
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

  const optimalRange = range?.find((r) => r.status === 'OPTIMAL');
  const normalRange = range?.find((r) => r.status === 'NORMAL');

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
    const chartMinValue = Math.min(minValue, 0 - rangeExtension);
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
      normalLow: 0,
      normalHigh: Math.max(optimalHigh, maxValue),
    };
  }

  const normalLow = normalRange.low?.value ?? 0;
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

// converts a value to a percentage of the total range, important for vertical positioning of the values
export const convertValueToY = (
  dimensions: ChartDimensions,
  val: number,
): number => {
  if (!isFinite(val) || dimensions.totalRange === 0) {
    return 50;
  }

  const percentage =
    ((val - dimensions.chartMinValue) / dimensions.totalRange) * 100;
  const result = 100 - percentage;

  return isFinite(result) ? result : 50;
};
