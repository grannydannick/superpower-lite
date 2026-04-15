import { AnimatePresence } from 'framer-motion';
import React from 'react';

import {
  DigitalTwinSequence,
  FinishTwinSequence,
  GiftUpsellSequence,
  HeardAboutUsSequence,
  IntroductionSequence,
  UpsellSequence,
  WelcomeSequence,
} from '@/features/onboarding/components/sequences';
import * as QuestionnaireSequence from '@/features/onboarding/components/sequences/questionnaire';
import * as Steps from '@/features/onboarding/components/steps';
import { STEP_IDS } from '@/features/onboarding/config/step-config';
import { useOnboardingFlowStore } from '@/features/onboarding/stores/onboarding-flow-store';

export const StepRenderer = () => {
  const currentStep = useOnboardingFlowStore((state) => state.currentStep);
  const isExternalRedirectPending = useOnboardingFlowStore(
    (state) => state.isExternalRedirectPending,
  );

  if (isExternalRedirectPending) return null;

  let content: React.ReactElement;
  switch (currentStep) {
    case STEP_IDS.WELCOME:
      content = <WelcomeSequence />;
      break;
    case STEP_IDS.GIFT_UPSELL:
      content = <GiftUpsellSequence />;
      break;
    case STEP_IDS.UPDATE_INFO:
      content = <Steps.UpdateInfoStep />;
      break;
    case STEP_IDS.HEARD_ABOUT_US:
      content = <HeardAboutUsSequence />;
      break;
    case STEP_IDS.INTRODUCTION:
      content = <IntroductionSequence />;
      break;
    case STEP_IDS.DIGITAL_TWIN:
      content = <DigitalTwinSequence />;
      break;
    case STEP_IDS.ADVANCED_UPGRADE:
      content = <Steps.AdvancedPanelUpgradeStep />;
      break;
    case STEP_IDS.FINISH_TWIN:
      content = <FinishTwinSequence />;
      break;
    case STEP_IDS.RX_ASSESSMENT:
      content = <Steps.RxAssessmentStep />;
      break;
    case STEP_IDS.PRIMER_INTRO:
      content = <QuestionnaireSequence.OnboardingPrimerIntroStep />;
      break;
    case STEP_IDS.PRIMER:
      content = (
        <QuestionnaireSequence.OnboardingQuestionnaireStep questionnaireName="onboarding-primer" />
      );
      break;
    case STEP_IDS.MEDICAL_HISTORY_INTRO:
      content = <QuestionnaireSequence.OnboardingMedicalHistoryIntroStep />;
      break;
    case STEP_IDS.MEDICAL_HISTORY:
      content = (
        <QuestionnaireSequence.OnboardingQuestionnaireStep questionnaireName="onboarding-medical-history" />
      );
      break;
    case STEP_IDS.FEMALE_HEALTH_INTRO:
      content = <QuestionnaireSequence.OnboardingFemaleHealthIntroStep />;
      break;
    case STEP_IDS.FEMALE_HEALTH:
      content = (
        <QuestionnaireSequence.OnboardingQuestionnaireStep questionnaireName="onboarding-female-health" />
      );
      break;
    case STEP_IDS.LIFESTYLE_INTRO:
      content = <QuestionnaireSequence.OnboardingLifestyleIntroStep />;
      break;
    case STEP_IDS.LIFESTYLE:
      content = (
        <QuestionnaireSequence.OnboardingQuestionnaireStep questionnaireName="onboarding-lifestyle" />
      );
      break;
    case STEP_IDS.ADD_ON_PANELS:
      content = <Steps.AddOnPanelsStep />;
      break;
    case STEP_IDS.UPSELL_PANELS:
      content = <UpsellSequence />;
      break;
    case STEP_IDS.PHLEBOTOMY_BOOKING:
      content = <Steps.PhlebotomyBookingStep />;
      break;
    default:
      throw new Error(`Unknown onboarding step: ${currentStep}`);
  }

  return (
    <AnimatePresence mode="wait">
      <div key={currentStep} className="flex min-h-dvh flex-col">
        {content}
      </div>
    </AnimatePresence>
  );
};
