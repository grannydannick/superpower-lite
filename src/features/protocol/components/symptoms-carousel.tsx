import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselMainContainer,
  useCarousel,
} from '@/components/ui/carousel/carousel';
import { getSymptomIcon } from '@/utils/symptom-to-icon-mapper';

const SymptomsCarouselContent = ({ symptoms }: { symptoms: string[] }) => {
  const { scrollNext, scrollPrev, emblaMainApi } = useCarousel();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaMainApi) return;
    setCanScrollPrev(emblaMainApi.canScrollPrev());
    setCanScrollNext(emblaMainApi.canScrollNext());
  }, [emblaMainApi]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on('select', onSelect);
    emblaMainApi.on('reInit', onSelect);
    return () => {
      emblaMainApi.off('select', onSelect);
      emblaMainApi.off('reInit', onSelect);
    };
  }, [emblaMainApi, onSelect]);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className="absolute left-0 top-1/2 z-20 size-7 -translate-y-1/2 rounded-full border-none bg-white shadow-sm transition-opacity disabled:opacity-0"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <CarouselMainContainer
        className="cursor-grab gap-2 px-2 active:cursor-grabbing"
        style={{
          maskImage:
            'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        {symptoms.map((symptom, index) => {
          const IconComponent = getSymptomIcon(symptom);
          return (
            <span
              key={index}
              className="flex shrink-0 select-none items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 text-sm text-secondary"
            >
              <IconComponent className="size-4" />
              {symptom}
            </span>
          );
        })}
      </CarouselMainContainer>
      <Button
        variant="outline"
        size="icon"
        onClick={scrollNext}
        disabled={!canScrollNext}
        className="absolute right-0 top-1/2 z-20 size-7 -translate-y-1/2 rounded-full border-none bg-white shadow-sm transition-opacity disabled:opacity-0"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
};

export const SymptomsCarousel = ({ symptoms }: { symptoms: string[] }) => (
  <Carousel
    carouselOptions={{
      dragFree: true,
      containScroll: 'trimSnaps',
      align: 'start',
    }}
  >
    <SymptomsCarouselContent symptoms={symptoms} />
  </Carousel>
);
