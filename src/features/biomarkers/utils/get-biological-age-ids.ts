import { Biomarker } from '@/types/api';

import { COEFFICIENTS } from '../const/coefficients';

export const getBiologicalAgeIds = (biomarkers: Biomarker[]): Set<string> => {
  const ids = new Set<string>();

  Object.keys(COEFFICIENTS).forEach((name) => {
    const biomarker = biomarkers.find((b) => b.name === name);
    biomarker?.value.forEach((v) => ids.add(v.id));
  });

  return ids;
};
