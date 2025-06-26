import { Fragment } from 'react';

import {
  Carousel,
  CarouselIndicator,
  CarouselMainContainer,
  CarouselThumbsContainer,
  SliderMainItem,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { useBiomarkers } from '@/features/biomarkers/api';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

import {
  BiologicalAgeCard,
  BiomarkersSummaryCard,
  ScoreCard,
} from './biomarker-cards';

const DATA_CARDS = [
  {
    content: <ScoreCard />,
  },
  {
    content: <BiologicalAgeCard />,
  },
  {
    content: <BiomarkersSummaryCard variant="biomarkers" />,
  },
];

export const DataCards = () => {
  const biomarkersQuery = useBiomarkers();
  const { width } = useWindowDimensions();

  if (biomarkersQuery.isLoading) {
    return (
      <section
        id="summary"
        className="flex flex-col gap-5 pt-6 xl:flex-row xl:pb-16"
      >
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton className="h-[276px] w-full rounded-3xl" key={i} />
          ))}
      </section>
    );
  }

  if (width <= 1280) {
    return (
      <Carousel>
        <CarouselMainContainer>
          {DATA_CARDS.map((card, index) => (
            <SliderMainItem key={index}>{card.content}</SliderMainItem>
          ))}
        </CarouselMainContainer>
        <CarouselThumbsContainer className="justify-center gap-x-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <CarouselIndicator key={index} index={index} />
          ))}
        </CarouselThumbsContainer>
      </Carousel>
    );
  }

  return (
    <section
      id="summary"
      className="flex flex-col gap-5 pt-6 xl:flex-row xl:pb-16"
    >
      {DATA_CARDS.map((card, index) => (
        <Fragment key={index}>{card.content}</Fragment>
      ))}
    </section>
  );
};
