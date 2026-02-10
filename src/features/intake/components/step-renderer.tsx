import { AnimatePresence } from 'framer-motion';

import * as QuestionnaireSequence from '@/features/onboarding/components/sequences/questionnaire';
import { STEP_IDS } from '@/features/onboarding/config/step-config';
import { useOnboardingFlowStore } from '@/features/onboarding/stores/onboarding-flow-store';

import { CompletionStep } from './completion-step';
import { SplashStep } from './splash-step';

export const IntakeStepRenderer = () => {
  const step = useOnboardingFlowStore((s) => s.currentStep);

  const renderStep = () => {
    switch (step) {
      case STEP_IDS.INTAKE_SPLASH:
        return <SplashStep />;
      case STEP_IDS.INTAKE_COMPLETION:
        return <CompletionStep />;
      case STEP_IDS.PRIMER:
        return (
          <QuestionnaireSequence.OnboardingQuestionnaireStep questionnaireName="onboarding-primer" />
        );
      case STEP_IDS.MEDICAL_HISTORY:
        return (
          <QuestionnaireSequence.OnboardingQuestionnaireStep questionnaireName="onboarding-medical-history" />
        );
      case STEP_IDS.FEMALE_HEALTH:
        return (
          <QuestionnaireSequence.OnboardingQuestionnaireStep questionnaireName="onboarding-female-health" />
        );
      case STEP_IDS.LIFESTYLE:
        return (
          <QuestionnaireSequence.OnboardingQuestionnaireStep questionnaireName="onboarding-lifestyle" />
        );
      default:
        throw new Error(`Unknown intake step: ${step}`);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <div key={step} className="flex min-h-dvh flex-col">
        {renderStep()}
      </div>
    </AnimatePresence>
  );
};
