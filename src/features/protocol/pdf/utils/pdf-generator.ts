import type { DocumentProps } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import { createElement } from 'react';

import { getBiomarkerRanges } from '@/components/ui/charts/utils/get-biomarker-ranges';
import { mostRecent } from '@/features/data/utils/most-recent-biomarker';
import { downloadBlob } from '@/features/files/utils/download-blob';
import type { Biomarker } from '@/types/api';

import type { Protocol } from '../../api/protocol';
import type { PdfBiomarker } from '../components/pdf-biomarker-table';
import type { ProtocolPdfData } from '../components/protocol-pdf-document';
import { ProtocolPdfDocument } from '../components/protocol-pdf-document';

/**
 * Convert a full Biomarker into the simplified PdfBiomarker shape.
 */
export function toPdfBiomarker(biomarker: Biomarker): PdfBiomarker {
  const latest = mostRecent(biomarker.value);
  const { ranges } = getBiomarkerRanges(biomarker);
  const optimalRange = ranges?.find((r) => r.status === 'OPTIMAL');

  return {
    name: biomarker.name,
    value: latest?.quantity?.value ?? '--',
    unit: latest?.quantity?.unit ?? biomarker.unit ?? '',
    status: biomarker.status,
    referenceRange: optimalRange
      ? { low: optimalRange.low?.value, high: optimalRange.high?.value }
      : undefined,
  };
}

/**
 * Resolve FHIR "Observation/uuid" references from protocol goals to PdfBiomarker
 * objects using the observation→biomarker index.
 */
export function resolveBiomarkersByGoal(
  protocol: Protocol,
  observationIndex: Map<string, Biomarker>,
): Record<string, PdfBiomarker[]> {
  const result: Record<string, PdfBiomarker[]> = {};

  for (const goal of protocol.goals) {
    const resolved: PdfBiomarker[] = [];
    const seen = new Set<string>();
    const unresolved: string[] = [];

    for (const ref of goal.biomarkers ?? []) {
      const observationId = ref.replace(/^Observation\//, '');
      const biomarker = observationIndex.get(observationId);

      if (!biomarker) {
        unresolved.push(ref);
        continue;
      }

      if (!seen.has(biomarker.id)) {
        seen.add(biomarker.id);
        resolved.push(toPdfBiomarker(biomarker));
      }
    }

    if (unresolved.length > 0) {
      console.warn(
        `[protocol-pdf] Goal "${goal.id}" has ${unresolved.length} unresolved biomarker reference(s):`,
        unresolved,
      );
    }

    result[goal.id] = resolved;
  }

  return result;
}

/**
 * Generate a PDF for the given protocol and trigger a browser download.
 *
 * @param protocol - The protocol to render
 * @param observationIndex - Map of observation IDs to Biomarker objects
 *   (built by useObservationBiomarkerIndex or equivalent)
 */
export async function generateProtocolPdf(
  protocol: Protocol,
  observationIndex: Map<string, Biomarker>,
): Promise<void> {
  const biomarkersByGoal = resolveBiomarkersByGoal(protocol, observationIndex);

  const data: ProtocolPdfData = { protocol, biomarkersByGoal };

  // Render the React-PDF document tree to a blob. Wrap in a try/catch so a
  // render failure surfaces with context (the @react-pdf/renderer stack
  // alone is often unhelpful — knowing it failed at toBlob() helps triage).
  const doc = createElement(ProtocolPdfDocument, {
    data,
  }) as ReactElement<DocumentProps>;
  let blob: Blob;
  try {
    blob = await pdf(doc).toBlob();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to render protocol PDF: ${message}`, {
      cause: error,
    });
  }

  // Fall back to today if createdAt is missing or unparseable so the
  // filename never becomes "Invalid Date" (which throws on .toISOString()).
  const created = new Date(protocol.createdAt);
  const safeDate = Number.isNaN(created.getTime()) ? new Date() : created;
  const dateStr = safeDate.toISOString().split('T')[0];
  const filename = `superpower-protocol-${dateStr}.pdf`;
  downloadBlob(blob, filename);
}
