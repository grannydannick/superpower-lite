import { Text, View } from '@react-pdf/renderer';

import type { ProtocolAction } from '../../api/protocol';
import { renderMarkdownToPdf } from '../utils/markdown-to-pdf';
import { FONT_FAMILY } from '../utils/pdf-fonts';
import { colors, fontSize, goalColors, spacing } from '../utils/pdf-styles';

// ---------------------------------------------------------------------------
// Type badge configuration
// ---------------------------------------------------------------------------

const TYPE_BADGES: Record<
  string,
  { color: string; bgColor: string; label: string }
> = {
  supplement: {
    color: colors.vermillion[900],
    bgColor: colors.vermillion[50],
    label: 'Supplement',
  },
  lifestyle: {
    color: goalColors.blue,
    bgColor: goalColors.blue50,
    label: 'Lifestyle',
  },
  testing: {
    color: colors.green[500],
    bgColor: colors.green[50],
    label: 'Testing',
  },
  prescription: {
    color: colors.pink[700],
    bgColor: colors.pink[50],
    label: 'Prescription',
  },
  consultation: {
    color: colors.zinc[700],
    bgColor: colors.zinc[100],
    label: 'Consultation',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTypeBadge(type: string) {
  return (
    TYPE_BADGES[type] ?? {
      color: colors.zinc[500],
      bgColor: colors.zinc[100],
      label: type,
    }
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontFamily: FONT_FAMILY,
        fontSize: fontSize.xs,
        fontWeight: 'bold',
        color: colors.zinc[500],
        marginBottom: spacing[1],
        marginTop: spacing[2],
      }}
    >
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Type-specific content
// ---------------------------------------------------------------------------

function SupplementContent({
  content,
}: {
  content: Extract<ProtocolAction['content'], { type: 'supplement' }>;
}) {
  return (
    <View>
      {content.why ? (
        <>
          <SectionLabel>Why</SectionLabel>
          <View>{renderMarkdownToPdf(content.why)}</View>
        </>
      ) : null}
      {content.lookOutFor ? (
        <>
          <SectionLabel>Things to Know</SectionLabel>
          <View>{renderMarkdownToPdf(content.lookOutFor)}</View>
        </>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// PdfActionCard
// ---------------------------------------------------------------------------

interface PdfActionCardProps {
  action: ProtocolAction;
  isPrimary?: boolean;
}

/**
 * Renders a single protocol action as a styled card.
 *
 * Includes a type badge, title, markdown description, type-specific
 * content blocks, and optional additional content. Citations are
 * aggregated into the dedicated citations page rather than rendered here.
 */
export function PdfActionCard({ action, isPrimary }: PdfActionCardProps) {
  const { color, bgColor, label } = getTypeBadge(action.content.type);
  const badgeLabel = isPrimary ? `${label} — Primary` : label;

  return (
    <View
      minPresenceAhead={80}
      style={{
        borderWidth: 1,
        borderColor: colors.zinc[200],
        borderRadius: 6,
        padding: spacing[3],
        marginBottom: spacing[3],
      }}
    >
      {/* Header: type badge */}
      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: bgColor,
          paddingHorizontal: spacing[2],
          paddingVertical: 4,
          borderRadius: 4,
          marginBottom: spacing[2],
        }}
      >
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: fontSize.xs,
            fontWeight: 'bold',
            lineHeight: 1,
            color,
          }}
        >
          {badgeLabel}
        </Text>
      </View>

      {/* Title */}
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: fontSize.md,
          fontWeight: 'bold',
          color: colors.zinc[900],
          marginBottom: spacing[2],
        }}
      >
        {action.title}
      </Text>

      {/* Description (markdown) */}
      {action.description ? (
        <View style={{ marginBottom: spacing[2] }}>
          {renderMarkdownToPdf(action.description)}
        </View>
      ) : null}

      {/* Type-specific content */}
      {action.content.type === 'supplement' && (
        <SupplementContent content={action.content} />
      )}

      {/* Additional content (markdown in zinc-100 box) */}
      {action.additionalContent ? (
        <View
          style={{
            backgroundColor: colors.zinc[100],
            borderRadius: 4,
            padding: spacing[2],
            marginTop: spacing[2],
          }}
        >
          {renderMarkdownToPdf(action.additionalContent)}
        </View>
      ) : null}
    </View>
  );
}
