import { createFileRoute } from '@tanstack/react-router';
import { AnimatePresence } from 'framer-motion';
import type { ReactElement } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { CompletionStep } from '@/features/intake/components/completion-step';
import { IntakeQuestionnaireStep } from '@/features/intake/components/intake-questionnaire-step';
import { SplashStep } from '@/features/intake/components/splash-step';
import { useIntakeFlow } from '@/features/intake/hooks/use-intake-flow';
import { INTAKE_STEP_IDS } from '@/features/intake/intake-step-ids';
import { useIntakeFlowStore } from '@/features/intake/stores/intake-flow-store';

export const Route = createFileRoute('/_app/intake')({
  component: IntakeComponent,
});

function IntakeComponent() {
  const { isLoading, isInitialized } = useIntakeFlow();
  const step = useIntakeFlowStore((state) => state.currentStep);

  if (isLoading || !isInitialized) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  }

  let content: ReactElement;
  switch (step) {
    case INTAKE_STEP_IDS.INTAKE_SPLASH:
      content = <SplashStep />;
      break;
    case INTAKE_STEP_IDS.INTAKE_COMPLETION:
      content = <CompletionStep />;
      break;
    case INTAKE_STEP_IDS.PRIMER:
      content = (
        <IntakeQuestionnaireStep questionnaireName="onboarding-primer" />
      );
      break;
    case INTAKE_STEP_IDS.MEDICAL_HISTORY:
      content = (
        <IntakeQuestionnaireStep questionnaireName="onboarding-medical-history" />
      );
      break;
    case INTAKE_STEP_IDS.FEMALE_HEALTH:
      content = (
        <IntakeQuestionnaireStep questionnaireName="onboarding-female-health" />
      );
      break;
    case INTAKE_STEP_IDS.LIFESTYLE:
      content = (
        <IntakeQuestionnaireStep questionnaireName="onboarding-lifestyle" />
      );
      break;
    default:
      throw new Error(`Unknown intake step: ${step}`);
  }

  return (
    <AnimatePresence mode="wait">
      <div key={step} className="flex min-h-dvh flex-col">
        {content}
      </div>
    </AnimatePresence>
  );
}
