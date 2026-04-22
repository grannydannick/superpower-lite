import { lazy, type ReactElement } from 'react';

import {
  ONBOARDING_STEP_IDS,
  type OnboardingStepId,
} from './onboarding-step-manifest';

interface OnboardingStepRendererDefinition {
  render: () => ReactElement;
}

const createLazyStepRenderer = (
  loadStep: () => Promise<{ default: () => ReactElement }>,
): OnboardingStepRendererDefinition => {
  const StepComponent = lazy(loadStep);

  return {
    render: () => <StepComponent />,
  };
};

const createLazyQuestionnaireRenderer = (questionnaireName: string) => {
  const StepComponent = lazy(async () => {
    const module =
      await import('@/features/onboarding/components/sequences/questionnaire/onboarding-questionnaire-step');

    return {
      default: module.OnboardingQuestionnaireStep,
    };
  });

  return {
    render: () => <StepComponent questionnaireName={questionnaireName} />,
  };
};

const ONBOARDING_STEP_RENDERERS: Record<
  OnboardingStepId,
  OnboardingStepRendererDefinition
> = {
  [ONBOARDING_STEP_IDS.WELCOME]: createLazyStepRenderer(async () => {
    const module =
      await import('@/features/onboarding/components/sequences/welcome/welcome-sequence');

    return {
      default: module.WelcomeSequence,
    };
  }),
  [ONBOARDING_STEP_IDS.GIFT_UPSELL]: createLazyStepRenderer(async () => {
    const module =
      await import('@/features/onboarding/components/sequences/gift-upsell/gift-upsell-sequence');

    return {
      default: module.GiftUpsellSequence,
    };
  }),
  [ONBOARDING_STEP_IDS.UPDATE_INFO]: createLazyStepRenderer(async () => {
    const module =
      await import('@/features/onboarding/components/steps/info/update-info-step');

    return {
      default: module.UpdateInfoStep,
    };
  }),
  [ONBOARDING_STEP_IDS.HEARD_ABOUT_US]: createLazyStepRenderer(async () => {
    const module =
      await import('@/features/onboarding/components/sequences/heard-about-us/heard-about-us-sequence');

    return {
      default: module.HeardAboutUsSequence,
    };
  }),
  [ONBOARDING_STEP_IDS.ADVANCED_UPGRADE]: createLazyStepRenderer(async () => {
    const module =
      await import('@/features/onboarding/components/steps/advanced-panel-upgrade/advanced-panel-upgrade-step');

    return {
      default: module.AdvancedPanelUpgradeStep,
    };
  }),
  [ONBOARDING_STEP_IDS.INTRODUCTION]: createLazyStepRenderer(async () => {
    const module =
      await import('@/features/onboarding/components/sequences/introduction/introduction-sequence');

    return {
      default: module.IntroductionSequence,
    };
  }),
  [ONBOARDING_STEP_IDS.HEALTH_PROFILE]: createLazyStepRenderer(async () => {
    const module =
      await import('@/features/onboarding/components/sequences/health-profile/health-profile-sequence');

    return {
      default: module.HealthProfileSequence,
    };
  }),
  [ONBOARDING_STEP_IDS.WHAT_HAPPENS_NEXT]: createLazyStepRenderer(async () => {
    const module =
      await import('@/features/onboarding/components/sequences/what-happens-next/what-happens-next-sequence');

    return {
      default: module.WhatHappensNextSequence,
    };
  }),
  [ONBOARDING_STEP_IDS.RX_ASSESSMENT]: createLazyStepRenderer(async () => {
    const module =
      await import('@/features/onboarding/components/steps/rx-assessment/rx-assessment-step');

    return {
      default: module.RxAssessmentStep,
    };
  }),
  [ONBOARDING_STEP_IDS.PRIMER_INTRO]: createLazyStepRenderer(async () => {
    const module =
      await import('@/features/onboarding/components/sequences/questionnaire/onboarding-primer-intro-step');

    return {
      default: module.OnboardingPrimerIntroStep,
    };
  }),
  [ONBOARDING_STEP_IDS.PRIMER]:
    createLazyQuestionnaireRenderer('onboarding-primer'),
  [ONBOARDING_STEP_IDS.MEDICAL_HISTORY_INTRO]: createLazyStepRenderer(
    async () => {
      const module =
        await import('@/features/onboarding/components/sequences/questionnaire/onboarding-medical-history-intro-step');

      return {
        default: module.OnboardingMedicalHistoryIntroStep,
      };
    },
  ),
  [ONBOARDING_STEP_IDS.MEDICAL_HISTORY]: createLazyQuestionnaireRenderer(
    'onboarding-medical-history',
  ),
  [ONBOARDING_STEP_IDS.FEMALE_HEALTH_INTRO]: createLazyStepRenderer(
    async () => {
      const module =
        await import('@/features/onboarding/components/sequences/questionnaire/onboarding-female-health-intro-step');

      return {
        default: module.OnboardingFemaleHealthIntroStep,
      };
    },
  ),
  [ONBOARDING_STEP_IDS.FEMALE_HEALTH]: createLazyQuestionnaireRenderer(
    'onboarding-female-health',
  ),
  [ONBOARDING_STEP_IDS.LIFESTYLE_INTRO]: createLazyStepRenderer(async () => {
    const module =
      await import('@/features/onboarding/components/sequences/questionnaire/onboarding-lifestyle-intro-step');

    return {
      default: module.OnboardingLifestyleIntroStep,
    };
  }),
  [ONBOARDING_STEP_IDS.LIFESTYLE]: createLazyQuestionnaireRenderer(
    'onboarding-lifestyle',
  ),
  [ONBOARDING_STEP_IDS.BUILDING_RECOMMENDATIONS]: createLazyStepRenderer(
    async () => {
      const module =
        await import('@/features/onboarding/components/steps/building-recommendations/building-recommendations-step');

      return {
        default: module.BuildingRecommendationsStep,
      };
    },
  ),
  [ONBOARDING_STEP_IDS.ADD_ON_PANELS]: createLazyStepRenderer(async () => {
    const module =
      await import('@/features/onboarding/components/steps/add-on-panels-step');

    return {
      default: module.default,
    };
  }),
  [ONBOARDING_STEP_IDS.PHLEBOTOMY_BOOKING]: createLazyStepRenderer(async () => {
    const module =
      await import('@/features/onboarding/components/steps/phlebotomy-booking/phlebotomy-booking-step');

    return {
      default: module.PhlebotomyBookingStep,
    };
  }),
};

export function getOnboardingStepDefinition(stepId: OnboardingStepId | null) {
  if (stepId == null) {
    return undefined;
  }

  return ONBOARDING_STEP_RENDERERS[stepId];
}
