import { useEffect } from 'react';

import {
  INTAKE_STEP_IDS,
  type IntakeStepId,
} from '@/features/intake/intake-step-ids';
import {
  buildQuestionnaireStatusMap,
  getQuestionnaireStatus,
} from '@/features/onboarding/utils/get-questionnaire-status';
import { useQuestionnaireResponseList } from '@/features/questionnaires/api/questionnaire-response';
import { useUser } from '@/lib/auth';

import { useIntakeFlowStore } from '../stores/intake-flow-store';

const QUESTIONNAIRE_NAMES = [
  'onboarding-primer',
  'onboarding-medical-history',
  'onboarding-female-health',
  'onboarding-lifestyle',
] as const;

interface IntakeContext {
  primerDone: boolean;
  medHistoryDone: boolean;
  femaleHealthDone: boolean;
  lifestyleDone: boolean;
  gender: 'male' | 'female' | null;
}

/** Splash -> incomplete questionnaires -> completion */
const getIntakeSteps = (ctx: IntakeContext) => {
  const steps: IntakeStepId[] = [INTAKE_STEP_IDS.INTAKE_SPLASH];

  if (!ctx.primerDone) steps.push(INTAKE_STEP_IDS.PRIMER);
  if (!ctx.medHistoryDone) steps.push(INTAKE_STEP_IDS.MEDICAL_HISTORY);
  if (!ctx.femaleHealthDone && ctx.gender === 'female')
    steps.push(INTAKE_STEP_IDS.FEMALE_HEALTH);
  if (!ctx.lifestyleDone) steps.push(INTAKE_STEP_IDS.LIFESTYLE);

  steps.push(INTAKE_STEP_IDS.INTAKE_COMPLETION);
  return steps;
};

/** Fetches user + questionnaire data and initializes the flow store. */
export const useIntakeFlow = () => {
  const isInitialized = useIntakeFlowStore((state) => state.isInitialized);
  const syncFlow = useIntakeFlowStore((state) => state.syncFlow);
  const { data: user, isLoading: userLoading } = useUser();
  const { data: responses, isLoading: questionnairesLoading } =
    useQuestionnaireResponseList({
      questionnaireName: QUESTIONNAIRE_NAMES.join(','),
      status: 'in-progress,completed,stopped',
    });

  const isLoading = userLoading || questionnairesLoading;
  const userId = user?.id ?? '';
  const rawGender = user?.gender?.toLowerCase();
  const gender: 'male' | 'female' | null =
    rawGender === 'male' ? 'male' : rawGender === 'female' ? 'female' : null;

  // Derive steps inside the effect so dependencies are stable primitives /
  // references — avoids relying on the React Compiler to memoize an
  // array/object created during render.
  useEffect(() => {
    if (isLoading) return;

    const statusMap = buildQuestionnaireStatusMap(responses);
    const done = (name: string) =>
      getQuestionnaireStatus(statusMap, name) === 'completed';

    const steps = getIntakeSteps({
      primerDone: done('onboarding-primer'),
      medHistoryDone: done('onboarding-medical-history'),
      femaleHealthDone: done('onboarding-female-health'),
      lifestyleDone: done('onboarding-lifestyle'),
      gender,
    });

    syncFlow(steps, userId);
  }, [isLoading, responses, gender, userId, syncFlow]);

  return { isLoading, isInitialized };
};
