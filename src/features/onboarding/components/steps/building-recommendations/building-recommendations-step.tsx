import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, m } from 'framer-motion';
import { useEffect, useEffectEvent, useReducer } from 'react';

import { getOnboardingAddOnsQueryOptions } from '@/features/add-on-panels/api/add-on-panels';
import { ONBOARDING_STEP_IDS } from '@/features/onboarding/components/flow/onboarding-step-manifest';
import { useOnboardingNavigation } from '@/features/onboarding/hooks/use-onboarding-navigation';

import { Sequence } from '../../sequence';
import { AnimatedHeadline } from '../../shared/animated-headline';

const MAX_WAIT_MS = 15000;
const RECOMMENDATION_POLL_START_MS = 8000;
const RECOMMENDATION_POLL_INTERVAL_MS = 2000;
const MESSAGE_STEP_DURATION_MS = 3000;
const FADE_DURATION_MS = 400;
const RECOMMENDATION_MESSAGES = [
  'Reviewing your goals',
  'Analyzing your health data',
  'Checking your family history',
  'Building your test plan',
];
const FADE_TRANSITION = { duration: 0.2 };
const preloadAddOnPanelsStep = () =>
  import('@/features/add-on-panels/add-on-panels-step');

interface RecommendationMessageState {
  messageIndex: number;
  isVisible: boolean;
}

interface FadeOutRecommendationMessageAction {
  type: 'fade-out';
}

interface AdvanceRecommendationMessageAction {
  type: 'advance-message';
}

type RecommendationMessageAction =
  | FadeOutRecommendationMessageAction
  | AdvanceRecommendationMessageAction;

const INITIAL_RECOMMENDATION_MESSAGE_STATE: RecommendationMessageState = {
  messageIndex: 0,
  isVisible: true,
};

function recommendationMessageReducer(
  state: RecommendationMessageState,
  action: RecommendationMessageAction,
) {
  switch (action.type) {
    case 'fade-out':
      return { ...state, isVisible: false };
    case 'advance-message':
      return {
        messageIndex: state.messageIndex + 1,
        isVisible: true,
      };
  }
}

export const BuildingRecommendationsStep = () => {
  const queryClient = useQueryClient();
  const { currentStep, next, validSteps } = useOnboardingNavigation();
  const [messageState, dispatch] = useReducer(
    recommendationMessageReducer,
    INITIAL_RECOMMENDATION_MESSAGE_STATE,
  );
  const { isVisible, messageIndex } = messageState;

  const currentIndex = validSteps.indexOf(currentStep);
  const nextStep =
    currentIndex === -1 ? null : (validSteps[currentIndex + 1] ?? null);
  const shouldWarmAddOns = nextStep === ONBOARDING_STEP_IDS.ADD_ON_PANELS;

  const advance = useEffectEvent(() => {
    next();
  });

  useEffect(() => {
    if (!shouldWarmAddOns) {
      const fallbackTimer = setTimeout(() => {
        advance();
      }, MAX_WAIT_MS);

      return () => {
        clearTimeout(fallbackTimer);
      };
    }

    void preloadAddOnPanelsStep();

    const deadlineAtMs = Date.now() + MAX_WAIT_MS;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let isCancelled = false;

    const pollForRecommendations = async () => {
      let shouldAdvance = false;

      if (RECOMMENDATION_POLL_START_MS > 0) {
        const initialWaitMs = Math.min(
          RECOMMENDATION_POLL_START_MS,
          MAX_WAIT_MS,
        );

        await new Promise<void>((resolve) => {
          pollTimer = setTimeout(() => {
            resolve();
          }, initialWaitMs);
        });
      }

      while (!isCancelled) {
        const addOnsData = await queryClient
          .fetchQuery({
            ...getOnboardingAddOnsQueryOptions(),
            staleTime: 0,
          })
          .catch(() => null);

        if (isCancelled) {
          return;
        }
        shouldAdvance =
          addOnsData != null && addOnsData.recommendedGroupIds.length > 0;
        if (shouldAdvance) {
          break;
        }

        const remainingMs = deadlineAtMs - Date.now();
        if (remainingMs <= 0) {
          shouldAdvance = true;
          break;
        }

        await new Promise<void>((resolve) => {
          pollTimer = setTimeout(
            () => {
              resolve();
            },
            Math.min(RECOMMENDATION_POLL_INTERVAL_MS, remainingMs),
          );
        });
      }

      if (!isCancelled && shouldAdvance) {
        advance();
      }
    };

    void pollForRecommendations();

    return () => {
      isCancelled = true;
      if (pollTimer != null) {
        clearTimeout(pollTimer);
      }
    };
  }, [shouldWarmAddOns, queryClient]);

  useEffect(() => {
    if (messageIndex >= RECOMMENDATION_MESSAGES.length - 1) {
      return;
    }

    const fadeOutTimer = setTimeout(() => {
      dispatch({ type: 'fade-out' });
    }, MESSAGE_STEP_DURATION_MS - FADE_DURATION_MS);

    const nextMessageTimer = setTimeout(() => {
      dispatch({ type: 'advance-message' });
    }, MESSAGE_STEP_DURATION_MS);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(nextMessageTimer);
    };
  }, [messageIndex]);

  return (
    <m.div
      className="flex flex-1 flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={FADE_TRANSITION}
    >
      <Sequence.StepLayout centered className="max-h-screen justify-center">
        <div className="flex flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            <m.div
              key={messageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full"
            >
              <AnimatedHeadline>
                {RECOMMENDATION_MESSAGES[messageIndex]}
              </AnimatedHeadline>
            </m.div>
          </AnimatePresence>
        </div>
      </Sequence.StepLayout>
    </m.div>
  );
};
