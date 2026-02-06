import { AnimatePresence } from 'framer-motion';

import {
  CommitmentSequence,
  DigitalTwinSequence,
  FinishTwinSequence,
  HeardAboutUsSequence,
  IntroductionSequence,
  OrganAgeSequence,
  UpsellSequence,
} from '@/features/onboarding/components/sequences';
import * as QuestionnaireSequence from '@/features/onboarding/components/sequences/questionnaire';
import * as Steps from '@/features/onboarding/components/steps';
import { STEP_IDS } from '@/features/onboarding/config/step-config';
import { useOnboardingFlowStore } from '@/features/onboarding/stores/onboarding-flow-store';

export const StepRenderer = () => {
  const currentStep = useOnboardingFlowStore((state) => state.currentStep);

  const renderStep = () => {
    switch (currentStep) {
      case STEP_IDS.UPDATE_INFO:
        return <Steps.UpdateInfoStep />;
      case STEP_IDS.HEARD_ABOUT_US:
        return <HeardAboutUsSequence />;
      case STEP_IDS.INTRODUCTION:
        return <IntroductionSequence />;
      case STEP_IDS.DIGITAL_TWIN:
        return <DigitalTwinSequence />;
      case STEP_IDS.BUNDLED_DISCOUNT:
        return <Steps.BundledDiscountStep />;
      case STEP_IDS.ORGAN_AGE:
        return <OrganAgeSequence />;
      case STEP_IDS.ADVANCED_UPGRADE:
        return <Steps.AdvancedPanelUpgradeStep />;
      case STEP_IDS.FINISH_TWIN:
        return <FinishTwinSequence />;
      case STEP_IDS.PRIMER_INTRO:
        return <QuestionnaireSequence.OnboardingPrimerIntroStep />;
      case STEP_IDS.PRIMER:
        return (
          <QuestionnaireSequence.OnboardingQuestionnaireStep questionnaireName="onboarding-primer" />
        );
      case STEP_IDS.MEDICAL_HISTORY_INTRO:
        return <QuestionnaireSequence.OnboardingMedicalHistoryIntroStep />;
      case STEP_IDS.MEDICAL_HISTORY:
        return (
          <QuestionnaireSequence.OnboardingQuestionnaireStep questionnaireName="onboarding-medical-history" />
        );
      case STEP_IDS.FEMALE_HEALTH_INTRO:
        return <QuestionnaireSequence.OnboardingFemaleHealthIntroStep />;
      case STEP_IDS.FEMALE_HEALTH:
        return (
          <QuestionnaireSequence.OnboardingQuestionnaireStep questionnaireName="onboarding-female-health" />
        );
      case STEP_IDS.LIFESTYLE_INTRO:
        return <QuestionnaireSequence.OnboardingLifestyleIntroStep />;
      case STEP_IDS.LIFESTYLE:
        return (
          <QuestionnaireSequence.OnboardingQuestionnaireStep questionnaireName="onboarding-lifestyle" />
        );
      case STEP_IDS.ADD_ON_PANELS:
        return <Steps.AddOnPanelsStep />;
      case STEP_IDS.UPSELL_PANELS:
        return <UpsellSequence />;
      case STEP_IDS.PHLEBOTOMY_BOOKING:
        return <Steps.PhlebotomyBookingStep />;
      case STEP_IDS.COMMITMENT:
        return <CommitmentSequence />;
      default:
        throw new Error(`Unknown onboarding step: ${currentStep}`);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <div key={currentStep} className="flex min-h-dvh flex-col">
        {renderStep()}
      </div>
    </AnimatePresence>
  );
};
