import { useMemo } from 'react';

import {
  ADVANCED_BLOOD_PANEL,
  FATIGUE_PANEL,
  FEMALE_FERTILITY_PANEL,
  MALE_HEALTH_PANEL,
  ORGAN_AGE_PANEL,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const/services';
import { useGetBenefitClaims } from '@/features/b2b/api';
import { useCredits } from '@/features/orders/api/credits';
import {
  type ListQuestionnaireResponsesResponse,
  useQuestionnaireResponseList,
} from '@/features/questionnaires/api/questionnaire-response';
import { useServices } from '@/features/services/api';
import { useUser } from '@/lib/auth';

import { getValidSteps, type FlowContext } from '../config/step-config';
import { useOnboardingFlowStore } from '../stores/onboarding-flow-store';
import {
  buildQuestionnaireStatusMap,
  getQuestionnaireStatus,
} from '../utils/get-questionnaire-status';
import { getRxQuestionnaireContext } from '../utils/get-rx-questionnaire-context';

import { useSyncFlowStore } from './use-sync-flow-store';

// TODO: Get valid names from orpc/types.generated
const ONBOARDING_QUESTIONNAIRES = [
  'onboarding-primer',
  'onboarding-medical-history',
  'onboarding-female-health',
  'onboarding-lifestyle',
] as const;
const ONBOARDING_QUESTIONNAIRE_NAME_SET = new Set<string>(
  ONBOARDING_QUESTIONNAIRES,
);

// Helper to check if a service exists in the services list
const hasService = (services: { name: string }[] | undefined, name: string) => {
  if (services == null) {
    return false;
  }

  for (const service of services) {
    if (service.name === name) {
      return true;
    }
  }

  return false;
};

/**
 * Orchestrator hook for the onboarding flow.
 * Single mount point that fetches all required data and initializes the flow store.
 */
export const useOnboardingFlow = () => {
  const isInitialized = useOnboardingFlowStore((state) => state.isInitialized);

  // Fetch user profile data
  const { data: user, isLoading: isUserLoading } = useUser();

  // Fetch all questionnaire responses once; derive onboarding and RX state locally.
  const {
    data: questionnaireResponses,
    isLoading: isQuestionnaireResponsesLoading,
  } = useQuestionnaireResponseList({
    status: 'in-progress,completed,stopped',
    _sort: '-_lastUpdated',
  });

  // Fetch add-on services (phlebotomy group)
  const { data: addOnServices, isLoading: isServicesLoading } = useServices({
    group: 'phlebotomy',
  });

  // Fetch user credits
  const { data: creditsData } = useCredits();

  // Check if user has claimed B2B benefits
  const { data: claimedBenefitsData, isLoading: isClaimedBenefitsLoading } =
    useGetBenefitClaims();

  const isLoading =
    isUserLoading ||
    isQuestionnaireResponsesLoading ||
    isServicesLoading ||
    isClaimedBenefitsLoading;

  // Build flow context from query data
  const flowContext = useMemo((): FlowContext | null => {
    if (isLoading) return null;

    const onboardingQuestionnaireResponses: ListQuestionnaireResponsesResponse =
      [];
    for (const response of questionnaireResponses ?? []) {
      const questionnaireName = response.identifier?.value;
      if (questionnaireName == null) {
        continue;
      }
      if (!ONBOARDING_QUESTIONNAIRE_NAME_SET.has(questionnaireName)) {
        continue;
      }
      onboardingQuestionnaireResponses.push(response);
    }

    const questionnaireStatusMap = buildQuestionnaireStatusMap(
      onboardingQuestionnaireResponses,
    );

    // Helper to check if a questionnaire is completed
    const isQuestionnaireCompleted = (name: string): boolean =>
      getQuestionnaireStatus(questionnaireStatusMap, name) === 'completed';

    // User info completed check
    const userInfoCompleted = Boolean(
      user?.firstName && user?.lastName && user?.primaryAddress?.state,
    );

    // Individual questionnaire completion states
    const primerCompleted = isQuestionnaireCompleted('onboarding-primer');
    const medicalHistoryCompleted = isQuestionnaireCompleted(
      'onboarding-medical-history',
    );
    const femaleHealthCompleted = isQuestionnaireCompleted(
      'onboarding-female-health',
    );
    const lifestyleCompleted = isQuestionnaireCompleted('onboarding-lifestyle');
    // Credits check
    const credits = creditsData?.credits ?? [];
    let userHasAdvancedUpgrade = false;
    let userHasOrganAge = false;
    let baselineCreditsCount = 0;
    for (const credit of credits) {
      if (credit.serviceName === ADVANCED_BLOOD_PANEL) {
        userHasAdvancedUpgrade = true;
      }
      if (credit.serviceName === ORGAN_AGE_PANEL) {
        userHasOrganAge = true;
      }
      if (credit.serviceName === SUPERPOWER_BLOOD_PANEL) {
        baselineCreditsCount++;
      }
    }

    // Service availability
    const services = addOnServices?.services;
    const hasOrganAgeService = hasService(services, ORGAN_AGE_PANEL);
    const hasFatigueService = hasService(services, FATIGUE_PANEL);
    const hormonePanelName =
      user?.gender?.toLowerCase() === 'male'
        ? MALE_HEALTH_PANEL
        : FEMALE_FERTILITY_PANEL;
    const hasHormoneService = hasService(services, hormonePanelName);

    // B2B benefits
    const hasClaimedBenefits = (claimedBenefitsData?.length ?? 0) > 0;

    let hasStartedIntake = false;
    for (const name of ONBOARDING_QUESTIONNAIRES) {
      if (questionnaireStatusMap.has(name)) {
        hasStartedIntake = true;
        break;
      }
    }

    const rxQuestionnaireContext = getRxQuestionnaireContext(
      questionnaireResponses,
    );

    // Calculate user age if birthdate is available
    let userAge: number | null = null;
    if (user?.dateOfBirth) {
      const birthDate = new Date(user.dateOfBirth);
      const today = new Date();
      userAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        userAge--;
      }
    }

    // User gender normalization
    const userGender =
      user?.gender?.toLowerCase() === 'male'
        ? 'male'
        : user?.gender?.toLowerCase() === 'female'
          ? 'female'
          : null;

    return {
      userInfoCompleted,
      userGender,
      userAge,
      primerCompleted,
      medicalHistoryCompleted,
      femaleHealthCompleted,
      lifestyleCompleted,
      userHasAdvancedUpgrade,
      userHasOrganAge,
      baselineCreditsCount,
      hasStartedIntake,
      rxQuestionnaireContext,
      hasOrganAgeService,
      hasFatigueService,
      hasHormoneService,
      hasClaimedBenefits,
    };
  }, [
    isLoading,
    user,
    questionnaireResponses,
    creditsData,
    addOnServices,
    claimedBenefitsData,
  ]);

  const userId = user?.id ?? '';

  const validSteps = useMemo(
    () => (flowContext ? getValidSteps(flowContext) : null),
    [flowContext],
  );

  // Centralized sync handles initialize/resume/step-updates in one place.
  useSyncFlowStore({ validSteps, userId });

  return {
    isLoading,
    isInitialized,
  };
};
