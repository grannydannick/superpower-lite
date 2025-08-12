import { IntakeQuestionnaire } from '@/features/questionnaires/components/intake-questionnaire';
import { ScreeningQuestionnaire } from '@/features/questionnaires/components/screening-questionnaire';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { useAnalytics } from '@/hooks/use-analytics';
import { useStepper } from '@/lib/stepper/stepper';

interface QuestionnaireStepProps {
  type: 'intake' | 'screening';
  showIntro?: boolean;
}

export const QuestionnaireStep = ({
  type,
  showIntro = true,
}: QuestionnaireStepProps) => {
  const { nextStep, activeStep } = useStepper((s) => s);
  const { track } = useAnalytics();
  const { mutateAsync: updateTaskProgress, isError } = useUpdateTask();

  const updateStep = async () => {
    await updateTaskProgress({
      taskName: 'onboarding',
      data: { progress: activeStep + 1 },
    });

    if (type === 'intake') {
      track('completed_intake');
    }

    if (!isError) {
      nextStep();
    }
  };

  switch (type) {
    case 'intake':
      return (
        <IntakeQuestionnaire showIntro={showIntro} onSubmit={updateStep} />
      );
    case 'screening':
      return <ScreeningQuestionnaire onSubmit={updateStep} showIntro={false} />;
    default:
      return null;
  }
};
