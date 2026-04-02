import type { CitationInfo } from '../types/message-parts';

export interface ParsedFhirObservationCitation {
  type: 'fhir:Observation';
  observationId: string;
  biomarkerName?: string;
  value?: string;
  unit?: string;
  date?: string;
}

/**
 * Attempts to parse a citation as a FHIR Observation reference.
 * Returns null if the citation is not a FHIR Observation.
 *
 * Expected source formats:
 *   - "fhir://Observation/UUID" (new format)
 *   - "fhir:Observation/UUID" (legacy format)
 * Expected title format: "Biomarker Name: 123.4 unit (YYYY-MM-DD)"
 */
export function parseFhirObservationCitation(
  citation: CitationInfo,
): ParsedFhirObservationCitation | null {
  // Match pattern: "fhir://Observation/UUID" or "fhir:Observation/UUID"
  const match = citation.source.match(
    /^fhir:\/?\/?Observation\/([a-f0-9-]+)$/i,
  );
  if (!match) return null;

  const observationId = match[1];

  // Try to parse title: "Estim. Avg Glu (eAG): 161.3 mg/dL (2026-01-20)"
  // Pattern: name (with possible parentheses): value unit (date)
  const titleMatch = citation.title.match(
    /^(.+?):\s*([\d.,]+)\s*(\S+)\s*\((\d{4}-\d{2}-\d{2})\)$/,
  );

  return {
    type: 'fhir:Observation',
    observationId,
    biomarkerName: titleMatch?.[1]?.trim(),
    value: titleMatch?.[2],
    unit: titleMatch?.[3],
    date: titleMatch?.[4],
  };
}

// Extract observation ID from FHIR reference (e.g., "Observation/uuid" -> "uuid")
export const extractObservationId = (reference: string) =>
  reference.replace(/^Observation\//, '');
