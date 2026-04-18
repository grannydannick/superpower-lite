import type { BiomarkerStatus } from '@/types/api';

import type { DataBiomarker } from '../types/data-api';

export const biomarkerStatusCount = (
  biomarkers: DataBiomarker[],
  statuses: BiomarkerStatus[],
): number => {
  return biomarkers.filter((b) => {
    const status = b.observation?.status;
    return status != null && statuses.includes(status);
  }).length;
};
