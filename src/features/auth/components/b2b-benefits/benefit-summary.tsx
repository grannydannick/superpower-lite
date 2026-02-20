import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

import {
  Carousel,
  CarouselMainContainer,
  SliderMainItem,
  useCarousel,
} from '@/components/ui/carousel';
import { Body1, Body2, H4 } from '@/components/ui/typography';
import { useBenefits } from '@/features/b2b/api';
import { cn } from '@/lib/utils';

type PanelItem = {
  id: string;
  image: string;
  title: string;
  description: string;
  quantity: number;
};

const ADVANCED_PANEL: Omit<PanelItem, 'quantity'> = {
  id: 'advanced',
  image: '/services/upgrade/advanced-panel.png',
  title: 'Superpower Advanced Panel',
  description:
    '120+ lab tests, results tracked over time and a private medical team.',
};

const BASELINE_PANEL: Omit<PanelItem, 'quantity'> = {
  id: 'baseline',
  image: '/services/upgrade/baseline-panel.png',
  title: 'Superpower Baseline Panel',
  description:
    '100+ lab tests, results tracked over time and a private medical team.',
};

const CarouselDots = ({ count }: { count: number }) => {
  const { emblaMainApi } = useCarousel();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!emblaMainApi) return;

    const onSelect = () => {
      setActiveIndex(emblaMainApi.selectedScrollSnap());
    };

    onSelect();
    emblaMainApi.on('select', onSelect);
    emblaMainApi.on('reInit', onSelect);

    return () => {
      emblaMainApi.off('select', onSelect);
      emblaMainApi.off('reInit', onSelect);
    };
  }, [emblaMainApi]);

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          onClick={() => emblaMainApi?.scrollTo(index)}
          className={cn(
            'h-1.5 w-6 rounded-full transition-colors',
            activeIndex === index ? 'bg-primary' : 'bg-zinc-200',
          )}
        >
          <span className="sr-only">slide {index + 1}</span>
        </button>
      ))}
    </div>
  );
};

export const BenefitSummary = () => {
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('id');
  const benefits = useBenefits(organizationId ?? '');

  const panelItems = useMemo(() => {
    const items: PanelItem[] = [];
    const defaultBenefits = benefits?.data?.defaultBenefit ?? [];

    const advancedBenefit = defaultBenefits.find((benefit) =>
      benefit.productId.includes('v2-advanced-blood-panel'),
    );
    const baselineBenefit = defaultBenefits.find((benefit) =>
      benefit.productId.includes('v2-baseline-blood-panel'),
    );

    if (advancedBenefit)
      items.push({ ...ADVANCED_PANEL, quantity: advancedBenefit.quantity });
    if (baselineBenefit)
      items.push({ ...BASELINE_PANEL, quantity: baselineBenefit.quantity });

    // Fallback to baseline if no panels found
    if (items.length === 0) items.push({ ...BASELINE_PANEL, quantity: 1 });

    return items;
  }, [benefits?.data?.defaultBenefit]);

  const showCarousel = panelItems.length > 1;

  const renderPanelContent = (panel: PanelItem) => (
    <>
      <img
        src={panel.image}
        alt={panel.title}
        className="pointer-events-none mx-auto h-[140px] w-full select-none object-contain pt-4 lg:h-[180px]"
      />
      <div className="text-center lg:text-left">
        <H4 className="text-base lg:text-lg">
          {panel.title} ({panel.quantity}x)
        </H4>
        <Body2 className="text-zinc-500">{panel.description}</Body2>
      </div>
    </>
  );

  return (
    <div className="flex w-full flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 lg:sticky lg:top-8 lg:h-[calc(100svh-4rem)] lg:max-h-[calc(100svh-4rem)] lg:overflow-auto lg:p-10">
      <Body1 className="text-zinc-500">Benefit summary</Body1>
      {showCarousel ? (
        <Carousel
          carouselOptions={{ loop: false }}
          autoPlayOptions={{ delay: 4000, stopOnInteraction: false }}
        >
          <CarouselMainContainer>
            {panelItems.map((panel) => (
              <SliderMainItem key={panel.id}>
                <div className="w-full space-y-2 rounded-[20px] border bg-white p-4 shadow-sm lg:space-y-4">
                  {renderPanelContent(panel)}
                </div>
              </SliderMainItem>
            ))}
          </CarouselMainContainer>
          <CarouselDots count={panelItems.length} />
        </Carousel>
      ) : (
        <div className="w-full space-y-2 rounded-[20px] border bg-white p-4 shadow-sm lg:space-y-4">
          {renderPanelContent(panelItems[0])}
        </div>
      )}
    </div>
  );
};
