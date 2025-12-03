import { Get } from '@stepperize/react';
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { Spinner } from '@/components/ui/spinner';

import { TestKitSteps } from '../test-kit-steps/test-kit-steps';

import {
  ONBOARDING_STEPS,
  OnboardingStepper,
  useOnboardingStepper,
} from './onboarding-stepper';

import * as Steps from './index';

export const OnboardingSteps = () => {
  const { isLoading } = useOnboardingStepper();

  if (isLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Spinner variant="primary" />
      </div>
    );
  }

  return (
    <OnboardingStepper.Scoped>
      <OnboardingStepsContent />
    </OnboardingStepper.Scoped>
  );
};

const OnboardingStepsContent = (): React.ReactElement => {
  const { validSteps, methods, isLoading } = useOnboardingStepper();
  const [initialized, setInitialized] = useState(false);

  /**
   * This is a hack to prevent re-setting stepper state to the initial step when the component is re-rendered
   * Stepperize doesn't support async initial step, so we need to goTo the first step when the component is reanderd
   * and deps are avaliable
   */
  useEffect(() => {
    if (!isLoading && validSteps.length > 0 && !initialized) {
      methods.goTo(validSteps[0] as Get.Id<typeof OnboardingStepper.steps>);
      setInitialized(true);
    }
  }, [validSteps, methods, isLoading, initialized]);

  return (
    <AnimatePresence>
      <React.Fragment>
        {methods.switch({
          [ONBOARDING_STEPS.UPDATE_INFO]: () => <Steps.UpdateInfoStep />,
          [ONBOARDING_STEPS.BUNDLED_DISCOUNT]: () => (
            <Steps.BundledDiscountStep />
          ),
          [ONBOARDING_STEPS.ADVANCED_UPGRADE]: () => (
            <Steps.AdvancedPanelUpgradeStep />
          ),
          [ONBOARDING_STEPS.HEARD_ABOUT_US]: () => <Steps.HeardAboutUsStep />,
          [ONBOARDING_STEPS.INTAKE]: () => (
            <Steps.IntakeQuestionnaireStep showIntro={true} />
          ),
          [ONBOARDING_STEPS.GLP1_QUESTIONNAIRE]: () => (
            <Steps.GLPQuestionnaireStep showIntro={false} />
          ),
          [ONBOARDING_STEPS.ORGAN_AGE]: () => <Steps.OrganAgeStep />,
          [ONBOARDING_STEPS.FATIGUE_PANEL]: () => <Steps.FatiguePanelStep />,
          [ONBOARDING_STEPS.HORMONE_PANEL]: () => <Steps.HormonePanelStep />,
          [ONBOARDING_STEPS.ADD_ON_PANELS]: () => <Steps.AddOnPanelsStep />,
          [ONBOARDING_STEPS.TEST_KIT_STEPS]: () => <TestKitSteps />,
          [ONBOARDING_STEPS.PHLEBOTOMY_BOOKING]: () => (
            <Steps.PhlebotomyBookingStep />
          ),
          [ONBOARDING_STEPS.MISSION]: () => <Steps.MissionStep />,
        })}
      </React.Fragment>
    </AnimatePresence>
  );
};
