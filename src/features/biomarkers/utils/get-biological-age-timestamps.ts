import { Biomarker } from '@/types/api';

import { COEFFICIENTS } from '../const/coefficients';

export const getBiologicalAgeTimestamps = (
  biomarkers: Biomarker[],
): Set<string> => {
  const timestamps = new Set<string>();

  Object.keys(COEFFICIENTS).forEach((name) => {
    const biomarker = biomarkers.find((b) => b.name === name);
    biomarker?.value.forEach((v) => timestamps.add(v.timestamp));
  });

  return timestamps;
};
