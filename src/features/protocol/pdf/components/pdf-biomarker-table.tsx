import { Text, View } from '@react-pdf/renderer';

import { FONT_FAMILY } from '../utils/pdf-fonts';
import {
  biomarkerStatusColors,
  colors,
  fontSize,
  spacing,
} from '../utils/pdf-styles';

// ---------------------------------------------------------------------------
// PdfBiomarker — simplified type for PDF (parent resolves FHIR refs)
// ---------------------------------------------------------------------------

export interface PdfBiomarker {
  name: string;
  value: number | string;
  unit: string;
  status: string; // 'HIGH' | 'LOW' | 'NORMAL' | 'OPTIMAL' | 'UNKNOWN'
  referenceRange?: { low?: number; high?: number };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusColors(status: string): { bg: string; text: string } {
  const key = status.toLowerCase() as keyof typeof biomarkerStatusColors;
  return (
    biomarkerStatusColors[key] ?? {
      bg: colors.zinc[100],
      text: colors.zinc[500],
    }
  );
}

function formatReferenceRange(range?: { low?: number; high?: number }): string {
  if (!range) return '--';
  if (range.low != null && range.high != null)
    return `${range.low} - ${range.high}`;
  if (range.low != null) return `>= ${range.low}`;
  if (range.high != null) return `<= ${range.high}`;
  return '--';
}

// ---------------------------------------------------------------------------
// Column widths (percentage-ish flex ratios)
// ---------------------------------------------------------------------------

const COL_NAME = { flex: 3 };
const COL_VALUE = { flex: 1.5 };
const COL_UNIT = { flex: 1.5 };
const COL_RANGE = { flex: 2 };
const COL_STATUS = { flex: 1.5 };

// ---------------------------------------------------------------------------
// PdfBiomarkerTable
// ---------------------------------------------------------------------------

interface PdfBiomarkerTableProps {
  biomarkers: PdfBiomarker[];
}

/**
 * Renders a table of key biomarkers with status badges.
 *
 * Returns `null` when the biomarkers array is empty so the caller
 * can conditionally omit the section.
 */
export function PdfBiomarkerTable({ biomarkers }: PdfBiomarkerTableProps) {
  if (biomarkers.length === 0) return null;

  return (
    <View style={{ marginBottom: spacing[4] }}>
      {/* Section title */}
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: fontSize.md,
          fontWeight: 'bold',
          color: colors.zinc[900],
          marginBottom: spacing[2],
        }}
      >
        Key Biomarkers
      </Text>

      {/* Header row */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.zinc[100],
          paddingVertical: spacing[1],
          paddingHorizontal: spacing[2],
          borderRadius: 4,
          marginBottom: 2,
        }}
      >
        <Text
          style={{
            ...COL_NAME,
            fontFamily: FONT_FAMILY,
            fontSize: fontSize.xs,
            fontWeight: 'bold',
            color: colors.zinc[500],
          }}
        >
          Biomarker
        </Text>
        <Text
          style={{
            ...COL_VALUE,
            fontFamily: FONT_FAMILY,
            fontSize: fontSize.xs,
            fontWeight: 'bold',
            color: colors.zinc[500],
          }}
        >
          Value
        </Text>
        <Text
          style={{
            ...COL_UNIT,
            fontFamily: FONT_FAMILY,
            fontSize: fontSize.xs,
            fontWeight: 'bold',
            color: colors.zinc[500],
          }}
        >
          Unit
        </Text>
        <Text
          style={{
            ...COL_RANGE,
            fontFamily: FONT_FAMILY,
            fontSize: fontSize.xs,
            fontWeight: 'bold',
            color: colors.zinc[500],
          }}
        >
          Ref. Range
        </Text>
        <Text
          style={{
            ...COL_STATUS,
            fontFamily: FONT_FAMILY,
            fontSize: fontSize.xs,
            fontWeight: 'bold',
            color: colors.zinc[500],
          }}
        >
          Interpretation
        </Text>
      </View>

      {/* Data rows */}
      {biomarkers.map((biomarker, index) => {
        const statusColors = getStatusColors(biomarker.status);
        return (
          <View
            key={`${biomarker.name}-${index}`}
            wrap={false}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: spacing[1],
              paddingHorizontal: spacing[2],
              borderBottomWidth: 0.5,
              borderBottomColor: colors.zinc[200],
            }}
          >
            <Text
              style={{
                ...COL_NAME,
                fontFamily: FONT_FAMILY,
                fontSize: fontSize.sm,
                color: colors.zinc[900],
              }}
            >
              {biomarker.name}
            </Text>
            <Text
              style={{
                ...COL_VALUE,
                fontFamily: FONT_FAMILY,
                fontSize: fontSize.sm,
                color: colors.zinc[900],
              }}
            >
              {String(biomarker.value)}
            </Text>
            <Text
              style={{
                ...COL_UNIT,
                fontFamily: FONT_FAMILY,
                fontSize: fontSize.sm,
                color: colors.zinc[500],
              }}
            >
              {biomarker.unit}
            </Text>
            <Text
              style={{
                ...COL_RANGE,
                fontFamily: FONT_FAMILY,
                fontSize: fontSize.sm,
                color: colors.zinc[500],
              }}
            >
              {formatReferenceRange(biomarker.referenceRange)}
            </Text>
            <View style={{ ...COL_STATUS, justifyContent: 'center' }}>
              <View
                style={{
                  backgroundColor: statusColors.bg,
                  paddingHorizontal: spacing[1],
                  paddingVertical: 3,
                  borderRadius: 3,
                  alignSelf: 'flex-start',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: fontSize.xs,
                    fontWeight: 'bold',
                    lineHeight: 1,
                    color: statusColors.text,
                  }}
                >
                  {biomarker.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
