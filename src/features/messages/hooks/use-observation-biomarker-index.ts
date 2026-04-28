import { useMemo } from 'react';

import { useDataBiomarkers } from '@/features/data/api';
import type { DataBiomarker } from '@/features/data/types/data-api';
import type { Biomarker } from '@/types/api';

export function createObservationBiomarkerIndex(
  biomarkers?: Biomarker[],
): Map<string, Biomarker> {
  const index = new Map<string, Biomarker>();
  if (!biomarkers) return index;

  for (const biomarker of biomarkers) {
    for (const result of biomarker.value ?? []) {
      if (result.id) {
        index.set(result.id.toString(), biomarker);
      }
    }
  }

  return index;
}

/**
 * Maps observation-value ids (as referenced by AI chat citations) to the
 * parent CMS DataBiomarker. The DataBiomarker carries both the CMS id/slug
 * used by BiomarkerDialog and the FHIR observation used for card rendering.
 *
 * `isLoaded` tells callers whether the `/data/biomarkers` query has settled,
 * so a missing observation id can be distinguished from a still-loading index.
 */
export function useObservationBiomarkerIndex(): {
  index: Map<string, DataBiomarker>;
  isLoaded: boolean;
} {
  const { data, isSuccess } = useDataBiomarkers();

  const index = useMemo(() => {
    const map = new Map<string, DataBiomarker>();
    if (!data?.biomarkers) return map;

    for (const biomarker of data.biomarkers) {
      for (const result of biomarker.observation?.value ?? []) {
        if (result.id) {
          map.set(result.id.toString(), biomarker);
        }
      }
    }
    return map;
  }, [data?.biomarkers]);

  return { index, isLoaded: isSuccess };
}
