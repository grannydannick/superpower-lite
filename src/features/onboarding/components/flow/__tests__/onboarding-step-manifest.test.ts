import { describe, expect, it } from 'vitest';

import {
  type GetOnboardingResponse,
  type OnboardingQuestionnaireIdentifier,
} from '@/features/onboarding/api/onboarding';

import {
  buildOnboardingFacts,
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
  hasAnsweredHeardAboutUs: false,
  rxQuestionnaireContext: { status: 'none' },
  showUpsells: true,
  intakeEnabled: true,
  skipAddOnsFlow: false,
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
      hasAnsweredHeardAboutUs: true,
      rxQuestionnaireContext: { status: 'none' },
      showUpsells: false,
      intakeEnabled: true,
      skipAddOnsFlow: false,
    });

    expect(steps).toEqual([ONBOARDING_STEP_IDS.PHLEBOTOMY_BOOKING]);
  });

  it('skips intake-related steps when intake is disabled', () => {
    const steps = getValidOnboardingSteps({
      ...baseContext,
      userInfoCompleted: true,
      userGender: 'female',
      hasSeenWelcome: true,
      hasAnsweredHeardAboutUs: true,
      intakeEnabled: false,
    });

    expect(steps).not.toContain(ONBOARDING_STEP_IDS.INTRODUCTION);
    expect(steps).not.toContain(ONBOARDING_STEP_IDS.HEALTH_PROFILE);
    expect(steps).not.toContain(ONBOARDING_STEP_IDS.PRIMER_INTRO);
    expect(steps).not.toContain(ONBOARDING_STEP_IDS.PRIMER);
    expect(steps).not.toContain(ONBOARDING_STEP_IDS.MEDICAL_HISTORY_INTRO);
    expect(steps).not.toContain(ONBOARDING_STEP_IDS.MEDICAL_HISTORY);
    expect(steps).not.toContain(ONBOARDING_STEP_IDS.FEMALE_HEALTH_INTRO);
    expect(steps).not.toContain(ONBOARDING_STEP_IDS.FEMALE_HEALTH);
    expect(steps).not.toContain(ONBOARDING_STEP_IDS.LIFESTYLE_INTRO);
    expect(steps).not.toContain(ONBOARDING_STEP_IDS.LIFESTYLE);
    expect(steps).toContain(ONBOARDING_STEP_IDS.PHLEBOTOMY_BOOKING);
  });

  it('uses the expected pre-intake order when upsells are enabled', () => {
    const steps = getValidOnboardingSteps(baseContext);

    expect(steps.slice(0, 5)).toEqual([
      ONBOARDING_STEP_IDS.WELCOME,
      ONBOARDING_STEP_IDS.ADVANCED_UPGRADE,
      ONBOARDING_STEP_IDS.BUNDLED_DISCOUNT,
      ONBOARDING_STEP_IDS.HEARD_ABOUT_US,
      ONBOARDING_STEP_IDS.UPDATE_INFO,
    ]);
  });

  it('skips add-on recommendations and scheduling when the skip flag is enabled', () => {
    const steps = getValidOnboardingSteps({
      ...baseContext,
      skipAddOnsFlow: true,
    });

    expect(steps).toContain(ONBOARDING_STEP_IDS.ADVANCED_UPGRADE);
    expect(steps).toContain(ONBOARDING_STEP_IDS.BUNDLED_DISCOUNT);
    expect(steps).not.toContain(ONBOARDING_STEP_IDS.BUILDING_RECOMMENDATIONS);
    expect(steps).not.toContain(ONBOARDING_STEP_IDS.ADD_ON_PANELS);
    expect(steps).not.toContain(ONBOARDING_STEP_IDS.PHLEBOTOMY_BOOKING);
  });

  it('hides what-happens-next after intake starts when the skip flag is enabled', () => {
    const steps = getValidOnboardingSteps({
      ...baseContext,
      hasStartedIntake: true,
      skipAddOnsFlow: true,
      completedQuestionnaires: new Set<OnboardingQuestionnaireIdentifier>([
        'onboarding-primer',
        'onboarding-medical-history',
        'onboarding-female-health',
        'onboarding-lifestyle',
      ]),
      hasSeenWelcome: true,
      hasAnsweredHeardAboutUs: true,
      userInfoCompleted: true,
    });

    expect(steps).not.toContain(ONBOARDING_STEP_IDS.WHAT_HAPPENS_NEXT);
  });

  it('hides bundled-discount when user already has an advanced blood panel credit', () => {
    const steps = getValidOnboardingSteps({
      ...baseContext,
      creditedServiceIds: new Set(['v2-advanced-blood-panel-female-quest']),
    });

    expect(steps).not.toContain(ONBOARDING_STEP_IDS.BUNDLED_DISCOUNT);
    expect(steps).not.toContain(ONBOARDING_STEP_IDS.ADVANCED_UPGRADE);
  });

  it('hides bundled-discount when user already has a performance blood panel credit', () => {
    const steps = getValidOnboardingSteps({
      ...baseContext,
      creditedServiceIds: new Set(['v3-performance-initial-blood-panel-quest']),
    });

    expect(steps).not.toContain(ONBOARDING_STEP_IDS.BUNDLED_DISCOUNT);
  });

  it('hides bundled-discount when upsells are disabled', () => {
    const steps = getValidOnboardingSteps({
      ...baseContext,
      showUpsells: false,
    });

    expect(steps).not.toContain(ONBOARDING_STEP_IDS.BUNDLED_DISCOUNT);
  });

  it('hides bundled-discount when rx assessment is required', () => {
    const steps = getValidOnboardingSteps({
      ...baseContext,
      rxQuestionnaireContext: {
        status: 'required',
        questionnaireIdentifier: 'rx-assessment-metformin',
      },
    });

    expect(steps).not.toContain(ONBOARDING_STEP_IDS.BUNDLED_DISCOUNT);
  });

  it('hides bundled-discount once intake has started', () => {
    const steps = getValidOnboardingSteps({
      ...baseContext,
      hasStartedIntake: true,
    });

    expect(steps).not.toContain(ONBOARDING_STEP_IDS.BUNDLED_DISCOUNT);
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
