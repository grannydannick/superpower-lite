import type { Range } from '@/types/api';

const BINARY_BIOMARKER_RANGE = {
  low: { value: 0 },
  high: { value: 1.5 },
};

/**
 * Checks if a biomarker is a binary biomarker based on its ranges.
 * Binary biomarkers have an optimal range of 0-1.1 and no normal range.
 */
export const isBinaryBiomarker = (
  optimalRange?: Range,
  normalRange?: Range,
): boolean => {
  return (
    optimalRange?.low?.value === BINARY_BIOMARKER_RANGE.low.value &&
    optimalRange?.high?.value === BINARY_BIOMARKER_RANGE.high.value &&
    !normalRange
  );
};

/**
 * Returns forced chart dimensions for binary biomarkers.
 * Binary biomarkers use fixed ranges: -1 to 0 for out of range, 0-1.1 for optimal.
 */
export const getBinaryBiomarkerDimensions = (
  minValue: number,
  maxValue: number,
) => {
  return {
    minValue,
    maxValue,
    chartMinValue: -1,
    chartMaxValue: 1.1,
    totalRange: 2.1,
    optimalLow: 0,
    optimalHigh: 1.1,
    normalLow: 0,
    normalHigh: 1.1,
  };
};
