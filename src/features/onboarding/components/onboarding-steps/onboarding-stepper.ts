import { defineStepper, Get } from '@stepperize/react';
import { useCallback, useRef, useEffect, useMemo } from 'react';

import { INTAKE_QUESTIONNAIRE } from '@/const/questionnaire';
import { ADVANCED_BLOOD_PANEL, CUSTOM_BLOOD_PANEL } from '@/const/services';
import { useOrders } from '@/features/orders/api';
import { useQuestionnaireResponse } from '@/features/questionnaires/api/get-questionnaire-response';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';

export const ONBOARDING_STEPS = {
  UPDATE_INFO: 'update-info',
  ADVANCED_UPGRADE: 'advanced-upgrade',
  BUNDLED_DISCOUNT: 'bundled-discount',
  HEARD_ABOUT_US: 'heard-about-us',
  INTAKE: 'intake',
  ADD_ON_PANELS: 'add-on-panels',
  TEST_KIT_STEPS: 'test-kit-steps',
  PHLEBOTOMY_BOOKING: 'phlebotomy-booking',
  MISSION: 'mission',
} as const satisfies Record<string, string>;

export const OnboardingStepper = defineStepper(
  { id: ONBOARDING_STEPS.UPDATE_INFO },
  { id: ONBOARDING_STEPS.ADVANCED_UPGRADE },
  { id: ONBOARDING_STEPS.BUNDLED_DISCOUNT },
  { id: ONBOARDING_STEPS.HEARD_ABOUT_US },
  { id: ONBOARDING_STEPS.INTAKE },
  { id: ONBOARDING_STEPS.ADD_ON_PANELS },
  { id: ONBOARDING_STEPS.TEST_KIT_STEPS },
  { id: ONBOARDING_STEPS.PHLEBOTOMY_BOOKING },
  { id: ONBOARDING_STEPS.MISSION },
);

type OnboardingStepperReturn = {
  validSteps: Get.Id<typeof OnboardingStepper.steps>[];
  next: () => void;
  methods: ReturnType<typeof OnboardingStepper.useStepper>;
  isLoading: boolean;
};

export const useOnboardingStepper = (): OnboardingStepperReturn => {
  const { track } = useAnalytics();
  const methods = OnboardingStepper.useStepper();
  const validStepsRef = useRef<Get.Id<typeof OnboardingStepper.steps>[]>([]);

  // Fetch user profile data and check completion status (proxy for info-update step)
  const { data: user, isLoading: isUserLoading } = useUser();
  const userInfoCompleted = user?.firstName && user?.lastName;

  // Check user's order history for upgrade eligibility
  const { data: ordersData, isLoading: isOrdersLoading } = useOrders();
  const userHasAdvancedUpgrade = ordersData?.orders?.find(
    (order) => order.serviceName === ADVANCED_BLOOD_PANEL,
  );
  const userHasCustomPanels = ordersData?.orders?.some(
    (order) => order.serviceName === CUSTOM_BLOOD_PANEL,
  );

  // Check intake questionnaire completion status
  const {
    data: intakeQuestionnaireData,
    isLoading: isIntakeQuestionnaireLoading,
  } = useQuestionnaireResponse({
    questionnaireName: INTAKE_QUESTIONNAIRE,
  });
  const intakeQuestionnaireCompleted =
    intakeQuestionnaireData?.questionnaireResponse?.status === 'completed';

  // Aggregate loading states
  const isLoading = useMemo(() => {
    return isUserLoading || isOrdersLoading || isIntakeQuestionnaireLoading;
  }, [isUserLoading, isOrdersLoading, isIntakeQuestionnaireLoading]);

  // Determine which steps to exclude based on user state
  const excludedSteps = useMemo((): string[] => {
    const excludedSteps: string[] = [];

    if (userInfoCompleted) {
      excludedSteps.push(ONBOARDING_STEPS.UPDATE_INFO);
    }

    if (intakeQuestionnaireCompleted) {
      excludedSteps.push(
        ONBOARDING_STEPS.ADVANCED_UPGRADE,
        ONBOARDING_STEPS.BUNDLED_DISCOUNT,
        ONBOARDING_STEPS.HEARD_ABOUT_US,
        ONBOARDING_STEPS.INTAKE,
      );
    }

    if (userHasAdvancedUpgrade) {
      excludedSteps.push(ONBOARDING_STEPS.ADVANCED_UPGRADE);
    }

    if (userHasCustomPanels) {
      excludedSteps.push(
        ONBOARDING_STEPS.ADD_ON_PANELS,
        ONBOARDING_STEPS.ADVANCED_UPGRADE,
        ONBOARDING_STEPS.BUNDLED_DISCOUNT,
      );
    }

    return excludedSteps;
  }, [
    userInfoCompleted,
    intakeQuestionnaireCompleted,
    userHasAdvancedUpgrade,
    userHasCustomPanels,
  ]);

  // Initialize valid steps once when data is loaded
  useEffect(() => {
    if (!isLoading && validStepsRef.current.length === 0) {
      const validSteps = Object.values(ONBOARDING_STEPS).filter(
        (step) => !excludedSteps.includes(step),
      );
      validStepsRef.current = validSteps;
    }
  }, [isLoading, excludedSteps]);

  const validSteps = validStepsRef.current;

  // Prepare steps data for analytics tracking
  const steps = useMemo(
    () => OnboardingStepper.utils.getAll().map((step) => ({ id: step.id })),
    [],
  );

  // Navigate to next step with analytics tracking
  const next = useCallback(() => {
    const currentStepId = validSteps.indexOf(methods.current.id);

    // Fallback to default navigation if current step not found
    if (currentStepId === -1) {
      methods.next();
      return;
    }

    const nextId = validSteps[currentStepId + 1];

    // Fallback to default navigation if at last step
    if (!nextId) {
      methods.next();
      return;
    }

    // Track navigation and move to next step
    track('onboarding_step_next', {
      current_step: methods.current.id,
      next_step: nextId,
      steps: steps,
    });

    methods.goTo(nextId);
  }, [validSteps, methods, track, steps]);

  return { validSteps, next, methods, isLoading };
};
