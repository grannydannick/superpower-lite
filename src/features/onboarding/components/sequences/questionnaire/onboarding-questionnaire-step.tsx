import {
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
} from '@medplum/fhirtypes';

import { Head } from '@/components/seo';
import { QuestionnaireForm } from '@/components/ui/questionnaire';
import { Spinner } from '@/components/ui/spinner';
import {
  getOnboardingStepTitle,
  ONBOARDING_STEP_IDS,
} from '@/features/onboarding/components/flow/onboarding-step-manifest';
import { useQuestionnaireResponseController } from '@/features/questionnaires/hooks/use-questionnaire-response-controller';
import { pruneResponseItems } from '@/features/questionnaires/utils/prune-response-items';
import { useUser } from '@/lib/auth';

import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';

type Props = {
  questionnaireName: string;
};

interface QuestionnaireStepContentProps {
  questionnaireName: string;
  onSubmitSuccess: () => void;
}

/**
 * Generic onboarding questionnaire step component.
 * Renders any questionnaire by name with auto-save and auto-advance on submit.
 * Creates a questionnaire response on first save/submit if missing.
 */
export const ONBOARDING_QUESTIONNAIRE_NAMES = [
  'onboarding-intake',
  'onboarding-primer',
  'onboarding-medical-history',
  'onboarding-female-health',
  'onboarding-lifestyle',
] as const;

export type OnboardingQuestionnaireName =
  (typeof ONBOARDING_QUESTIONNAIRE_NAMES)[number];

const QUESTIONNAIRE_TITLES: Partial<Record<string, string>> = {
  'onboarding-intake': 'Intake',
  'onboarding-primer': getOnboardingStepTitle(ONBOARDING_STEP_IDS.PRIMER),
  'onboarding-medical-history': getOnboardingStepTitle(
    ONBOARDING_STEP_IDS.MEDICAL_HISTORY,
  ),
  'onboarding-female-health': getOnboardingStepTitle(
    ONBOARDING_STEP_IDS.FEMALE_HEALTH,
  ),
  'onboarding-lifestyle': getOnboardingStepTitle(ONBOARDING_STEP_IDS.LIFESTYLE),
};

export const QuestionnaireStepContent = ({
  questionnaireName,
  onSubmitSuccess,
}: QuestionnaireStepContentProps) => {
  const userQuery = useUser();
  const pageTitle = QUESTIONNAIRE_TITLES[questionnaireName] ?? 'Questionnaire';
  const {
    questionnaire,
    response: questionnaireResponse,
    isLoading: isQuestionnaireLoading,
    save,
    submit,
  } = useQuestionnaireResponseController({
    questionnaireName,
    statuses: ['in-progress', 'completed', 'stopped'],
    normalizeItems: pruneResponseItems,
  });

  // Show loading while fetching core data
  if (isQuestionnaireLoading || userQuery.isLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Spinner variant="primary" size="md" />
      </div>
    );
  }

  if (!questionnaire || !userQuery.data) {
    return null;
  }

  const handleSave = async (item: QuestionnaireResponseItem[]) => {
    await save(item);
  };

  const handleSubmit = async (item: QuestionnaireResponseItem[]) => {
    await submit(item, { onSuccess: onSubmitSuccess });
  };

  return (
    <>
      <Head title={pageTitle} />
      <QuestionnaireForm
        questionnaire={questionnaire as unknown as Questionnaire}
        response={questionnaireResponse as unknown as QuestionnaireResponse}
        user={userQuery.data}
        onSave={handleSave}
        onSubmit={handleSubmit}
        // HACK: floor the initial progress while question count is conditional.
        initialProgressPercent={
          questionnaireName === 'onboarding-female-health' ? 35 : undefined
        }
        className="space-y-6"
      />
    </>
  );
};

export const OnboardingQuestionnaireStep = ({ questionnaireName }: Props) => {
  const { next } = useOnboardingNavigation();

  return (
    <QuestionnaireStepContent
      questionnaireName={questionnaireName}
      onSubmitSuccess={next}
    />
  );
};
