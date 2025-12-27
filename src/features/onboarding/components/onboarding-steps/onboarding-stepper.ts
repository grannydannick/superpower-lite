import { defineStepper, Get } from '@stepperize/react';
import { useCallback, useRef, useState, useEffect, useMemo } from 'react';

import { isGLP1FrontDoorExperiment } from '@/components/ui/questionnaire/utils/questionnaire-utils';
import {
  GLP_FRONTDOOR_EXPERIMENT,
  INTAKE_QUESTIONNAIRE,
} from '@/const/questionnaire';
import {
  ADVANCED_BLOOD_PANEL,
  FATIGUE_PANEL,
  FEMALE_FERTILITY_PANEL,
  MALE_HEALTH_PANEL,
  ORGAN_AGE_PANEL,
} from '@/const/services';
import { useHasClaimedBenefits } from '@/features/b2b/api';
import { useCredits } from '@/features/orders/api/credits';
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
);

type OnboardingStepperReturn = {
  validSteps: Get.Id<typeof OnboardingStepper.steps>[];
  next: () => void;
  methods: ReturnType<typeof OnboardingStepper.useStepper>;
  isLastStep: boolean;
  isLoading: boolean;
};

// Helper to check if a service exists in the services list
const hasService = (services: { name: string }[] | undefined, name: string) =>
  services?.some((s) => s.name === name) ?? false;

export const useOnboardingStepper = (): OnboardingStepperReturn => {
  const { track } = useAnalytics();
  const methods = OnboardingStepper.useStepper();
  const validStepsRef = useRef<Get.Id<typeof OnboardingStepper.steps>[]>([]);
  // Version counter to trigger memo recalculation when ref is updated
  const [stepsVersion, setStepsVersion] = useState(0);

  // Fetch user profile data and check completion status (proxy for info-update step)
  const { data: user, isLoading: isUserLoading } = useUser();
  const userInfoCompleted = Boolean(
    user?.firstName && user?.lastName && user?.primaryAddress?.state,
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

  const { data: addOnServices, isLoading: isServicesLoading } = useServices({
    group: 'phlebotomy',
  });

  const { data: creditsData } = useCredits();
  const credits = creditsData?.credits ?? [];
  const userHasAdvancedUpgrade = credits.find(
    (c) => c.serviceName === ADVANCED_BLOOD_PANEL,
  );
  const userHasOrganAge = credits.find(
    (c) => c.serviceName === ORGAN_AGE_PANEL,
  );

  // Check if user has claimed B2B benefits
  const { data: claimedBenefitsData, isLoading: isClaimedBenefitsLoading } =
    useHasClaimedBenefits();
  const hasClaimedBenefits = claimedBenefitsData?.hasClaimedBenefits ?? false;

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
    isIntakeLoading ||
    isRxFrontDoorIntakeLoading ||
    isServicesLoading ||
    isClaimedBenefitsLoading;

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
    if (userHasAdvancedUpgrade) {
      excluded.push(ONBOARDING_STEPS.ADVANCED_UPGRADE);
    }
    if (userHasOrganAge) {
      excluded.push(ONBOARDING_STEPS.ORGAN_AGE);
    }

    // User has custom panels, or purchased a GLP-1 front-door experiment - skip most upsells
    if (isFrontDoorExperiment) {
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

    // B2B users with claimed benefits only see update-info, intake, and phlebotomy-booking
    if (hasClaimedBenefits) {
      excluded.push(
        ONBOARDING_STEPS.ADVANCED_UPGRADE,
        ONBOARDING_STEPS.BUNDLED_DISCOUNT,
        ONBOARDING_STEPS.HEARD_ABOUT_US,
        ONBOARDING_STEPS.GLP1_QUESTIONNAIRE,
        ONBOARDING_STEPS.ORGAN_AGE,
        ONBOARDING_STEPS.FATIGUE_PANEL,
        ONBOARDING_STEPS.HORMONE_PANEL,
        ONBOARDING_STEPS.ADD_ON_PANELS,
        ONBOARDING_STEPS.TEST_KIT_STEPS,
      );
    }

    return excluded;
  }, [
    userInfoCompleted,
    intakeCompleted,
    hasIncompleteRxFrontDoorIntake,
    isFrontDoorExperiment,
    userHasAdvancedUpgrade,
    userHasOrganAge,
    hasOrganAge,
    hasFatigue,
    hasHormone,
    isFemaleOver45,
    hasClaimedBenefits,
  ]);

  useEffect(() => {
    if (isLoading) return;

    const steps = Object.values(ONBOARDING_STEPS).filter(
      (step) => !excludedSteps.includes(step),
    );

    // For B2B users with claimed benefits, swap intake and phlebotomy booking
    // so they book their blood draw before completing the intake questionnaire
    if (hasClaimedBenefits) {
      const intakeIndex = steps.indexOf(ONBOARDING_STEPS.INTAKE);
      const phlebotomyIndex = steps.indexOf(
        ONBOARDING_STEPS.PHLEBOTOMY_BOOKING,
      );

      if (intakeIndex !== -1 && phlebotomyIndex !== -1) {
        [steps[intakeIndex], steps[phlebotomyIndex]] = [
          steps[phlebotomyIndex],
          steps[intakeIndex],
        ];
      }
    }

    validStepsRef.current = steps;
    setStepsVersion((v) => v + 1);
  }, [isLoading, excludedSteps, hasClaimedBenefits]);

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

  const isLastStep = useMemo(() => {
    const validSteps = validStepsRef.current;
    if (validSteps.length === 0) return false;
    return validSteps.indexOf(methods.current.id) === validSteps.length - 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.current.id, stepsVersion]);

  return {
    validSteps: validStepsRef.current,
    next,
    methods,
    isLastStep,
    isLoading,
  };
};
