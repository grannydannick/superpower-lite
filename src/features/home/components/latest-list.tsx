import React, { Fragment } from 'react';

import {
  Carousel,
  CarouselIndicator,
  CarouselMainContainer,
  CarouselThumbsContainer,
  SliderMainItem,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { AffiliateInviteCard } from '@/features/affiliate/components/affiliate-invite-card';
import { useBiomarkers } from '@/features/biomarkers/api';
import {
  BiologicalAgeCard,
  ScoreCard,
} from '@/features/biomarkers/components/biomarker-cards';
import { useTimeline } from '@/features/home/api/get-timeline';
import { CompleteOnboardingCard } from '@/features/home/components/complete-onboarding-card';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

const LATEST_CARDS = [
  {
    content: <ScoreCard />,
  },
  {
    content: <BiologicalAgeCard />,
  },
  {
    content: <AffiliateInviteCard />,
  },
];

const LATEST_WITH_ONBOARDING_CARDS = [
  {
    content: <CompleteOnboardingCard />,
  },
  ...LATEST_CARDS,
];

export const LatestList = () => {
  const biomarkersQuery = useBiomarkers();
  const timelineQuery = useTimeline();

  const { width } = useWindowDimensions();

  const incompleteOnboardingTasks =
    timelineQuery.data?.filter(
      (t) => t.type === 'ONBOARDING_TASK' && t.status !== 'DONE',
    ) ?? [];

  const cards = incompleteOnboardingTasks.length
    ? LATEST_WITH_ONBOARDING_CARDS
    : LATEST_CARDS;

  if (biomarkersQuery.isLoading || timelineQuery.isLoading) {
    return (
      <div className="space-y-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton className="h-[188px] w-full rounded-3xl" key={i} />
          ))}
      </div>
    );
  }

  if (width <= 1280) {
    return (
      <Carousel>
        <CarouselMainContainer>
          {cards.map((card, index) => (
            <SliderMainItem key={index}>{card.content}</SliderMainItem>
          ))}
        </CarouselMainContainer>
        <CarouselThumbsContainer className="justify-center gap-x-1">
          {Array.from({ length: cards.length }).map((_, index) => (
            <CarouselIndicator key={index} index={index} />
          ))}
        </CarouselThumbsContainer>
      </Carousel>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((c, index) => (
        <Fragment key={index}>{c.content}</Fragment>
      ))}
    </div>
  );
};
