import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';

import {
  Carousel,
  CarouselMainContainer,
  SliderMainItem,
} from '@/components/ui/carousel';
import { Body1, Body2 } from '@/components/ui/typography';

const PREPARATION_TIPS = [
  {
    title: 'Stay hydrated',
    description:
      'Drink at least 1L (4 cups) of water the day before and the morning of your visit. Good hydration makes blood draws easier.',
  },
  {
    title: 'Fast for 10 hours',
    description:
      'Have a light, healthy meal beforehand, then start your fast 10 hours before your appointment.',
  },
  {
    title: 'No caffeine and no alcohol',
    description:
      'Skip alcohol & caffeine the day before. Avoid all exercise for 24 hours, as it can affect your results.',
  },
  {
    title: 'Avoid heavy, fatty foods',
    description:
      'Avoid heavy, fatty foods such as ice cream and coconut cream before your fast as these can influence your results if not part of your normal diet.',
  },
  {
    title: 'Stop taking Biotin supplements',
    description:
      'Stop taking supplements with biotin, commonly found in multivitamins, B-complex, or hair skin and nail vitamins. Continue any prescriptions provided by your clinician.',
  },
  {
    title: 'Keep your arms warm',
    description:
      'Warm arms help your veins dilate, making the draw quicker & more comfortable.',
  },
];

export const PreparationTipsCarousel = () => {
  return (
    <div className="relative">
      <Carousel
        carouselOptions={{
          loop: false,
          align: 'start',
          containScroll: 'keepSnaps',
          dragFree: true,
        }}
        plugins={[WheelGesturesPlugin()]}
      >
        <CarouselMainContainer>
          {PREPARATION_TIPS.map((tip, index) => (
            <SliderMainItem
              key={index}
              className="basis-4/5 pl-0 pr-4 md:basis-3/5 lg:basis-3/5"
            >
              <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm md:border md:border-zinc-200 md:bg-none md:shadow-none">
                <Body1 className="mb-2 font-medium text-zinc-900">
                  {tip.title}
                </Body1>
                <Body2 className="mb-4 flex-1 text-sm leading-relaxed text-zinc-600">
                  {tip.description}
                </Body2>
                <div className="text-xs text-zinc-400">
                  {index + 1} / {PREPARATION_TIPS.length}
                </div>
              </div>
            </SliderMainItem>
          ))}
        </CarouselMainContainer>
      </Carousel>
    </div>
  );
};
