import { Page, Text, View } from '@react-pdf/renderer';

import type { Protocol, ProtocolCitation } from '../../api/protocol';
import { FONT_FAMILY } from '../utils/pdf-fonts';
import { colors, fontSize, pdfStyles, spacing } from '../utils/pdf-styles';

// ---------------------------------------------------------------------------
// collectAllCitations — deduplicated citation list from a full protocol
// ---------------------------------------------------------------------------

/**
 * Iterates all goals and their actions (primary + additional) to collect
 * every citation, then deduplicates by title (case-insensitive).
 *
 * Returns a flat array suitable for rendering a references page.
 */
export function collectAllCitations(protocol: Protocol): ProtocolCitation[] {
  const seen = new Set<string>();
  const citations: ProtocolCitation[] = [];

  for (const goal of protocol.goals) {
    const actions = [goal.primaryAction, ...(goal.additionalActions ?? [])];

    for (const action of actions) {
      if (!action.citations) continue;

      for (const citation of action.citations) {
        // Deduplicate by lowercase title. Skip entries with empty/whitespace
        // titles so they don't all collapse into a single empty-string key.
        const key = citation.title.toLowerCase().trim();
        if (!key) continue;
        if (seen.has(key)) continue;
        seen.add(key);
        citations.push(citation);
      }
    }
  }

  return citations;
}

// ---------------------------------------------------------------------------
// PdfCitationsPage
// ---------------------------------------------------------------------------

interface PdfCitationsPageProps {
  protocol: Protocol;
}

/**
 * Renders a references / citations index page.
 *
 * Returns `null` when the protocol contains no citations, so the caller
 * can conditionally omit the page.
 */
export function PdfCitationsPage({ protocol }: PdfCitationsPageProps) {
  const citations = collectAllCitations(protocol);

  if (citations.length === 0) return null;

  return (
    <Page size="A4" style={pdfStyles.page} wrap>
      {/* Page title */}
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: fontSize.xl,
          fontWeight: 'bold',
          color: colors.zinc[900],
          marginBottom: spacing[4],
        }}
      >
        References
      </Text>

      {/* Citation entries */}
      {citations.map((citation, index) => (
        <View
          key={`ref-${index}`}
          wrap={false}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: spacing[2],
          }}
        >
          {/* Number */}
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: fontSize.sm,
              fontWeight: 'bold',
              color: colors.vermillion[900],
              width: 24,
            }}
          >
            {index + 1}.
          </Text>

          {/* Citation content */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: fontSize.sm,
                color: colors.zinc[700],
              }}
            >
              {citation.title}
              {citation.journal ? `. ${citation.journal}` : ''}
              {citation.year ? ` (${citation.year})` : ''}
              {citation.authors ? `. ${citation.authors}` : ''}
            </Text>
            {citation.doi ? (
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: fontSize.xs,
                  color: colors.zinc[400],
                  marginTop: 1,
                }}
              >
                DOI: {citation.doi}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </Page>
  );
}
