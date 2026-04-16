import { useQueryClient } from '@tanstack/react-query';
import { m } from 'framer-motion';
import { useEffect, useEffectEvent, useState } from 'react';

import { TextShimmer } from '@/components/ui/text-shimmer';
import { getOnboardingAddOnsQueryOptions } from '@/features/onboarding/api/onboarding-add-ons';
import { ONBOARDING_STEP_IDS } from '@/features/onboarding/components/flow/onboarding-step-manifest';
import { useOnboardingNavigation } from '@/features/onboarding/hooks/use-onboarding-navigation';

import { Sequence } from '../../sequence';

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
  import('@/features/onboarding/components/steps/add-on-panels/add-on-panels-step');

export const BuildingRecommendationsStep = () => {
  const queryClient = useQueryClient();
  const { currentStep, next, validSteps } = useOnboardingNavigation();
  const [messageIndex, setMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

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
        if (addOnsData != null && addOnsData.recommendedGroupIds.length > 0) {
          advance();
          return;
        }

        const remainingMs = deadlineAtMs - Date.now();
        if (remainingMs <= 0) {
          advance();
          return;
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
      setIsVisible(false);
    }, MESSAGE_STEP_DURATION_MS - FADE_DURATION_MS);

    const nextMessageTimer = setTimeout(() => {
      setMessageIndex((currentIndex) => currentIndex + 1);
      setIsVisible(true);
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
          <TextShimmer
            className={[
              'truncate text-sm transition-opacity duration-300 [--base-color:rgba(0,0,0,0.5)] [--base-gradient-color:#ffffff]',
              isVisible ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
            duration={2}
          >
            {RECOMMENDATION_MESSAGES[messageIndex]}
          </TextShimmer>
        </div>
      </Sequence.StepLayout>
    </m.div>
  );
};
