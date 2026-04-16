import { Head } from '@/components/seo';
import { Spinner } from '@/components/ui/spinner';
import { useSuspenseOnboarding } from '@/features/onboarding/api/onboarding';
import {
  getOnboardingStepTitle,
  ONBOARDING_STEP_IDS,
} from '@/features/onboarding/components/flow/onboarding-step-manifest';
import { RxQuestionnaire } from '@/features/questionnaires/components/rx-questionnaire';

import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';
import { getRxQuestionnaireContext } from '../../../utils/get-rx-questionnaire-context';

const LoadingState = ({ label }: { label?: string }) => {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-3">
      <Spinner variant="primary" size="md" />
      {label == null ? null : (
        <p className="text-sm text-zinc-500" role="status">
          {label}
        </p>
      )}
    </div>
  );
};

export const RxAssessmentStep = () => {
  const { next } = useOnboardingNavigation();
  const { data: onboardingData } = useSuspenseOnboarding();

  const rxQuestionnaireContext = getRxQuestionnaireContext(
    onboardingData.questionnaires,
  );

  if (rxQuestionnaireContext.status !== 'required') {
    return (
      <>
        <Head
          title={getOnboardingStepTitle(ONBOARDING_STEP_IDS.RX_ASSESSMENT)}
        />
        <LoadingState label="Preparing your next step..." />
      </>
    );
  }

  return (
    <>
      <Head title={getOnboardingStepTitle(ONBOARDING_STEP_IDS.RX_ASSESSMENT)} />
      <RxQuestionnaire
        name={rxQuestionnaireContext.questionnaireIdentifier}
        onSubmit={next}
      />
    </>
  );
};
