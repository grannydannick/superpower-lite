import type { DataBiomarker } from '../types/data-api';

export const ORGAN_AGE_NAME_FRAGMENT = 'organ age';

export const isOrganAgeBiomarker = (b: DataBiomarker): boolean =>
  (b.observation?.name?.toLowerCase() ?? '').includes(ORGAN_AGE_NAME_FRAGMENT);

export function getOrganAgeBiomarkers(
  biomarkers: DataBiomarker[] | undefined | null,
): DataBiomarker[] {
  return (biomarkers ?? []).filter(isOrganAgeBiomarker);
}
