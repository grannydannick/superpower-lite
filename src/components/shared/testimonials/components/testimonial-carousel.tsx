import { TESTIMONIALS } from '@/components/shared/testimonials/const/testimonials';
import { Card } from '@/components/ui/card';
import {
  Carousel,
  CarouselMainContainer,
  SliderMainItem,
  CarouselThumbsContainer,
  CarouselIndicator,
} from '@/components/ui/carousel';
import { Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

export const TestimonialCarousel = ({ darkMode }: { darkMode: boolean }) => {
  return (
    <div
      className="relative cursor-grab select-none active:cursor-grabbing md:z-20"
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 10%, black 90%, transparent 100%)',
      }}
    >
      <Carousel
        autoPlayOptions={{
          delay: 5000,
          stopOnInteraction: true,
        }}
      >
        <CarouselMainContainer>
          {TESTIMONIALS.map((testimonial, index) => (
            <SliderMainItem key={index}>
              <Card className="mx-auto flex h-auto max-w-sm flex-col items-center rounded-none border-none bg-transparent p-4 shadow-none">
                <div className="relative mb-4 size-12 overflow-hidden rounded-full border border-white/10">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="size-full  object-cover"
                  />
                </div>
                <Body2
                  className={cn(
                    'mb-2 text-center',
                    darkMode ? 'text-white' : 'text-zinc-900',
                  )}
                >
                  {testimonial.testimonial}
                </Body2>
                <Body2
                  className={cn(
                    'text-center opacity-40',
                    darkMode ? 'text-white' : 'text-zinc-900',
                  )}
                >
                  {testimonial.name}, {testimonial.age}, {testimonial.location}
                </Body2>
              </Card>
            </SliderMainItem>
          ))}
        </CarouselMainContainer>
        <CarouselThumbsContainer className="mb-2 justify-center gap-x-2">
          {TESTIMONIALS.map((_, index) => (
            <CarouselIndicator
              key={index}
              index={index}
              className={cn(
                'size-2 shadow-none data-[active="true"]:!bg-vermillion-900',
                darkMode
                  ? 'data-[active="false"]:bg-zinc-300/25'
                  : 'data-[active="false"]:bg-zinc-300/30 ',
              )}
            />
          ))}
        </CarouselThumbsContainer>
      </Carousel>
    </div>
  );
};
