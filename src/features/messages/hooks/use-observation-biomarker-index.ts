import { useMemo } from 'react';

import { useBiomarkers } from '@/features/data/api';
import type { Biomarker } from '@/types/api';

/**
 * Builds an index mapping observation IDs to their parent biomarkers.
 * Uses cached biomarker data from React Query.
 *
 * @returns Map where keys are observation IDs and values are Biomarker objects
 */
export function useObservationBiomarkerIndex(): Map<string, Biomarker> {
  const { data } = useBiomarkers();

  return useMemo(() => {
    const index = new Map<string, Biomarker>();
    if (!data?.biomarkers) return index;

    for (const biomarker of data.biomarkers) {
      for (const result of biomarker.value ?? []) {
        if (result.id) {
          index.set(result.id.toString(), biomarker);
        }
      }
    }
    return index;
  }, [data?.biomarkers]);
}
