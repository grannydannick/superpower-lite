import { IconSparkle } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconSparkle';
import { IconChevronLeft } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronLeft';
import { m } from 'framer-motion';
import { Suspense } from 'react';

import { Head } from '@/components/seo';
import { Skeleton } from '@/components/ui/skeleton';
import { H2 } from '@/components/ui/typography';
import {
  getOnboardingStepTitle,
  ONBOARDING_STEP_IDS,
} from '@/features/onboarding/components/flow/onboarding-step-manifest';
import { useOnboardingCartStore } from '@/features/onboarding/stores/onboarding-cart-store';
import { cn } from '@/lib/utils';

import { Sequence } from '../../sequence';

import {
  AddOnPanelsStepProvider,
  useAddOnPanelsStep,
} from './add-on-panels-context';
import {
  MarketplaceScreen,
  RecommendationView,
  TEST_CARD_SKELETON_KEYS,
  TestCardSkeleton,
} from './add-on-panels-marketplace';
import { CartFooter, DetailSheet } from './add-on-panels-overlays';
import {
  getCurrentRecommendation,
  getSelectedItems,
} from './add-on-panels-selectors';

const FADE_TRANSITION = { duration: 0.2 };

const AddOnPanelsStepScreen = () => {
  const { addOnsData, goBack, recommendationIndex } = useAddOnPanelsStep();
  const selectedServiceIds = useOnboardingCartStore(
    (s) => s.selectedServiceIds,
  );
  const currentRecommendation = getCurrentRecommendation(
    addOnsData,
    recommendationIndex,
  );
  const viewMode =
    currentRecommendation == null ? 'marketplace' : 'recommendations';
  const shouldShowHeaderBack =
    viewMode !== 'recommendations' || recommendationIndex > 0;
  const hasSelected =
    getSelectedItems(addOnsData.groups, selectedServiceIds).length > 0;
  const bottomPaddingClass = hasSelected ? 'pb-[24rem]' : 'pb-40';

  return (
    <>
      <Head
        title={
          viewMode === 'recommendations'
            ? getOnboardingStepTitle(ONBOARDING_STEP_IDS.ADD_ON_PANELS)
            : 'Explore Tests'
        }
      />
      <m.div
        className="flex flex-1 flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={FADE_TRANSITION}
      >
        <Sequence.StepLayout className="h-dvh max-h-dvh overflow-hidden bg-white">
          <Sequence.StepHeader className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            {shouldShowHeaderBack ? (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1 text-zinc-500"
                aria-label="Go back"
              >
                <IconChevronLeft className="size-5" />
                <span className="text-sm">Back</span>
              </button>
            ) : (
              <div className="w-14" aria-hidden="true" />
            )}
            <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-900">
              <IconSparkle className="size-3.5 text-vermillion-900" />
              {viewMode === 'recommendations'
                ? 'Your recommendations'
                : 'Clinic'}
            </span>
            <div className="w-14" />
          </Sequence.StepHeader>

          {viewMode === 'recommendations' ? (
            <div
              className={cn('flex-1 overflow-y-auto px-4', bottomPaddingClass)}
            >
              <RecommendationView />
            </div>
          ) : (
            <MarketplaceScreen bottomPaddingClass={bottomPaddingClass} />
          )}
          {viewMode === 'recommendations' && <CartFooter />}
        </Sequence.StepLayout>
      </m.div>

      <DetailSheet />
    </>
  );
};

const AddOnPanelsStepLoadingScreen = () => (
  <Sequence.StepLayout className="h-dvh min-h-dvh overflow-hidden bg-white">
    <Sequence.StepHeader className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
      <div className="flex items-center gap-1 text-zinc-500">
        <IconChevronLeft className="size-5" />
        <span className="text-sm">Back</span>
      </div>
      <span className="text-sm font-medium text-zinc-900">Marketplace</span>
      <div className="w-14" />
    </Sequence.StepHeader>

    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <div className="space-y-6 pt-0.5">
        <H2>Explore Tests</H2>
        <div className="h-11 rounded-full bg-zinc-100" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
      <div className="space-y-3 pt-6">
        {TEST_CARD_SKELETON_KEYS.map((key) => (
          <TestCardSkeleton key={key} />
        ))}
      </div>
    </div>
  </Sequence.StepLayout>
);

export const AddOnPanelsStep = () => (
  <Suspense fallback={<AddOnPanelsStepLoadingScreen />}>
    <AddOnPanelsStepProvider>
      <AddOnPanelsStepScreen />
    </AddOnPanelsStepProvider>
  </Suspense>
);
