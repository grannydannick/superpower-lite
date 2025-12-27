import { useNavigate } from 'react-router-dom';

import { IntakeQuestionnaire } from '@/features/questionnaires/components/intake-questionnaire';
import { useUpdateTask } from '@/features/tasks/api/update-task';

import { useOnboardingStepper } from './onboarding-stepper';

interface QuestionnaireStepProps {
  showIntro?: boolean;
}

export const IntakeQuestionnaireStep = ({
  showIntro = true,
}: QuestionnaireStepProps) => {
  const navigate = useNavigate();
  const { next, isLastStep } = useOnboardingStepper();
  const { mutateAsync: updateTaskProgress } = useUpdateTask();

  const onSubmit = async () => {
    if (isLastStep) {
      await updateTaskProgress({
        taskName: 'onboarding',
        data: { status: 'completed' },
      });
      navigate('/');
    } else {
      next();
    }
  };

  return <IntakeQuestionnaire showIntro={showIntro} onSubmit={onSubmit} />;
};
