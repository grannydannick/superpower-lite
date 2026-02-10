import { useEffect, useMemo } from 'react';

import {
  STEP_IDS,
  type StepId,
} from '@/features/onboarding/config/step-config';
import { useOnboardingFlowStore } from '@/features/onboarding/stores/onboarding-flow-store';
import {
  buildQuestionnaireStatusMap,
  getQuestionnaireStatus,
} from '@/features/onboarding/utils/get-questionnaire-status';
import { useQuestionnaireResponseList } from '@/features/questionnaires/api/questionnaire-response';
import { useUser } from '@/lib/auth';

const QUESTIONNAIRE_NAMES = [
  'onboarding-primer',
  'onboarding-medical-history',
  'onboarding-female-health',
  'onboarding-lifestyle',
] as const;

type IntakeContext = {
  primerDone: boolean;
  medHistoryDone: boolean;
  femaleHealthDone: boolean;
  lifestyleDone: boolean;
  gender: 'male' | 'female' | null;
};

/** Splash -> incomplete questionnaires -> completion */
const getIntakeSteps = (ctx: IntakeContext): StepId[] => {
  const steps: StepId[] = [STEP_IDS.INTAKE_SPLASH];

  if (!ctx.primerDone) steps.push(STEP_IDS.PRIMER);
  if (!ctx.medHistoryDone) steps.push(STEP_IDS.MEDICAL_HISTORY);
  if (!ctx.femaleHealthDone && ctx.gender === 'female')
    steps.push(STEP_IDS.FEMALE_HEALTH);
  if (!ctx.lifestyleDone) steps.push(STEP_IDS.LIFESTYLE);

  steps.push(STEP_IDS.INTAKE_COMPLETION);
  return steps;
};

/** Fetches user + questionnaire data and initializes the flow store. */
export const useIntakeFlow = () => {
  const store = useOnboardingFlowStore();
  const { data: user, isLoading: userLoading } = useUser();
  const { data: responses, isLoading: questionnairesLoading } =
    useQuestionnaireResponseList({
      questionnaireName: QUESTIONNAIRE_NAMES.join(','),
      status: 'in-progress,completed,stopped',
    });

  const isLoading = userLoading || questionnairesLoading;

  const ctx = useMemo((): IntakeContext | null => {
    if (isLoading) return null;

    const statusMap = buildQuestionnaireStatusMap(responses);
    const done = (name: string) =>
      getQuestionnaireStatus(statusMap, name) === 'completed';

    const g = user?.gender?.toLowerCase();

    return {
      primerDone: done('onboarding-primer'),
      medHistoryDone: done('onboarding-medical-history'),
      femaleHealthDone: done('onboarding-female-health'),
      lifestyleDone: done('onboarding-lifestyle'),
      gender: g === 'male' ? 'male' : g === 'female' ? 'female' : null,
    };
  }, [isLoading, user, responses]);

  useEffect(() => {
    if (!ctx) return;
    const steps = getIntakeSteps(ctx);

    if (!store.isInitialized) {
      store.initialize(steps);
    } else {
      const changed =
        steps.length !== store.validSteps.length ||
        steps.some((s, i) => s !== store.validSteps[i]);
      if (changed) store.updateSteps(steps);
    }
  }, [ctx, store]);

  useEffect(() => {
    return () => useOnboardingFlowStore.getState().reset();
  }, []);

  return { isLoading, isInitialized: store.isInitialized };
};
