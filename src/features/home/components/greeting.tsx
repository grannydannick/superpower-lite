import {
  Carousel,
  CarouselIndicator,
  CarouselMainContainer,
  CarouselThumbsContainer,
  SliderMainItem,
} from '@/components/ui/carousel';
import { H2 } from '@/components/ui/typography';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { useUser } from '@/lib/auth';
import { getDaytime } from '@/utils/get-date-time';

import { AgeCard } from './greeting-items/age-card';
import { ProtocolCard } from './greeting-items/protocol-card';
import { ScoreCard } from './greeting-items/score-card';

export const Greeting = () => {
  const { data: user } = useUser();
  const { width } = useWindowDimensions();

  const greeting = user?.firstName
    ? `Good ${getDaytime()} ${user.firstName},`
    : `Good ${getDaytime()},`;

  const greetingText = 'Welcome to Superpower';

  const cards = [
    <ScoreCard key="score" />,
    <AgeCard key="age" />,
    <ProtocolCard key="protocol" />,
  ];

  return (
    <header
      id="nav-reverse"
      className="size-full h-[700px] overflow-hidden bg-black py-32 md:px-8"
    >
      <div className="relative z-50 mx-auto max-w-[1600px] md:px-8 min-[1620px]:px-16">
        <H2 className="mb-8 px-6 text-white md:px-0">
          {greeting} <br />
          <span className="text-white/75">{greetingText}</span>
        </H2>
        {
          // We want to show a carousel on mobile
          width <= 1024 ? (
            <Carousel className="cursor-grab px-4 [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] active:cursor-grabbing">
              <CarouselMainContainer>
                {cards.map((card, index) => (
                  <SliderMainItem
                    key={index}
                    className={index > 0 ? 'px-4' : ''}
                  >
                    {card}
                  </SliderMainItem>
                ))}
              </CarouselMainContainer>
              <CarouselThumbsContainer className="justify-center gap-x-1.5">
                {Array.from({ length: cards.length }).map((_, index) => (
                  <CarouselIndicator
                    key={index}
                    index={index}
                    className="size-1.5 data-[active='false']:bg-white/30 data-[active='true']:bg-white hover:bg-white/50"
                  />
                ))}
              </CarouselThumbsContainer>
            </Carousel>
          ) : (
            <div className="grid w-full grid-cols-3 gap-4">
              {cards.map((card, index) => (
                <div key={index}>{card}</div>
              ))}
            </div>
          )
        }
      </div>
      <div className="pointer-events-none absolute left-1/2 top-0 size-full max-w-[2010px] -translate-x-1/2 scale-150 overflow-hidden bg-home bg-cover bg-top blur-sm" />
      {/* <CompleteAvatarUploadModal /> */}
    </header>
  );
};
