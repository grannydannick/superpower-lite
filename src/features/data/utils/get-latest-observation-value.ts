import type { Biomarker, BiomarkerResult } from '@/types/api';

export const getLatestObservationValue = (
  observation: Biomarker | undefined | null,
): BiomarkerResult | undefined => observation?.value?.[0];
