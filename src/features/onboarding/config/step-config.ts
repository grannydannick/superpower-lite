import { type RxQuestionnaireContext } from '../utils/get-rx-questionnaire-context';

// Step IDs - single source of truth for all step identifiers
export const STEP_IDS = {
  UPDATE_INFO: 'update-info',
  INTRODUCTION: 'introduction',
  DIGITAL_TWIN: 'digital-twin',
  ADVANCED_UPGRADE: 'advanced-upgrade',
  BUNDLED_DISCOUNT: 'bundled-discount',
  ORGAN_AGE: 'organ-age',
  HEARD_ABOUT_US: 'heard-about-us',
  INTAKE: 'intake',
  PRIMER_INTRO: 'primer-intro',
  PRIMER: 'primer',
  MEDICAL_HISTORY_INTRO: 'medical-history-intro',
  MEDICAL_HISTORY: 'medical-history',
  FEMALE_HEALTH_INTRO: 'female-health-intro',
  FEMALE_HEALTH: 'female-health',
  LIFESTYLE_INTRO: 'lifestyle-intro',
  LIFESTYLE: 'lifestyle',
  FINISH_TWIN: 'finish-twin',
  RX_ASSESSMENT: 'rx-assessment',
  ADD_ON_PANELS: 'add-on-panels',
  UPSELL_PANELS: 'upsell-panels',
  PHLEBOTOMY_BOOKING: 'phlebotomy-booking',
  COMMITMENT: 'commitment',
  // Intake flow only (legacy members)
  INTAKE_SPLASH: 'intake-splash',
  INTAKE_COMPLETION: 'intake-completion',
} as const;

export type StepId = (typeof STEP_IDS)[keyof typeof STEP_IDS];

// Context for step visibility - derived from orchestrator's data fetching
export interface FlowContext {
  // User state
  userInfoCompleted: boolean;
  userGender: 'male' | 'female' | null;
  userAge: number | null;

  // Questionnaire completion states
  primerCompleted: boolean;
  medicalHistoryCompleted: boolean;
  femaleHealthCompleted: boolean;
  lifestyleCompleted: boolean;

  // Credits/purchases
  userHasAdvancedUpgrade: boolean;
  userHasOrganAge: boolean;
  baselineCreditsCount: number; // count of SUPERPOWER_BLOOD_PANEL credits

  // Resume state
  hasStartedIntake: boolean; // any questionnaire in-progress/stopped/completed

  /**
   * Rx intake status derived from QuestionnaireResponses.
   *
   * - `none`: member has no non-symptom-tracker Rx intake response
   * - `required`: member has an in-progress/stopped Rx intake response to complete
   * - `completed`: member has a completed Rx intake response
   */
  rxQuestionnaireContext: RxQuestionnaireContext;

  // Service availability
  hasOrganAgeService: boolean;
  hasFatigueService: boolean;
  hasHormoneService: boolean;

  // B2B
  hasClaimedBenefits: boolean;
}

interface StepConfig {
  id: StepId;
  shouldShow: (ctx: FlowContext) => boolean;
}

// Step definitions with visibility predicates
// Order matters - this is the default step order
const STEP_CONFIGS: StepConfig[] = [
  {
    id: STEP_IDS.HEARD_ABOUT_US,
    shouldShow: (ctx) => !ctx.userInfoCompleted,
  },
  {
    id: STEP_IDS.UPDATE_INFO,
    shouldShow: (ctx) => !ctx.userInfoCompleted,
  },
  {
    id: STEP_IDS.INTRODUCTION,
    shouldShow: (ctx) => !ctx.hasStartedIntake,
  },
  {
    id: STEP_IDS.DIGITAL_TWIN,
    shouldShow: (ctx) => !ctx.hasStartedIntake,
  },
  {
    id: STEP_IDS.ADVANCED_UPGRADE,
    shouldShow: (ctx) =>
      !ctx.hasStartedIntake &&
      !ctx.userHasAdvancedUpgrade &&
      ctx.rxQuestionnaireContext.status !== 'required' &&
      !ctx.hasClaimedBenefits,
  },
  {
    id: STEP_IDS.BUNDLED_DISCOUNT,
    shouldShow: (ctx) =>
      !ctx.hasClaimedBenefits &&
      !ctx.hasStartedIntake &&
      ctx.rxQuestionnaireContext.status !== 'required' &&
      ctx.baselineCreditsCount <= 1,
  },
  {
    id: STEP_IDS.ORGAN_AGE,
    shouldShow: (ctx) =>
      !ctx.userHasOrganAge &&
      !ctx.hasClaimedBenefits &&
      ctx.rxQuestionnaireContext.status !== 'required',
  },
  {
    id: STEP_IDS.FINISH_TWIN,
    shouldShow: (ctx) => !ctx.hasClaimedBenefits,
  },
  {
    id: STEP_IDS.RX_ASSESSMENT,
    shouldShow: (ctx) => ctx.rxQuestionnaireContext.status === 'required',
  },
  {
    id: STEP_IDS.PRIMER_INTRO,
    shouldShow: (ctx) => !ctx.primerCompleted,
  },
  {
    id: STEP_IDS.PRIMER,
    shouldShow: (ctx) => !ctx.primerCompleted,
  },
  {
    id: STEP_IDS.MEDICAL_HISTORY_INTRO,
    shouldShow: (ctx) => !ctx.medicalHistoryCompleted,
  },
  {
    id: STEP_IDS.MEDICAL_HISTORY,
    shouldShow: (ctx) => !ctx.medicalHistoryCompleted,
  },
  {
    id: STEP_IDS.FEMALE_HEALTH_INTRO,
    shouldShow: (ctx) =>
      !ctx.femaleHealthCompleted && ctx.userGender === 'female',
  },
  {
    id: STEP_IDS.FEMALE_HEALTH,
    shouldShow: (ctx) =>
      !ctx.femaleHealthCompleted && ctx.userGender === 'female',
  },
  {
    id: STEP_IDS.LIFESTYLE_INTRO,
    shouldShow: (ctx) => !ctx.lifestyleCompleted,
  },
  {
    id: STEP_IDS.LIFESTYLE,
    shouldShow: (ctx) => !ctx.lifestyleCompleted,
  },
  {
    id: STEP_IDS.UPSELL_PANELS,
    shouldShow: (ctx) => !ctx.hasClaimedBenefits,
  },
  {
    id: STEP_IDS.ADD_ON_PANELS,
    shouldShow: (ctx) => !ctx.hasClaimedBenefits,
  },
  {
    id: STEP_IDS.PHLEBOTOMY_BOOKING,
    shouldShow: () => true, // Always shown when other conditions pass
  },
  {
    id: STEP_IDS.COMMITMENT,
    shouldShow: () => true,
  },
];

/**
 * Computes the valid step sequence based on user context.
 * Pure function - easily unit tested.
 */
const getFirstIncompleteQuestionnaireIntro = (
  ctx: FlowContext,
): StepId | undefined => {
  const questionnaireResumeOrder: Array<{
    introStep: StepId;
    isCompleted: boolean;
    isEnabled?: boolean;
  }> = [
    {
      introStep: STEP_IDS.PRIMER_INTRO,
      isCompleted: ctx.primerCompleted,
    },
    {
      introStep: STEP_IDS.MEDICAL_HISTORY_INTRO,
      isCompleted: ctx.medicalHistoryCompleted,
    },
    {
      introStep: STEP_IDS.FEMALE_HEALTH_INTRO,
      isCompleted: ctx.femaleHealthCompleted,
      isEnabled: ctx.userGender === 'female',
    },
    {
      introStep: STEP_IDS.LIFESTYLE_INTRO,
      isCompleted: ctx.lifestyleCompleted,
    },
  ];

  for (const item of questionnaireResumeOrder) {
    if (item.isEnabled === false) {
      continue;
    }
    if (item.isCompleted) {
      continue;
    }

    return item.introStep;
  }

  return undefined;
};

export const getValidSteps = (ctx: FlowContext): StepId[] => {
  const steps: StepId[] = [];
  for (const step of STEP_CONFIGS) {
    if (!step.shouldShow(ctx)) {
      continue;
    }
    steps.push(step.id);
  }

  if (!ctx.hasStartedIntake) {
    return steps;
  }

  // If any questionnaire has been started or completed, resume at the first
  // unfinished questionnaire intro, skipping all steps before it.
  const firstIncompleteIntro = getFirstIncompleteQuestionnaireIntro(ctx);
  if (firstIncompleteIntro == null) {
    return steps;
  }

  let startIndex = steps.indexOf(firstIncompleteIntro);
  if (startIndex === -1) {
    return steps;
  }

  if (ctx.rxQuestionnaireContext.status === 'required') {
    const rxAssessmentIndex = steps.indexOf(STEP_IDS.RX_ASSESSMENT);
    if (rxAssessmentIndex !== -1 && rxAssessmentIndex < startIndex) {
      startIndex = rxAssessmentIndex;
    }
  }

  return steps.slice(startIndex);
};
