import { getBiomarkerRanges } from '@/components/ui/charts/utils/get-biomarker-ranges';
import { Biomarker } from '@/types/api';

export type NormalStatusType = 'NOT_FOUND' | 'LOW_NORMAL' | 'HIGH_NORMAL';

export const getNormalStatus = (biomarker: Biomarker): NormalStatusType => {
  const { ranges, lastValue } = getBiomarkerRanges(biomarker);
  const optimalRange = ranges.find((rng) => rng.status === 'OPTIMAL');
  /*
   * If we don't find optimal range OR we don't have any values (just extra check)
   *
   * OR we don't have low range OR we don't have high range
   * */
  if (
    !optimalRange ||
    !lastValue ||
    !optimalRange.low?.value ||
    !optimalRange.high?.value
  ) {
    return 'NOT_FOUND';
  }

  /*
   *  If less than low optimal => low normal
   *  If higher than high optimal => high normal
   * */
  if (lastValue.quantity.value < optimalRange.low.value) {
    return 'LOW_NORMAL';
  } else if (lastValue.quantity.value > optimalRange.high.value) {
    return 'HIGH_NORMAL';
  }

  return 'NOT_FOUND';
};
