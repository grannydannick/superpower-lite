import {
  ADVANCED_BLOOD_PANEL_SERVICE_PREFIX,
  PERFORMANCE_BLOOD_PANEL_SERVICE_PREFIX,
} from '@/const/services';
import {
  type GetOnboardingResponse,
  type OnboardingQuestionnaireIdentifier,
  type OnboardingUserGender,
} from '@/features/onboarding/api/onboarding';

import {
  getRxQuestionnaireContext,
  type RxQuestionnaireContext,
} from '../../utils/get-rx-questionnaire-context';

// ---------------------------------------------------------------------------
// Facts — derived from the onboarding API response, consumed by step guards.
// ---------------------------------------------------------------------------

export interface OnboardingFacts {
  userInfoCompleted: boolean;
  userGender: OnboardingUserGender;
  completedQuestionnaires: ReadonlySet<OnboardingQuestionnaireIdentifier>;
  creditedServiceIds: ReadonlySet<string>;
  hasStartedIntake: boolean;
  hasSeenWelcome: boolean;
  hasSeenGiftUpsell: boolean;
  rxQuestionnaireContext: RxQuestionnaireContext;
  showUpsells: boolean;
}

// ---------------------------------------------------------------------------
// Questionnaire identifiers (internal shorthand).
// ---------------------------------------------------------------------------

const QUESTIONNAIRE = {
  PRIMER: 'onboarding-primer',
  MEDICAL_HISTORY: 'onboarding-medical-history',
  FEMALE_HEALTH: 'onboarding-female-health',
  LIFESTYLE: 'onboarding-lifestyle',
} as const satisfies Record<string, OnboardingQuestionnaireIdentifier>;

// ---------------------------------------------------------------------------
// Step definitions — keyed by friendly name, declared in display order.
//
// This object is the **single source of truth** for every onboarding step.
// Property iteration order (guaranteed for non-integer keys in ES2015+)
// defines the step sequence — no separate order array needed.
// ---------------------------------------------------------------------------

interface OnboardingStepConfig {
  id: string;
  analyticsId: string;
  title: string;
  shouldShow: (facts: OnboardingFacts) => boolean;
  isResumeIntro?: true;
}

function hasCreditForService(
  serviceIds: ReadonlySet<string>,
  idFragment: string,
): boolean {
  for (const id of serviceIds) {
    if (id.includes(idFragment)) return true;
  }
  return false;
}

const ONBOARDING_STEPS = {
  WELCOME: {
    id: 'get-started',
    analyticsId: 'welcome',
    title: 'Welcome to Superpower',
    shouldShow: (facts) => !facts.hasSeenWelcome && !facts.hasStartedIntake,
  },
  GIFT_UPSELL: {
    id: 'gift-upsell',
    analyticsId: 'gift-upsell',
    title: 'Gift Superpower',
    shouldShow: (facts) => !facts.hasSeenGiftUpsell && !facts.hasStartedIntake,
  },
  UPDATE_INFO: {
    id: 'account-setup',
    analyticsId: 'update-info',
    title: 'Set up your account',
    shouldShow: (facts) => !facts.userInfoCompleted,
  },
  HEARD_ABOUT_US: {
    id: 'how-you-heard-about-us',
    analyticsId: 'heard-about-us',
    title: 'How did you hear about us?',
    shouldShow: (facts) => facts.showUpsells,
  },
  ADVANCED_UPGRADE: {
    id: 'advanced-testing',
    analyticsId: 'advanced-upgrade',
    title: 'Advanced testing',
    shouldShow: (facts) =>
      !facts.hasStartedIntake &&
      !hasCreditForService(
        facts.creditedServiceIds,
        ADVANCED_BLOOD_PANEL_SERVICE_PREFIX,
      ) &&
      !hasCreditForService(
        facts.creditedServiceIds,
        PERFORMANCE_BLOOD_PANEL_SERVICE_PREFIX,
      ) &&
      facts.rxQuestionnaireContext.status !== 'required' &&
      facts.showUpsells,
  },
  INTRODUCTION: {
    id: 'welcome',
    analyticsId: 'introduction',
    title: 'Welcome to Superpower',
    shouldShow: (facts) => !facts.hasStartedIntake,
  },
  HEALTH_PROFILE: {
    id: 'health-profile',
    analyticsId: 'health-profile',
    title: 'Build your health profile',
    shouldShow: (facts) => !facts.hasStartedIntake,
  },
  WHAT_HAPPENS_NEXT: {
    id: 'what-happens-next',
    analyticsId: 'what-happens-next',
    title: 'What happens next',
    shouldShow: (facts) => facts.showUpsells,
  },
  RX_ASSESSMENT: {
    id: 'care-assessment',
    analyticsId: 'rx-assessment',
    title: 'Care assessment',
    shouldShow: (facts) => facts.rxQuestionnaireContext.status === 'required',
  },
  PRIMER_INTRO: {
    id: 'about-you-intro',
    analyticsId: 'primer-intro',
    title: 'Tell us about yourself',
    shouldShow: (facts) =>
      !facts.completedQuestionnaires.has(QUESTIONNAIRE.PRIMER),
    isResumeIntro: true,
  },
  PRIMER: {
    id: 'about-you',
    analyticsId: 'primer',
    title: 'About you',
    shouldShow: (facts) =>
      !facts.completedQuestionnaires.has(QUESTIONNAIRE.PRIMER),
  },
  MEDICAL_HISTORY_INTRO: {
    id: 'medical-history-intro',
    analyticsId: 'medical-history-intro',
    title: 'Medical history',
    shouldShow: (facts) =>
      !facts.completedQuestionnaires.has(QUESTIONNAIRE.MEDICAL_HISTORY),
    isResumeIntro: true,
  },
  MEDICAL_HISTORY: {
    id: 'medical-history',
    analyticsId: 'medical-history',
    title: 'Medical history',
    shouldShow: (facts) =>
      !facts.completedQuestionnaires.has(QUESTIONNAIRE.MEDICAL_HISTORY),
  },
  FEMALE_HEALTH_INTRO: {
    id: 'hormone-health-intro',
    analyticsId: 'female-health-intro',
    title: 'Hormone health',
    shouldShow: (facts) =>
      !facts.completedQuestionnaires.has(QUESTIONNAIRE.FEMALE_HEALTH) &&
      facts.userGender === 'female',
    isResumeIntro: true,
  },
  FEMALE_HEALTH: {
    id: 'hormone-health',
    analyticsId: 'female-health',
    title: 'Hormone health',
    shouldShow: (facts) =>
      !facts.completedQuestionnaires.has(QUESTIONNAIRE.FEMALE_HEALTH) &&
      facts.userGender === 'female',
  },
  LIFESTYLE_INTRO: {
    id: 'lifestyle-intro',
    analyticsId: 'lifestyle-intro',
    title: 'Lifestyle',
    shouldShow: (facts) =>
      !facts.completedQuestionnaires.has(QUESTIONNAIRE.LIFESTYLE),
    isResumeIntro: true,
  },
  LIFESTYLE: {
    id: 'lifestyle',
    analyticsId: 'lifestyle',
    title: 'Lifestyle',
    shouldShow: (facts) =>
      !facts.completedQuestionnaires.has(QUESTIONNAIRE.LIFESTYLE),
  },
  BUILDING_RECOMMENDATIONS: {
    id: 'building-recommendations',
    analyticsId: 'building-recommendations',
    title: 'Building your recommendations',
    shouldShow: (facts) => facts.showUpsells,
  },
  ADD_ON_PANELS: {
    id: 'add-on-panels',
    analyticsId: 'add-on-panels',
    title: 'Your recommendations',
    shouldShow: (facts) => facts.showUpsells,
  },
  PHLEBOTOMY_BOOKING: {
    id: 'schedule-blood-draw',
    analyticsId: 'phlebotomy-booking',
    title: 'Schedule your blood draw',
    shouldShow: () => true,
  },
} as const satisfies Record<string, OnboardingStepConfig>;

// ---------------------------------------------------------------------------
// Derived types.
// ---------------------------------------------------------------------------

type OnboardingStepKey = keyof typeof ONBOARDING_STEPS;
type OnboardingStep = (typeof ONBOARDING_STEPS)[OnboardingStepKey];

/** Union of all URL-slug step IDs. */
export type OnboardingStepId = OnboardingStep['id'];

// ---------------------------------------------------------------------------
// ONBOARDING_STEP_IDS — backwards-compatible lookup from key → URL slug.
//
// Consumers use `ONBOARDING_STEP_IDS.ADD_ON_PANELS` etc. This is derived
// from ONBOARDING_STEPS so there is a single source of truth.
// ---------------------------------------------------------------------------

type OnboardingStepIds = {
  readonly [K in OnboardingStepKey]: (typeof ONBOARDING_STEPS)[K]['id'];
};

export const ONBOARDING_STEP_IDS: OnboardingStepIds = Object.fromEntries(
  Object.entries(ONBOARDING_STEPS).map(([key, def]) => [key, def.id]),
) as OnboardingStepIds;

// ---------------------------------------------------------------------------
// Internal helpers.
// ---------------------------------------------------------------------------

function findStepById(stepId: string): OnboardingStep | undefined {
  for (const def of Object.values(ONBOARDING_STEPS)) {
    if (def.id === stepId) return def;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Public API.
// ---------------------------------------------------------------------------

export function buildOnboardingFacts(
  onboardingData: Pick<
    GetOnboardingResponse,
    'credits' | 'onboardingPolicy' | 'questionnaires' | 'userInfo'
  >,
): OnboardingFacts {
  const completedQuestionnaires = new Set<OnboardingQuestionnaireIdentifier>();
  let hasStartedIntake = false;

  for (const questionnaire of onboardingData.questionnaires) {
    if (questionnaire.identifier.startsWith('onboarding-')) {
      hasStartedIntake = true;
    }

    if (questionnaire.status !== 'completed') {
      continue;
    }

    completedQuestionnaires.add(questionnaire.identifier);
  }

  const creditedServiceIds = new Set(
    onboardingData.credits.map((c) => c.serviceId),
  );

  return {
    userInfoCompleted: onboardingData.userInfo.userInfoCompleted,
    userGender: onboardingData.userInfo.userGender,
    completedQuestionnaires,
    creditedServiceIds,
    hasStartedIntake,
    hasSeenWelcome: false,
    hasSeenGiftUpsell: false,
    rxQuestionnaireContext: getRxQuestionnaireContext(
      onboardingData.questionnaires,
    ),
    showUpsells: onboardingData.onboardingPolicy.showUpsells,
  };
}

export function getValidOnboardingSteps(ctx: OnboardingFacts) {
  const steps: OnboardingStepId[] = [];
  let resumeStartStepId: OnboardingStepId | undefined;

  for (const def of Object.values(ONBOARDING_STEPS)) {
    if (!def.shouldShow(ctx)) continue;

    const id = def.id as OnboardingStepId;
    steps.push(id);

    if (!ctx.hasStartedIntake) continue;
    if (resumeStartStepId != null || !('isResumeIntro' in def)) continue;

    resumeStartStepId = id;
  }

  if (!ctx.hasStartedIntake) {
    return steps;
  }

  if (resumeStartStepId == null) {
    return steps;
  }

  let startIndex = steps.indexOf(resumeStartStepId);
  if (startIndex === -1) {
    return steps;
  }

  if (ctx.rxQuestionnaireContext.status === 'required') {
    const rxAssessmentIndex = steps.indexOf(ONBOARDING_STEP_IDS.RX_ASSESSMENT);
    if (rxAssessmentIndex !== -1 && rxAssessmentIndex < startIndex) {
      startIndex = rxAssessmentIndex;
    }
  }

  return steps.slice(startIndex);
}

export function getOnboardingStepTitle(stepId: OnboardingStepId | null) {
  if (stepId == null) return undefined;
  return findStepById(stepId)?.title;
}

export function getOnboardingAnalyticsStepId(stepId: OnboardingStepId | null) {
  if (stepId == null) return undefined;
  return findStepById(stepId)?.analyticsId;
}

export function isOnboardingStepId(
  stepId: string | undefined,
): stepId is OnboardingStepId {
  if (stepId == null) return false;
  return findStepById(stepId) != null;
}
