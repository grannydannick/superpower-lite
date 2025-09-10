import { CarePlanActivityDetail, Extension } from '@medplum/fhirtypes';

export interface Citation {
  key: string;
  content: string;
}

export const extractCitationsFromExtensions = (
  extensions?: Extension[],
): Citation[] => {
  if (!extensions) return [];

  return extensions
    .filter(
      (ext) =>
        ext.url ===
        'https://superpower.com/fhir/StructureDefinition/care-plan-citation',
    )
    .map((ext) => {
      const value = ext.valueString || '';
      const match = value.match(/^(\^\d+):\s*(.*)$/);

      if (match) {
        return {
          key: `[${match[1]}]`, // refers to "^1", "^2", etc.
          content: match[2].trim(),
        };
      }
      return null;
    })
    .filter((citation): citation is Citation => citation !== null);
};

export const extractCitations = (
  detail?: CarePlanActivityDetail,
): Citation[] => {
  return extractCitationsFromExtensions(detail?.extension);
};
