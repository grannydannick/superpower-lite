import { Page, Text, View } from '@react-pdf/renderer';

import type { ProtocolGoal } from '../../api/protocol';
import { renderMarkdownToPdf } from '../utils/markdown-to-pdf';
import { FONT_FAMILY } from '../utils/pdf-fonts';
import {
  colors,
  fontSize,
  GOAL_COLOR_VALUES,
  pdfStyles,
  spacing,
} from '../utils/pdf-styles';

import { PdfActionCard } from './pdf-action-card';
import type { PdfBiomarker } from './pdf-biomarker-table';
import { PdfBiomarkerTable } from './pdf-biomarker-table';
// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontFamily: FONT_FAMILY,
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.zinc[900],
        marginBottom: spacing[2],
      }}
    >
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// PdfGoalSection
// ---------------------------------------------------------------------------

interface PdfGoalSectionProps {
  goal: ProtocolGoal;
  goalIndex: number;
  biomarkers: PdfBiomarker[];
}

/**
 * Renders a full goal section spanning one or more A4 pages.
 *
 * Includes a coloured number badge header, biomarker table, description,
 * possible symptoms, impact content, and recommended actions.
 */
export function PdfGoalSection({
  goal,
  goalIndex,
  biomarkers,
}: PdfGoalSectionProps) {
  const badgeColor = GOAL_COLOR_VALUES[goalIndex % GOAL_COLOR_VALUES.length];

  return (
    <Page size="A4" style={pdfStyles.page} wrap>
      {/* Goal Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing[3],
        }}
      >
        {/* Colored number badge */}
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: badgeColor,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing[3],
          }}
        >
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: fontSize.md,
              fontWeight: 'bold',
              color: colors.white,
              lineHeight: 1,
              textAlign: 'center',
            }}
          >
            {goalIndex + 1}
          </Text>
        </View>

        {/* Title + subtitle + recovery time */}
        <View style={{ flex: 1 }}>
          <Text style={pdfStyles.h3}>{goal.title}</Text>
          {goal.subtitle ? (
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: fontSize.base,
                color: colors.zinc[500],
              }}
            >
              {goal.subtitle}
            </Text>
          ) : null}
          {goal.recoveryTime ? (
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: fontSize.sm,
                color: colors.zinc[400],
                marginTop: spacing[1],
              }}
            >
              Recovery time: {goal.recoveryTime}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Biomarker Table */}
      <PdfBiomarkerTable biomarkers={biomarkers} />

      {/* Description — "What We Found" */}
      {goal.description?.trim() ? (
        <View style={pdfStyles.section}>
          <SectionTitle>What We Found</SectionTitle>
          <View>{renderMarkdownToPdf(goal.description)}</View>
        </View>
      ) : null}

      {/* Possible Symptoms — "How You Might Be Feeling" */}
      {goal.possibleSymptoms && goal.possibleSymptoms.length > 0 ? (
        <View style={[pdfStyles.section, { marginBottom: spacing[5] }]}>
          <SectionTitle>How You Might Be Feeling</SectionTitle>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing[1],
            }}
          >
            {goal.possibleSymptoms.map((symptom, index) => (
              <View
                key={`symptom-${index}`}
                style={{
                  backgroundColor: colors.vermillion[50],
                  paddingHorizontal: spacing[2],
                  paddingVertical: 5,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: fontSize.sm,
                    lineHeight: 1,
                    color: colors.vermillion[900],
                  }}
                >
                  {symptom}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Impact Content — "Why This Matters" */}
      {goal.impactContent ? (
        <View style={pdfStyles.section}>
          <SectionTitle>Why This Matters</SectionTitle>
          <View>{renderMarkdownToPdf(goal.impactContent)}</View>
        </View>
      ) : null}

      {/* Recommended Actions */}
      <View style={pdfStyles.section}>
        <SectionTitle>Recommended Actions</SectionTitle>
        <PdfActionCard action={goal.primaryAction} isPrimary />
        {goal.additionalActions?.map((action) => (
          <PdfActionCard key={action.id} action={action} />
        ))}
      </View>
    </Page>
  );
}
