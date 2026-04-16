import { NON_SYMPTOM_RX_VALUE_RE } from '@/const/questionnaire';
import { type OnboardingQuestionnaire } from '@/features/onboarding/api/onboarding';

interface RxQuestionnaireSummary {
  identifier:
    | OnboardingQuestionnaire['identifier']
    | `${OnboardingQuestionnaire['identifier']}-symptom-tracker`;
  status: OnboardingQuestionnaire['status'];
}

/**
 * Derives whether the member has an Rx intake questionnaire to complete.
 *
 * We treat any onboarding questionnaire summary whose `identifier` matches
 * `NON_SYMPTOM_RX_VALUE_RE` as an Rx intake questionnaire (excluding symptom
 * trackers).
 */
export const getRxQuestionnaireContext = (
  questionnaires: ReadonlyArray<RxQuestionnaireSummary> | undefined,
) => {
  let hasCompletedQuestionnaire = false;

  for (const questionnaire of questionnaires ?? []) {
    if (!NON_SYMPTOM_RX_VALUE_RE.test(questionnaire.identifier)) {
      continue;
    }

    if (questionnaire.status === 'in_progress') {
      return {
        status: 'required',
        questionnaireIdentifier: questionnaire.identifier,
      } as const;
    }

    if (questionnaire.status === 'completed') {
      hasCompletedQuestionnaire = true;
    }
  }

  if (hasCompletedQuestionnaire) {
    return {
      status: 'completed',
    } as const;
  }

  return {
    status: 'none',
  } as const;
};

/**
 * Discriminated union describing whether an Rx intake questionnaire is required.
 *
 * - `none`: no matching Rx intake questionnaire summary exists
 * - `required`: an in-progress Rx intake questionnaire exists and should be resumed
 * - `completed`: at least one matching Rx intake questionnaire is completed
 */
export type RxQuestionnaireContext = ReturnType<
  typeof getRxQuestionnaireContext
>;
