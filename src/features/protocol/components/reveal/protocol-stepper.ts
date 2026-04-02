import { defineStepper } from '@stepperize/react';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';

import { useAnalytics } from '@/hooks/use-analytics';

import type { RevealPhase } from '../../api/reveal';

export const PROTOCOL_STEPS = {
  WELCOME: 'welcome',
  VIDEO_SEQUENCE: 'text-sequence',
  BIOLOGICAL_AGE: 'biological-age',
  SUPERPOWER_SCORE: 'superpower-score',
  OVERVIEW_WHAT_WE_DO: 'overview-what-we-do',
  OVERVIEW_AI_MODEL: 'overview-ai-model',
  OVERVIEW_HEALTH_WINNERS: 'overview-health-winners',
  OVERVIEW_HEALTH_WINNERS_BIOMARKERS: 'overview-health-winners-biomarkers',
  OVERVIEW_AREAS_TO_IMPROVE: 'overview-areas-to-improve',
  OVERVIEW_AREAS_TO_IMPROVE_BIOMARKERS: 'overview-areas-to-improve-biomarkers',
  GENERAL_BUILD_PROTOCOL: 'general-build-protocol',
  GENERAL_UNDERSTANDING: 'general-understanding',
  GENERAL_SCIENCE: 'general-science',
  GENERAL_YOU_DECIDE: 'general-you-decide',
  GENERAL_REAL_RESULTS: 'general-real-results',
  GOAL_OVERVIEW: 'key-actions-overview',
  GOAL_DETAIL_1: 'goal-detail-1',
  GOAL_FIX_1: 'goal-fix-1',
  GOAL_RECOMMENDATIONS_1: 'goal-recommendations-1',
  GOAL_DETAIL_2: 'goal-detail-2',
  GOAL_FIX_2: 'goal-fix-2',
  GOAL_RECOMMENDATIONS_2: 'goal-recommendations-2',
  GOAL_DETAIL_3: 'goal-detail-3',
  GOAL_FIX_3: 'goal-fix-3',
  GOAL_RECOMMENDATIONS_3: 'goal-recommendations-3',
  PROTOCOL_REVIEW: 'protocol-review',
  PROTOCOL_PROCESSING: 'protocol-processing',
  FINAL_PROTOCOL_READY: 'final-protocol-ready',
  FINAL_ACHIEVE_GOALS: 'final-achieve-goals',
  FINAL_BENEFITS: 'final-benefits',
  FINAL_SUPPLEMENTS: 'final-supplements',
  FINAL_AUTOPILOT: 'final-autopilot',
  FINAL_REST_EASY: 'final-rest-easy',
  FINAL_HEALTH_JOURNEY: 'final-health-journey',
} as const satisfies Record<string, string>;

/**
 * Maps step IDs to their corresponding phase.
 * The LAST step in each phase triggers the checkpoint when navigating forward.
 */
export const PHASE_BOUNDARY_STEPS: Partial<Record<string, RevealPhase>> = {
  [PROTOCOL_STEPS.SUPERPOWER_SCORE]: 'intro',
  [PROTOCOL_STEPS.OVERVIEW_HEALTH_WINNERS_BIOMARKERS]: 'overview',
  [PROTOCOL_STEPS.GENERAL_REAL_RESULTS]: 'education',
  [PROTOCOL_STEPS.PROTOCOL_REVIEW]: 'goals',
  [PROTOCOL_STEPS.FINAL_HEALTH_JOURNEY]: 'completed',
};

/**
 * Get the phase that should be marked complete when navigating past this step.
 * Returns null if the step is not a phase boundary.
 */
export function getPhaseForStep(stepId: string): RevealPhase | null {
  return PHASE_BOUNDARY_STEPS[stepId] ?? null;
}

/**
 * Maps last-completed phase to the starting step for resume.
 * Each completed phase maps to the FIRST step of the NEXT phase.
 * 'completed' means the entire reveal is done — the route should redirect away.
 */
export const PHASE_START_STEPS: Record<RevealPhase | 'not_started', string> = {
  not_started: PROTOCOL_STEPS.WELCOME,
  intro: PROTOCOL_STEPS.OVERVIEW_WHAT_WE_DO,
  overview: PROTOCOL_STEPS.GENERAL_BUILD_PROTOCOL,
  education: PROTOCOL_STEPS.GOAL_OVERVIEW,
  goals: PROTOCOL_STEPS.FINAL_PROTOCOL_READY,
  completed: PROTOCOL_STEPS.FINAL_HEALTH_JOURNEY,
};

/**
 * Get the initial step to navigate to based on current phase.
 */
export function getInitialStepForPhase(
  phase: RevealPhase | 'not_started',
): string {
  return PHASE_START_STEPS[phase];
}

const PROTOCOL_STEPPER_STEPS = [
  { id: PROTOCOL_STEPS.WELCOME },
  { id: PROTOCOL_STEPS.VIDEO_SEQUENCE },
  { id: PROTOCOL_STEPS.BIOLOGICAL_AGE },
  { id: PROTOCOL_STEPS.SUPERPOWER_SCORE },
  { id: PROTOCOL_STEPS.OVERVIEW_WHAT_WE_DO },
  { id: PROTOCOL_STEPS.OVERVIEW_AI_MODEL },
  { id: PROTOCOL_STEPS.OVERVIEW_HEALTH_WINNERS },
  { id: PROTOCOL_STEPS.OVERVIEW_HEALTH_WINNERS_BIOMARKERS },
  // { id: PROTOCOL_STEPS.OVERVIEW_AREAS_TO_IMPROVE }, // temporarily disabled
  // { id: PROTOCOL_STEPS.OVERVIEW_AREAS_TO_IMPROVE_BIOMARKERS }, // temporarily disabled
  { id: PROTOCOL_STEPS.GENERAL_BUILD_PROTOCOL },
  { id: PROTOCOL_STEPS.GENERAL_UNDERSTANDING },
  { id: PROTOCOL_STEPS.GENERAL_SCIENCE },
  { id: PROTOCOL_STEPS.GENERAL_YOU_DECIDE },
  { id: PROTOCOL_STEPS.GENERAL_REAL_RESULTS },
  { id: PROTOCOL_STEPS.GOAL_OVERVIEW },
  { id: PROTOCOL_STEPS.GOAL_DETAIL_1 },
  { id: PROTOCOL_STEPS.GOAL_FIX_1 },
  { id: PROTOCOL_STEPS.GOAL_RECOMMENDATIONS_1 },
  { id: PROTOCOL_STEPS.GOAL_DETAIL_2 },
  { id: PROTOCOL_STEPS.GOAL_FIX_2 },
  { id: PROTOCOL_STEPS.GOAL_RECOMMENDATIONS_2 },
  { id: PROTOCOL_STEPS.GOAL_DETAIL_3 },
  { id: PROTOCOL_STEPS.GOAL_FIX_3 },
  { id: PROTOCOL_STEPS.GOAL_RECOMMENDATIONS_3 },
  { id: PROTOCOL_STEPS.PROTOCOL_REVIEW },
  { id: PROTOCOL_STEPS.PROTOCOL_PROCESSING },
  { id: PROTOCOL_STEPS.FINAL_PROTOCOL_READY },
  { id: PROTOCOL_STEPS.FINAL_ACHIEVE_GOALS },
  { id: PROTOCOL_STEPS.FINAL_BENEFITS },
  { id: PROTOCOL_STEPS.FINAL_SUPPLEMENTS },
  // { id: PROTOCOL_STEPS.FINAL_AUTOPILOT }, // temporarily disabled
  { id: PROTOCOL_STEPS.FINAL_REST_EASY },
  { id: PROTOCOL_STEPS.FINAL_HEALTH_JOURNEY },
] as const;

export const ProtocolStepper = defineStepper(...PROTOCOL_STEPPER_STEPS);

type ProtocolStepperReturn = {
  next: () => void;
  previous: () => void;
  allSteps: string[];
  getCurrentStepIndex: (stepId?: string) => number;
  isFirstStep: (stepId?: string) => boolean;
  isLastStep: (stepId?: string) => boolean;
};

/**
 * Checks if a step ID is a goal step (detail, fix, or recommendations)
 * and returns the goal number (1-3) if so, otherwise null.
 */
function getGoalNumberFromStep(stepId: string): number | null {
  // Goal steps end with -1, -2, or -3 (e.g., "goal-detail-1", "goal-fix-2")
  const match = stepId.match(/^goal-(detail|fix|recommendations)-(\d+)$/);
  if (!match) return null;
  return parseInt(match[2], 10);
}

type UseProtocolStepperOptions = {
  currentStepId?: string;
  /** Number of goals available. Steps for goals beyond this count will be skipped. Defaults to 3. */
  goalCount?: number;
  /** Callback fired when navigating past a phase boundary step. */
  onPhaseComplete?: (phase: RevealPhase) => void | Promise<void>;
  /** Whether there are health winners to display. If false, the biomarkers step will be skipped. Defaults to true. */
  hasHealthWinners?: boolean;
  /** Whether there are areas to improve to display. If false, the biomarkers step will be skipped. Defaults to true. */
  hasAreasToImprove?: boolean;
  /** Whether there are accepted supplement actions. If false, FINAL_BENEFITS and FINAL_SUPPLEMENTS steps will be skipped. Defaults to true. */
  hasAcceptedSupplements?: boolean;
};

export const useProtocolStepper = ({
  currentStepId,
  goalCount = 3,
  onPhaseComplete,
  hasHealthWinners = true,
  hasAreasToImprove = true,
  hasAcceptedSupplements = true,
}: UseProtocolStepperOptions = {}): ProtocolStepperReturn => {
  const { track } = useAnalytics();
  const navigate = useNavigate();

  const allSteps = useMemo(() => {
    const steps = ProtocolStepper.steps.map((s) => s.id as string);

    // Filter out goal steps that exceed the available goal count
    // and biomarker steps when there are no items to display
    return steps.filter((stepId) => {
      // Skip health winners biomarkers step if no health winners
      if (
        stepId === PROTOCOL_STEPS.OVERVIEW_HEALTH_WINNERS_BIOMARKERS &&
        !hasHealthWinners
      ) {
        return false;
      }

      // Skip areas to improve biomarkers step if no areas to improve
      if (
        stepId === PROTOCOL_STEPS.OVERVIEW_AREAS_TO_IMPROVE_BIOMARKERS &&
        !hasAreasToImprove
      ) {
        return false;
      }

      // Skip supplement-related steps if no accepted supplements
      if (
        (stepId === PROTOCOL_STEPS.FINAL_BENEFITS ||
          stepId === PROTOCOL_STEPS.FINAL_SUPPLEMENTS) &&
        !hasAcceptedSupplements
      ) {
        return false;
      }

      const goalNumber = getGoalNumberFromStep(stepId);
      // Keep non-goal steps, and goal steps within the available count
      return goalNumber === null || goalNumber <= goalCount;
    });
  }, [goalCount, hasHealthWinners, hasAreasToImprove, hasAcceptedSupplements]);

  const getCurrentStepIndex = useCallback(
    (stepId?: string) => {
      const id = stepId || currentStepId;
      if (!id) return 0;
      const index = allSteps.indexOf(id);
      return index === -1 ? 0 : index;
    },
    [allSteps, currentStepId],
  );

  const isFirstStep = useCallback(
    (stepId?: string) => getCurrentStepIndex(stepId) === 0,
    [getCurrentStepIndex],
  );

  const isLastStep = useCallback(
    (stepId?: string) => getCurrentStepIndex(stepId) === allSteps.length - 1,
    [getCurrentStepIndex, allSteps.length],
  );

  const next = useCallback(async () => {
    const currentIndex = getCurrentStepIndex();

    // Check if current step is a phase boundary - fire callback before navigating
    // Wrapped in try/catch so navigation always proceeds even if the API call fails
    if (currentStepId) {
      const phase = getPhaseForStep(currentStepId);
      if (phase && onPhaseComplete) {
        try {
          await onPhaseComplete(phase);
        } catch {
          // Phase completion is best-effort; don't block navigation
        }
      }
    }

    if (isLastStep()) {
      navigate({ to: '/protocol', replace: true });
      return;
    }

    const nextStepId = allSteps[currentIndex + 1];

    track('protocol_reveal_step_next', {
      current_step: currentStepId,
      next_step: nextStepId,
    });

    navigate({ to: '/protocol/reveal/$step', params: { step: nextStepId } });
  }, [
    getCurrentStepIndex,
    isLastStep,
    allSteps,
    currentStepId,
    track,
    navigate,
    onPhaseComplete,
  ]);

  const previous = useCallback(() => {
    if (isFirstStep()) return;

    const currentIndex = getCurrentStepIndex();
    const prevStepId = allSteps[currentIndex - 1];

    track('protocol_reveal_step_previous', {
      current_step: currentStepId,
      previous_step: prevStepId,
    });

    navigate({ to: '/protocol/reveal/$step', params: { step: prevStepId } });
  }, [
    isFirstStep,
    getCurrentStepIndex,
    allSteps,
    currentStepId,
    track,
    navigate,
  ]);

  return {
    next,
    previous,
    allSteps,
    getCurrentStepIndex,
    isFirstStep,
    isLastStep,
  };
};
