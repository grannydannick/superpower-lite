import { describe, expect, it } from 'vitest';

import {
  type GetOnboardingResponse,
  type OnboardingQuestionnaireIdentifier,
} from '@/features/onboarding/api/onboarding';

import {
  buildOnboardingFacts,
  getOnboardingAnalyticsStepId,
  getValidOnboardingSteps,
  type OnboardingFacts,
  ONBOARDING_STEP_IDS,
} from '../onboarding-step-manifest';

const baseContext: OnboardingFacts = {
  userInfoCompleted: false,
  userGender: null,
  completedQuestionnaires: new Set<OnboardingQuestionnaireIdentifier>(),
  creditedServiceIds: new Set<string>(),
  hasStartedIntake: false,
  hasSeenWelcome: false,
  hasSeenGiftUpsell: false,
  rxQuestionnaireContext: { status: 'none' },
  showUpsells: true,
};

const baseOnboardingData: GetOnboardingResponse = {
  status: {
    state: 'in_progress',
  },
  userInfo: {
    userInfoCompleted: true,
    userGender: 'female',
    userAge: 32,
  },
  questionnaires: [],
  credits: [],
  onboardingPolicy: {
    showUpsells: true,
  },
};

describe('onboarding step manifest', () => {
  it('skips hormone health during resume for non-female users', () => {
    const steps = getValidOnboardingSteps({
      ...baseContext,
      hasStartedIntake: true,
      completedQuestionnaires: new Set<OnboardingQuestionnaireIdentifier>([
        'onboarding-primer',
        'onboarding-medical-history',
      ]),
      userGender: 'male',
    });

    expect(steps[0]).toBe(ONBOARDING_STEP_IDS.LIFESTYLE_INTRO);
    expect(steps).not.toContain(ONBOARDING_STEP_IDS.FEMALE_HEALTH_INTRO);
  });

  it('prioritizes care assessment when an rx questionnaire is required', () => {
    const steps = getValidOnboardingSteps({
      ...baseContext,
      hasStartedIntake: true,
      rxQuestionnaireContext: {
        status: 'required',
        questionnaireIdentifier: 'rx-assessment-metformin',
      },
    });

    expect(steps[0]).toBe(ONBOARDING_STEP_IDS.RX_ASSESSMENT);
    expect(steps).toContain(ONBOARDING_STEP_IDS.PRIMER_INTRO);
  });

  it('places care assessment after what-happens-next before intake starts', () => {
    const steps = getValidOnboardingSteps({
      ...baseContext,
      hasStartedIntake: false,
      rxQuestionnaireContext: {
        status: 'required',
        questionnaireIdentifier: 'rx-assessment-metformin',
      },
    });

    const whatHappensNextIndex = steps.indexOf(
      ONBOARDING_STEP_IDS.WHAT_HAPPENS_NEXT,
    );
    const rxAssessmentIndex = steps.indexOf(ONBOARDING_STEP_IDS.RX_ASSESSMENT);
    const primerIntroIndex = steps.indexOf(ONBOARDING_STEP_IDS.PRIMER_INTRO);

    expect(whatHappensNextIndex).toBeLessThan(rxAssessmentIndex);
    expect(rxAssessmentIndex).toBeLessThan(primerIntroIndex);
  });

  it('uses cleaned up step ids and analytics ids for the pre-intake profile steps', () => {
    expect(ONBOARDING_STEP_IDS.HEALTH_PROFILE).toBe('health-profile');
    expect(ONBOARDING_STEP_IDS.WHAT_HAPPENS_NEXT).toBe('what-happens-next');
    expect(
      getOnboardingAnalyticsStepId(ONBOARDING_STEP_IDS.HEALTH_PROFILE),
    ).toBe('health-profile');
    expect(
      getOnboardingAnalyticsStepId(ONBOARDING_STEP_IDS.WHAT_HAPPENS_NEXT),
    ).toBe('what-happens-next');
  });

  it('falls back to only schedule-blood-draw when all other gates are closed', () => {
    const steps = getValidOnboardingSteps({
      userInfoCompleted: true,
      userGender: 'female',
      completedQuestionnaires: new Set<OnboardingQuestionnaireIdentifier>([
        'onboarding-primer',
        'onboarding-medical-history',
        'onboarding-female-health',
        'onboarding-lifestyle',
      ]),
      creditedServiceIds: new Set(['v2-advanced-blood-panel-female-quest']),
      hasStartedIntake: true,
      hasSeenWelcome: true,
      hasSeenGiftUpsell: true,
      rxQuestionnaireContext: { status: 'none' },
      showUpsells: false,
    });

    expect(steps).toEqual([ONBOARDING_STEP_IDS.PHLEBOTOMY_BOOKING]);
  });

  it('builds onboarding facts from questionnaires and credited services', () => {
    const facts = buildOnboardingFacts({
      ...baseOnboardingData,
      questionnaires: [
        {
          identifier: 'onboarding-primer',
          status: 'completed',
        },
        {
          identifier: 'onboarding-medical-history',
          status: 'in_progress',
        },
        {
          identifier: 'rx-assessment-metformin',
          status: 'completed',
        },
      ],
      credits: [{ serviceId: 'v2-advanced-blood-panel-male-quest' }],
    });

    expect(facts.hasStartedIntake).toBe(true);
    expect(facts.completedQuestionnaires.has('onboarding-primer')).toBe(true);
    expect(
      facts.completedQuestionnaires.has('onboarding-medical-history'),
    ).toBe(false);
    expect(
      facts.creditedServiceIds.has('v2-advanced-blood-panel-male-quest'),
    ).toBe(true);
    expect(facts.rxQuestionnaireContext).toEqual({ status: 'completed' });
  });
});
