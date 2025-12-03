import { defineStepper, Get } from '@stepperize/react';
import { useCallback, useRef, useEffect, useMemo } from 'react';

import { isGLP1FrontDoorExperiment } from '@/components/ui/questionnaire/utils/questionnaire-utils';
import {
  GLP_FRONTDOOR_EXPERIMENT,
  INTAKE_QUESTIONNAIRE,
} from '@/const/questionnaire';
import {
  ADVANCED_BLOOD_PANEL,
  CUSTOM_BLOOD_PANEL,
  FATIGUE_PANEL,
  FEMALE_FERTILITY_PANEL,
  MALE_HEALTH_PANEL,
  ORGAN_AGE_PANEL,
} from '@/const/services';
import { useOrders } from '@/features/orders/api';
import { useQuestionnaireResponse } from '@/features/questionnaires/api/get-questionnaire-response';
import { useServices } from '@/features/services/api';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';

export const ONBOARDING_STEPS = {
  UPDATE_INFO: 'update-info',
  ADVANCED_UPGRADE: 'advanced-upgrade',
  BUNDLED_DISCOUNT: 'bundled-discount',
  HEARD_ABOUT_US: 'heard-about-us',
  INTAKE: 'intake',
  GLP1_QUESTIONNAIRE: 'glp1-questionnaire',
  ORGAN_AGE: 'organ-age',
  FATIGUE_PANEL: 'fatigue-panel',
  HORMONE_PANEL: 'hormone-panel',
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
  { id: ONBOARDING_STEPS.GLP1_QUESTIONNAIRE },
  { id: ONBOARDING_STEPS.ORGAN_AGE },
  { id: ONBOARDING_STEPS.FATIGUE_PANEL },
  { id: ONBOARDING_STEPS.HORMONE_PANEL },
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

// Helper to check if a service exists in the services list
const hasService = (services: { name: string }[] | undefined, name: string) =>
  services?.some((s) => s.name === name) ?? false;

export const useOnboardingStepper = (): OnboardingStepperReturn => {
  const { track } = useAnalytics();
  const methods = OnboardingStepper.useStepper();
  const validStepsRef = useRef<Get.Id<typeof OnboardingStepper.steps>[]>([]);

  // Fetch user profile data and check completion status (proxy for info-update step)
  const { data: user, isLoading: isUserLoading } = useUser();
  const userInfoCompleted = Boolean(
    user?.firstName && user?.lastName && user?.primaryAddress?.state,
  );

  // Check user's order history for upgrade eligibility
  const { data: ordersData, isLoading: isOrdersLoading } = useOrders();
  const userHasAdvancedUpgrade = Boolean(
    ordersData?.orders?.find((o) => o.serviceName === ADVANCED_BLOOD_PANEL),
  );
  const userHasCustomPanels = Boolean(
    ordersData?.orders?.find((o) => o.serviceName === CUSTOM_BLOOD_PANEL),
  );

  // Check intake questionnaire completion status
  const { data: intakeData, isLoading: isIntakeLoading } =
    useQuestionnaireResponse({
      identifier: INTAKE_QUESTIONNAIRE,
    });
  const intakeCompleted =
    intakeData?.questionnaireResponse?.status === 'completed';

  // Check if user is in the GLP Front Door Experiment with an incomplete RX assessment
  const { data: rxFrontDoorIntakeData, isLoading: isRxFrontDoorIntakeLoading } =
    useQuestionnaireResponse({
      identifier: GLP_FRONTDOOR_EXPERIMENT,
    });
  const hasIncompleteRxFrontDoorIntake =
    rxFrontDoorIntakeData?.questionnaireResponse != null &&
    rxFrontDoorIntakeData.questionnaireResponse.status !== 'completed';
  const isFrontDoorExperiment =
    rxFrontDoorIntakeData?.questionnaireResponse != null &&
    isGLP1FrontDoorExperiment(rxFrontDoorIntakeData.questionnaireResponse);

  // Fetch add-on panel services to check availability
  const { data: addOnServices, isLoading: isServicesLoading } = useServices({
    group: 'blood-panel-addon',
  });

  // Check if specific panels are available
  const services = addOnServices?.services;
  const hasOrganAge = hasService(services, ORGAN_AGE_PANEL);
  const hasFatigue = hasService(services, FATIGUE_PANEL);
  const hormonePanelName =
    user?.gender?.toLowerCase() === 'male'
      ? MALE_HEALTH_PANEL
      : FEMALE_FERTILITY_PANEL;
  const hasHormone = hasService(services, hormonePanelName);

  // Calculate user age if birthdate is available
  const userAge = useMemo(() => {
    if (!user?.dateOfBirth) return null;
    const birthDate = new Date(user.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }, [user?.dateOfBirth]);

  // Check if user is female over 45 (should not see fertility panel)
  const isFemaleOver45 =
    user?.gender?.toLowerCase() === 'female' &&
    userAge !== null &&
    userAge > 45;

  const isLoading =
    isUserLoading ||
    isOrdersLoading ||
    isIntakeLoading ||
    isRxFrontDoorIntakeLoading ||
    isServicesLoading;

  // Determine which steps to exclude based on user state and service availability
  const excludedSteps = useMemo((): string[] => {
    const excluded: string[] = [];

    // User info already completed
    if (userInfoCompleted) excluded.push(ONBOARDING_STEPS.UPDATE_INFO);

    // Intake already completed - skip intro steps
    if (intakeCompleted) {
      excluded.push(
        ONBOARDING_STEPS.ADVANCED_UPGRADE,
        ONBOARDING_STEPS.BUNDLED_DISCOUNT,
        ONBOARDING_STEPS.HEARD_ABOUT_US,
        ONBOARDING_STEPS.INTAKE,
      );
    }

    // GLP-1 front-door experiment intake already completed, or we're not in the experiment - skip intro steps
    if (!hasIncompleteRxFrontDoorIntake) {
      excluded.push(ONBOARDING_STEPS.GLP1_QUESTIONNAIRE);
    }

    // User already has advanced upgrade
    if (userHasAdvancedUpgrade)
      excluded.push(ONBOARDING_STEPS.ADVANCED_UPGRADE);

    // User has custom panels, or purchased a GLP-1 front-door experiment - skip most upsells
    if (userHasCustomPanels || isFrontDoorExperiment) {
      excluded.push(
        ONBOARDING_STEPS.ADVANCED_UPGRADE,
        ONBOARDING_STEPS.BUNDLED_DISCOUNT,
        ONBOARDING_STEPS.ORGAN_AGE,
        ONBOARDING_STEPS.FATIGUE_PANEL,
        ONBOARDING_STEPS.HORMONE_PANEL,
        ONBOARDING_STEPS.ADD_ON_PANELS,
      );
    }

    // Panel services not available
    if (!hasOrganAge) excluded.push(ONBOARDING_STEPS.ORGAN_AGE);
    if (!hasFatigue) excluded.push(ONBOARDING_STEPS.FATIGUE_PANEL);
    if (!hasHormone) excluded.push(ONBOARDING_STEPS.HORMONE_PANEL);

    // Women over 45 should not see fertility panel
    if (isFemaleOver45) excluded.push(ONBOARDING_STEPS.HORMONE_PANEL);

    return excluded;
  }, [
    userInfoCompleted,
    intakeCompleted,
    hasIncompleteRxFrontDoorIntake,
    isFrontDoorExperiment,
    userHasAdvancedUpgrade,
    userHasCustomPanels,
    hasOrganAge,
    hasFatigue,
    hasHormone,
    isFemaleOver45,
  ]);

  // Initialize valid steps once when data is loaded
  useEffect(() => {
    if (!isLoading && validStepsRef.current.length === 0) {
      validStepsRef.current = Object.values(ONBOARDING_STEPS).filter(
        (step) => !excludedSteps.includes(step),
      );
    }
  }, [isLoading, excludedSteps]);

  // Navigate to next step with analytics tracking
  const next = useCallback(() => {
    const validSteps = validStepsRef.current;
    const currentIndex = validSteps.indexOf(methods.current.id);
    const nextId = validSteps[currentIndex + 1];

    // If no next step found, fallback to default navigation
    if (currentIndex === -1 || !nextId) {
      methods.next();
      return;
    }

    // Track navigation and move to next step
    track('onboarding_step_next', {
      current_step: methods.current.id,
      next_step: nextId,
      steps: OnboardingStepper.utils.getAll().map((step) => ({ id: step.id })),
    });

    methods.goTo(nextId);
  }, [methods, track]);

  return {
    validSteps: validStepsRef.current,
    next,
    methods,
    isLoading,
  };
};
