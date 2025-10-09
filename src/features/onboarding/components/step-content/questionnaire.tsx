import { IntakeQuestionnaire } from '@/features/questionnaires/components/intake-questionnaire';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { useStepper } from '@/lib/stepper/stepper';

interface QuestionnaireStepProps {
  showIntro?: boolean;
}

export const QuestionnaireStep = ({
  showIntro = true,
}: QuestionnaireStepProps) => {
  const { nextStep, activeStep } = useStepper((s) => s);
  const { mutateAsync: updateTaskProgress, isError } = useUpdateTask();

  const updateStep = async () => {
    await updateTaskProgress({
      taskName: 'onboarding',
      data: { progress: activeStep + 1 },
    });

    if (!isError) {
      nextStep();
    }
  };

  return <IntakeQuestionnaire showIntro={showIntro} onSubmit={updateStep} />;
};
