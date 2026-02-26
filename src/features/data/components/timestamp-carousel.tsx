import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselMainContainer,
  SliderMainItem,
  useCarousel,
} from '@/components/ui/carousel';
import { Body1 } from '@/components/ui/typography';

interface TimestampCarouselProps {
  timestamps: string[];
  onTimestampChange: (index: number) => void;
}

const CarouselContent = ({
  timestamps,
  onTimestampChange,
  formatTimestamp,
}: TimestampCarouselProps & {
  formatTimestamp: (timestamp: string) => string;
}) => {
  const { scrollNext, scrollPrev, emblaMainApi } = useCarousel();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaMainApi) return;
    const selected = emblaMainApi.selectedScrollSnap();
    onTimestampChange(timestamps.length - 1 - selected);

    setCanScrollPrev(emblaMainApi.canScrollPrev());
    setCanScrollNext(emblaMainApi.canScrollNext());
  }, [emblaMainApi, onTimestampChange, timestamps.length]);

  useEffect(() => {
    if (!emblaMainApi) return;

    const timeoutId = setTimeout(() => {
      onSelect();
    }, 0);
    emblaMainApi.on('select', onSelect);
    emblaMainApi.on('reInit', onSelect);

    emblaMainApi.scrollTo(timestamps.length - 1);

    return () => {
      clearTimeout(timeoutId);
      emblaMainApi.off('select', onSelect);
      emblaMainApi.off('reInit', onSelect);
    };
  }, [emblaMainApi, onSelect, timestamps.length]);

  const timestampNodes: React.ReactElement[] = [];
  const seen = new Map<string, number>();

  for (let i = timestamps.length - 1; i >= 0; i--) {
    const timestamp = timestamps[i];
    const count = seen.get(timestamp) ?? 0;
    seen.set(timestamp, count + 1);

    const key = count === 0 ? timestamp : `${timestamp}__${count}`;

    timestampNodes.push(
      <SliderMainItem key={key} className="basis-1/3">
        <Body1 className="text-center text-sm text-zinc-500 transition-colors">
          {formatTimestamp(timestamp)}
        </Body1>
      </SliderMainItem>,
    );
  }

  return (
    <div className="relative px-8">
      <Button
        variant="ghost"
        size="small"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className="absolute left-0 top-1/2 z-10 aspect-square w-8 -translate-y-1/2 bg-zinc-100 p-2 text-zinc-900 hover:bg-zinc-200 disabled:pointer-events-none disabled:opacity-50"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <CarouselMainContainer
        className="cursor-grab select-none active:cursor-grabbing"
        style={{
          maskImage:
            'linear-gradient(to right, transparent, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 10%, black 90%, transparent 100%)',
        }}
      >
        {timestampNodes}
      </CarouselMainContainer>
      <Button
        variant="ghost"
        size="small"
        onClick={scrollNext}
        disabled={!canScrollNext}
        className="absolute right-0 top-1/2 z-10 aspect-square w-8 -translate-y-1/2 bg-zinc-100 p-2 text-zinc-900 hover:bg-zinc-200 disabled:pointer-events-none disabled:opacity-50"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
};

export const TimestampCarousel = ({
  timestamps,
  onTimestampChange,
}: TimestampCarouselProps) => {
  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, yyyy');
  };

  return (
    <Carousel
      carouselOptions={{
        align: 'center',
        containScroll: false,
        dragFree: false,
        loop: false,
        slidesToScroll: 1,
      }}
    >
      <CarouselContent
        timestamps={timestamps}
        onTimestampChange={onTimestampChange}
        formatTimestamp={formatTimestamp}
      />
    </Carousel>
  );
};
