import { Document } from '@react-pdf/renderer';

import type { Protocol } from '../../api/protocol';

import type { PdfBiomarker } from './pdf-biomarker-table';
import { PdfCitationsPage } from './pdf-citations';
import { PdfCoverPage } from './pdf-cover-page';
import { PdfGoalSection } from './pdf-goal-section';
// Side-effect import — triggers font registration
import '../utils/pdf-fonts';

// ---------------------------------------------------------------------------
// ProtocolPdfData
// ---------------------------------------------------------------------------

export interface ProtocolPdfData {
  protocol: Protocol;
  biomarkersByGoal: Record<string, PdfBiomarker[]>;
}

// ---------------------------------------------------------------------------
// ProtocolPdfDocument
// ---------------------------------------------------------------------------

interface ProtocolPdfDocumentProps {
  data: ProtocolPdfData;
}

/**
 * Root PDF document component for a health protocol.
 *
 * Composes the cover page, per-goal sections (with biomarker tables),
 * and a citations/references index into a single downloadable PDF.
 */
export function ProtocolPdfDocument({ data }: ProtocolPdfDocumentProps) {
  const { protocol, biomarkersByGoal } = data;

  return (
    <Document
      title="Superpower Health Protocol"
      author="Superpower"
      subject="Health Protocol"
    >
      <PdfCoverPage protocol={protocol} />

      {protocol.goals.map((goal, index) => (
        <PdfGoalSection
          key={goal.id}
          goal={goal}
          goalIndex={index}
          biomarkers={biomarkersByGoal[goal.id] ?? []}
        />
      ))}

      <PdfCitationsPage protocol={protocol} />
    </Document>
  );
}
