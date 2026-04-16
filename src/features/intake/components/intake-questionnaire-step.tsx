import { QuestionnaireStepContent } from '@/features/onboarding/components/sequences/questionnaire/onboarding-questionnaire-step';

import { useIntakeNavigation } from '../hooks/use-intake-navigation';

interface IntakeQuestionnaireStepProps {
  questionnaireName: string;
}

export const IntakeQuestionnaireStep = ({
  questionnaireName,
}: IntakeQuestionnaireStepProps) => {
  const { next } = useIntakeNavigation();

  return (
    <QuestionnaireStepContent
      questionnaireName={questionnaireName}
      onSubmitSuccess={next}
    />
  );
};
