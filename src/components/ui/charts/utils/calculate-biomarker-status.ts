import { getBiomarkerRanges } from '@/components/ui/charts/utils/get-biomarker-ranges';
import { Biomarker, BiomarkerStatus } from '@/types/api';

export const calculateBiomarkerStatus = (
  biomarker: Biomarker,
): BiomarkerStatus => {
  if (!biomarker.value || biomarker.value.length === 0) return 'PENDING';

  const { ranges, lastValue } = getBiomarkerRanges(biomarker);

  if (!lastValue) return 'PENDING';

  const latestValue = lastValue.quantity.value;

  if (!ranges || ranges.length === 0) return 'PENDING';

  for (const range of ranges) {
    const lowValue = range.low?.value ?? 0;
    const highValue = range.high?.value;

    if (highValue !== undefined) {
      if (latestValue >= lowValue && latestValue <= highValue) {
        return range.status as BiomarkerStatus;
      }
    } else {
      if (latestValue >= lowValue) {
        return range.status as BiomarkerStatus;
      }
    }
  }

  const highestRange = ranges.reduce((max, range) => {
    const rangeHigh = range.high?.value ?? 0;
    const maxHigh = max.high?.value ?? 0;
    return rangeHigh > maxHigh ? range : max;
  });

  const lowestRange = ranges.reduce((min, range) => {
    const rangeLow = range.low?.value ?? Infinity;
    const minLow = min.low?.value ?? Infinity;
    return rangeLow < minLow ? range : min;
  });

  if (highestRange.high && latestValue > highestRange.high.value) {
    return 'HIGH';
  }

  if (lowestRange.low && latestValue < lowestRange.low.value) {
    return 'LOW';
  }

  return 'PENDING';
};
