import { useEffect, useMemo } from 'react';

import {
  ADVANCED_BLOOD_PANEL,
  FATIGUE_PANEL,
  FEMALE_FERTILITY_PANEL,
  MALE_HEALTH_PANEL,
  ORGAN_AGE_PANEL,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const/services';
import { useHasClaimedBenefits } from '@/features/b2b/api';
import { useCredits } from '@/features/orders/api/credits';
import { useQuestionnaireResponseList } from '@/features/questionnaires/api/questionnaire-response';
import { useServices } from '@/features/services/api';
import { useUser } from '@/lib/auth';

import { getValidSteps, type FlowContext } from '../config/step-config';
import { useOnboardingFlowStore } from '../stores/onboarding-flow-store';
import {
  buildQuestionnaireStatusMap,
  getQuestionnaireStatus,
} from '../utils/get-questionnaire-status';

// TODO: Get valid names from  orpc/types.generated
const ONBOARDING_QUESTIONNAIRES = [
  'onboarding-primer',
  'onboarding-medical-history',
  'onboarding-female-health',
  'onboarding-lifestyle',
] as const;

// Helper to check if a service exists in the services list
const hasService = (services: { name: string }[] | undefined, name: string) =>
  services?.some((s) => s.name === name) ?? false;

/**
 * Orchestrator hook for the onboarding flow.
 * Single mount point that fetches all required data and initializes the flow store.
 */
export const useOnboardingFlow = () => {
  const store = useOnboardingFlowStore();

  // Fetch user profile data
  const { data: user, isLoading: isUserLoading } = useUser();

  // Fetch all onboarding questionnaire responses in one call
  const { data: questionnaireResponses, isLoading: isQuestionnairesLoading } =
    useQuestionnaireResponseList({
      questionnaireName: ONBOARDING_QUESTIONNAIRES.join(','),
      status: 'in-progress,completed,stopped',
    });

  // Fetch add-on services (phlebotomy group)
  const { data: addOnServices, isLoading: isServicesLoading } = useServices({
    group: 'phlebotomy',
  });

  // Fetch user credits
  const { data: creditsData } = useCredits();

  // Check if user has claimed B2B benefits
  const { data: claimedBenefitsData, isLoading: isClaimedBenefitsLoading } =
    useHasClaimedBenefits();

  const isLoading =
    isUserLoading ||
    isQuestionnairesLoading ||
    isServicesLoading ||
    isClaimedBenefitsLoading;

  // Build flow context from query data
  const flowContext = useMemo((): FlowContext | null => {
    if (isLoading) return null;

    const questionnaireStatusMap = buildQuestionnaireStatusMap(
      questionnaireResponses,
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
    const userHasAdvancedUpgrade = credits.some(
      (c) => c.serviceName === ADVANCED_BLOOD_PANEL,
    );
    const userHasOrganAge = credits.some(
      (c) => c.serviceName === ORGAN_AGE_PANEL,
    );

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
    const hasClaimedBenefits = claimedBenefitsData?.hasClaimedBenefits ?? false;

    // Resume flow context
    const hasAdditionalCredits = userHasAdvancedUpgrade || credits.length > 1;

    const hasStartedIntake = ONBOARDING_QUESTIONNAIRES.some((name) =>
      questionnaireStatusMap.has(name),
    );

    const baselineCreditsCount = credits.filter(
      (c) => c.serviceName === SUPERPOWER_BLOOD_PANEL,
    ).length;

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
      hasAdditionalCredits,
      baselineCreditsCount,
      hasStartedIntake,
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

  // Initialize or update store when flow context changes
  useEffect(() => {
    if (!flowContext) return;

    const validSteps = getValidSteps(flowContext);

    if (!store.isInitialized) {
      store.initialize(validSteps);
    } else {
      // Only update if steps have changed
      const stepsChanged =
        validSteps.length !== store.validSteps.length ||
        validSteps.some((step, i) => step !== store.validSteps[i]);

      if (stepsChanged) {
        store.updateSteps(validSteps);
      }
    }
  }, [flowContext, store]);

  // Reset store on unmount to clean up state for next mount
  useEffect(() => {
    return () => {
      useOnboardingFlowStore.getState().reset();
    };
  }, []);

  return {
    isLoading,
    isInitialized: store.isInitialized,
  };
};
