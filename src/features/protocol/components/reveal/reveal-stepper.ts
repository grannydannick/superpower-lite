import { defineStepper } from '@stepperize/react';
import { useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';

import { useAnalytics } from '@/hooks/use-analytics';

import type { Protocol } from '../../api/get-protocol';
import { useLatestProtocol } from '../../api/get-protocol';
import { useRevealStatus, useCompleteReveal } from '../../api/reveal';

type RevealStatusResponse = Awaited<ReturnType<typeof useRevealStatus>>['data'];

export const REVEAL_STEPS = {
  // not real step but useful as a constant
  AUTOPILOT: 'autopilot',
  GET_STARTED: 'get-started',
  BIOLOGICAL_AGE: 'biological-age',
  SCORE: 'score',
  BIOMARKERS: 'biomarkers',
  ORDER_SUMMARY: 'order-summary',
  PRODUCT_CHECKOUT: 'product-checkout',
  SERVICE_CHECKOUT: 'service-checkout',
  RX_QUESTIONNAIRE: 'rx-questionnaire',
} as const satisfies Record<string, string>;

// Helper to generate goal step ID
export const getGoalStepId = (goalId: string) => `goal-${goalId}`;

// Create stepper factory function that builds stepper based on protocol goals
// Since stepperize requires static definition, we'll create it dynamically but memoize it
export const createRevealStepper = (goalStepIds: string[]) => {
  const baseSteps = [
    { id: REVEAL_STEPS.GET_STARTED },
    { id: REVEAL_STEPS.BIOLOGICAL_AGE },
    { id: REVEAL_STEPS.SCORE },
    { id: REVEAL_STEPS.BIOMARKERS },
    ...goalStepIds.map((goalId) => ({ id: goalId })),
    { id: REVEAL_STEPS.ORDER_SUMMARY },
    { id: REVEAL_STEPS.PRODUCT_CHECKOUT },
    { id: REVEAL_STEPS.SERVICE_CHECKOUT },
    { id: REVEAL_STEPS.RX_QUESTIONNAIRE },
  ] as const;

  return defineStepper(...baseSteps);
};

/**
 * Derives the initial step based on reveal status and protocol
 * Returns the first incomplete step that should be shown
 */
function deriveInitialStep(
  revealStatus: RevealStatusResponse | undefined,
  protocol: Protocol | null | undefined,
  baseSteps: string[],
): string {
  if (!revealStatus) {
    return baseSteps[0] ?? REVEAL_STEPS.GET_STARTED;
  }

  const { progress, fulfillmentStates } = revealStatus;

  // Check each step in order to find the first incomplete one
  for (const step of baseSteps) {
    // Skip intro steps if results overview is completed
    if (progress.resultsOverviewCompleted) {
      if (
        step === REVEAL_STEPS.GET_STARTED ||
        step === REVEAL_STEPS.BIOLOGICAL_AGE ||
        step === REVEAL_STEPS.SCORE ||
        step === REVEAL_STEPS.BIOMARKERS
      ) {
        continue;
      }
    }

    // Skip goal steps if order exists
    if (step.startsWith('goal-') || step === REVEAL_STEPS.ORDER_SUMMARY) {
      const hasOrder =
        revealStatus.reveal.protocolOrder !== null ||
        (revealStatus.reveal.protocolOrder &&
          ((fulfillmentStates.services &&
            Object.keys(fulfillmentStates.services).length > 0) ||
            (fulfillmentStates.rx &&
              Object.keys(fulfillmentStates.rx).length > 0)));
      if (hasOrder) {
        continue;
      }
    }

    // Skip product checkout if completed
    if (
      step === REVEAL_STEPS.PRODUCT_CHECKOUT &&
      progress.productCheckoutCompleted
    ) {
      continue;
    }

    // Skip service checkout if completed
    if (
      step === REVEAL_STEPS.SERVICE_CHECKOUT &&
      progress.serviceCheckoutCompleted
    ) {
      continue;
    }

    // Skip RX questionnaire if all RX items are completed
    if (step === REVEAL_STEPS.RX_QUESTIONNAIRE) {
      const rxItems = revealStatus.reveal.protocolOrder?.rxItems ?? [];
      const hasRxItems = rxItems.length > 0;
      const allRxCompleted =
        hasRxItems &&
        rxItems.every(
          (item) => fulfillmentStates.rx?.[item.id] === 'COMPLETED',
        );
      if (hasRxItems && allRxCompleted) {
        continue;
      }
    }

    // This step should be shown
    return step;
  }

  // Fallback to first step if all are completed
  return baseSteps[0] ?? REVEAL_STEPS.GET_STARTED;
}

type RevealStepperReturn = {
  next: () => void;
  previous: () => void;
  initialStep: string;
  isLoading: boolean;
  baseSteps: string[];
  protocol: Protocol | null | undefined;
  carePlanId: string | null;
};

/**
 * Hook for managing reveal flow stepper state
 * Uses stepperize for stable step management
 */
export const useRevealStepper = (
  carePlanId?: string,
  currentStepId?: string,
): RevealStepperReturn => {
  const { track } = useAnalytics();
  const navigate = useNavigate();
  const { data: protocol, isLoading: protocolLoading } = useLatestProtocol();
  const { data: revealStatus, isLoading: revealStatusLoading } =
    useRevealStatus(carePlanId || '');
  const completeRevealMutation = useCompleteReveal();
  const isLoading = protocolLoading || revealStatusLoading;

  // Build base step list (memoized to prevent re-creating on every render)
  const baseSteps = useMemo(
    () => [
      REVEAL_STEPS.GET_STARTED,
      REVEAL_STEPS.BIOLOGICAL_AGE,
      REVEAL_STEPS.SCORE,
      REVEAL_STEPS.BIOMARKERS,
      ...(protocol?.goals.map((goal: { id: string }) =>
        getGoalStepId(goal.id),
      ) || []),
      REVEAL_STEPS.ORDER_SUMMARY,
      REVEAL_STEPS.PRODUCT_CHECKOUT,
      REVEAL_STEPS.SERVICE_CHECKOUT,
      REVEAL_STEPS.RX_QUESTIONNAIRE,
    ],
    [protocol?.goals],
  );

  // Create stepper instance based on goal steps (memoized)
  const goalStepIds = useMemo(
    () =>
      protocol?.goals.map((goal: { id: string }) => getGoalStepId(goal.id)) ||
      [],
    [protocol?.goals],
  );
  const stepperKey = goalStepIds.join(',');
  const stepperRef = useRef<{
    key: string;
    stepper: ReturnType<typeof createRevealStepper>;
  } | null>(null);

  if (!stepperRef.current || stepperRef.current.key !== stepperKey) {
    stepperRef.current = {
      key: stepperKey,
      stepper: createRevealStepper(goalStepIds),
    };
  }

  const RevealStepper = stepperRef.current.stepper;

  // Derive initial step from reveal status (memoized once on first load)
  const initialStepRef = useRef<string | null>(null);
  const initialStep = useMemo(() => {
    if (initialStepRef.current === null && !isLoading) {
      const derived = deriveInitialStep(revealStatus, protocol, baseSteps);
      initialStepRef.current = derived;
      return derived;
    }
    return initialStepRef.current ?? baseSteps[0] ?? REVEAL_STEPS.GET_STARTED;
  }, [revealStatus, protocol, baseSteps, isLoading]);

  const resolveActiveStepId = useCallback(
    (allStepIds: string[]) => {
      if (currentStepId && allStepIds.includes(currentStepId)) {
        return currentStepId;
      }
      if (initialStep && allStepIds.includes(initialStep)) {
        return initialStep;
      }
      return allStepIds[0];
    },
    [currentStepId, initialStep],
  );

  // Navigate to next step with analytics tracking
  const next = useCallback(async () => {
    const allStepIds = RevealStepper.utils.getAll().map((s) => s.id as string);
    if (allStepIds.length === 0) return;

    const activeStepId = resolveActiveStepId(allStepIds);
    if (!activeStepId) return;

    const currentIndex = allStepIds.indexOf(activeStepId);

    if (currentIndex === -1 || currentIndex >= allStepIds.length - 1) {
      // At last step - redirect to protocol and complete the reveal
      if (carePlanId) {
        await completeRevealMutation.mutateAsync(carePlanId);
      }
      navigate('/protocol', { replace: true });
      return;
    }

    const nextStepId = allStepIds[currentIndex + 1];

    track('protocol_reveal_step_next', {
      current_step: activeStepId,
      next_step: nextStepId,
    });

    navigate(`/protocol/reveal/${nextStepId}`);
  }, [
    RevealStepper,
    carePlanId,
    completeRevealMutation,
    navigate,
    resolveActiveStepId,
    track,
  ]);

  // Navigate to previous step
  const previous = useCallback(() => {
    const allStepIds = RevealStepper.utils.getAll().map((s) => s.id as string);
    if (allStepIds.length === 0) return;

    const activeStepId = resolveActiveStepId(allStepIds);
    if (!activeStepId) return;

    const currentIndex = allStepIds.indexOf(activeStepId);

    if (currentIndex <= 0) {
      return; // Already at first step
    }

    const prevStepId = allStepIds[currentIndex - 1];

    track('protocol_reveal_step_previous', {
      current_step: activeStepId,
      previous_step: prevStepId,
    });

    navigate(`/protocol/reveal/${prevStepId}`);
  }, [RevealStepper, navigate, resolveActiveStepId, track]);

  return {
    next,
    previous,
    initialStep,
    isLoading,
    baseSteps,
    protocol,
    carePlanId: carePlanId || null,
  };
};
