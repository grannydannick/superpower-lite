import { Page, Text, View } from '@react-pdf/renderer';

import type { Protocol } from '../../api/protocol';
import { FONT_FAMILY } from '../utils/pdf-fonts';
import {
  colors,
  fontSize,
  GOAL_COLOR_VALUES,
  pdfStyles,
  spacing,
} from '../utils/pdf-styles';

import { SuperpowerLogo } from './pdf-header-footer';

// ---------------------------------------------------------------------------
// PdfCoverPage
// ---------------------------------------------------------------------------

interface PdfCoverPageProps {
  protocol: Protocol;
}

/**
 * Cover page for the protocol PDF.
 *
 * Vertically centered layout containing the brand mark, title, subtitle,
 * a coloured divider, the generated date, goal count, and a summary list
 * of goals with numbered colour badges.
 */
export function PdfCoverPage({ protocol }: PdfCoverPageProps) {
  const created = new Date(protocol.createdAt);
  const safeDate = Number.isNaN(created.getTime()) ? new Date() : created;
  const formattedDate = safeDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Page size="A4" style={pdfStyles.page}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing[10],
        }}
      >
        {/* Brand mark */}
        <View style={{ marginBottom: spacing[4] }}>
          <SuperpowerLogo height={22} color={colors.vermillion[900]} />
        </View>

        {/* Title */}
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: fontSize['3xl'],
            fontWeight: 'bold',
            color: colors.zinc[900],
            marginBottom: spacing[4],
            textAlign: 'center',
          }}
        >
          Your Health Protocol
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: fontSize.lg,
            color: colors.zinc[500],
            textAlign: 'center',
            marginBottom: spacing[5],
          }}
        >
          Personalized recommendations based on your biomarkers
        </Text>

        {/* Vermillion divider */}
        <View
          style={{
            width: 60,
            height: 2,
            backgroundColor: colors.vermillion[900],
            marginBottom: spacing[5],
          }}
        />

        {/* Generated date */}
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: fontSize.base,
            color: colors.zinc[500],
            marginBottom: spacing[1],
          }}
        >
          {formattedDate}
        </Text>

        {/* Goal count */}
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: fontSize.base,
            color: colors.zinc[500],
            marginBottom: spacing[5],
          }}
        >
          {protocol.goals.length} Health Goals
        </Text>

        {/* Goal summary list */}
        <View style={{ alignItems: 'flex-start', gap: spacing[2] }}>
          {protocol.goals.map((goal, index) => (
            <View
              key={goal.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {/* Colored number badge */}
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor:
                    GOAL_COLOR_VALUES[index % GOAL_COLOR_VALUES.length],
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing[2],
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: fontSize.xs,
                    fontWeight: 'bold',
                    color: colors.white,
                    lineHeight: 1,
                    textAlign: 'center',
                  }}
                >
                  {index + 1}
                </Text>
              </View>

              {/* Goal title */}
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: fontSize.base,
                  color: colors.zinc[700],
                }}
              >
                {goal.title}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  );
}
