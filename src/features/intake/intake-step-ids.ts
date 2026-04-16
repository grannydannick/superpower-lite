export const INTAKE_STEP_IDS = {
  INTAKE_SPLASH: 'intake-splash',
  PRIMER: 'primer',
  MEDICAL_HISTORY: 'medical-history',
  FEMALE_HEALTH: 'female-health',
  LIFESTYLE: 'lifestyle',
  INTAKE_COMPLETION: 'intake-completion',
} as const;

export type IntakeStepId =
  (typeof INTAKE_STEP_IDS)[keyof typeof INTAKE_STEP_IDS];
