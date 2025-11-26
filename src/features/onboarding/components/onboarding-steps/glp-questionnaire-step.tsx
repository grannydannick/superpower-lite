import { GLP_FRONTDOOR_EXPERIMENT } from '@/const/questionnaire';
import { RxQuestionnaire } from '@/features/questionnaires/components/rx-questionnaire';

import { useOnboardingStepper } from './onboarding-stepper';

interface GLPQuestionnaireStepProps {
  showIntro?: boolean;
}

export const GLPQuestionnaireStep = ({
  showIntro = false,
}: GLPQuestionnaireStepProps) => {
  const { next } = useOnboardingStepper();

  return (
    <RxQuestionnaire
      name={GLP_FRONTDOOR_EXPERIMENT}
      showIntro={showIntro}
      onSubmit={next}
    />
  );
};
