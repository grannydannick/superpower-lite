import { AnimatePresence } from 'framer-motion';
import React from 'react';

import * as QuestionnaireSequence from '@/features/onboarding/components/sequences/questionnaire';
import { STEP_IDS } from '@/features/onboarding/config/step-config';
import { useOnboardingFlowStore } from '@/features/onboarding/stores/onboarding-flow-store';

import { CompletionStep } from './completion-step';
import { SplashStep } from './splash-step';

export const IntakeStepRenderer = () => {
  const step = useOnboardingFlowStore((s) => s.currentStep);

  let content: React.ReactElement;
  switch (step) {
    case STEP_IDS.INTAKE_SPLASH:
      content = <SplashStep />;
      break;
    case STEP_IDS.INTAKE_COMPLETION:
      content = <CompletionStep />;
      break;
    case STEP_IDS.PRIMER:
      content = (
        <QuestionnaireSequence.OnboardingQuestionnaireStep questionnaireName="onboarding-primer" />
      );
      break;
    case STEP_IDS.MEDICAL_HISTORY:
      content = (
        <QuestionnaireSequence.OnboardingQuestionnaireStep questionnaireName="onboarding-medical-history" />
      );
      break;
    case STEP_IDS.FEMALE_HEALTH:
      content = (
        <QuestionnaireSequence.OnboardingQuestionnaireStep questionnaireName="onboarding-female-health" />
      );
      break;
    case STEP_IDS.LIFESTYLE:
      content = (
        <QuestionnaireSequence.OnboardingQuestionnaireStep questionnaireName="onboarding-lifestyle" />
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
};
