import { BiomarkerStatus } from '@/types/api';

import type { ScoredBiomarker } from '../score-chart/types/score-chart';

// Sorts biomarkers by clinical urgency: out-of-range first (HIGH/LOW/ABNORMAL),
// then NORMAL, OPTIMAL, PENDING, and finally UNKNOWN/RECOMMENDED.
// Within the same priority tier, sorts alphabetically by name.
export const sortBiomarkers = (
  biomarkers: ScoredBiomarker[],
): ScoredBiomarker[] => {
  return biomarkers.sort((a, b) => {
    const statusOrder: Record<BiomarkerStatus, number> = {
      HIGH: 1,
      LOW: 1,
      ABNORMAL: 1,
      NORMAL: 2,
      OPTIMAL: 3,
      PENDING: 4,
      UNKNOWN: 5,
      RECOMMENDED: 5,
    };

    const aOrder = statusOrder[a.status] || 4;
    const bOrder = statusOrder[b.status] || 4;

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    return (a.name ?? '').localeCompare(b.name ?? '');
  });
};
