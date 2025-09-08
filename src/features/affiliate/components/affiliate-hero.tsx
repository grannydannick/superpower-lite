import {
  Carousel,
  CarouselIndicator,
  CarouselMainContainer,
  CarouselThumbsContainer,
  SliderMainItem,
} from '@/components/ui/carousel';
import { Body3, H2, H4 } from '@/components/ui/typography';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

const PRODUCTS: {
  title: string;
  image: string;
  description: string;
}[] = [
  {
    title: 'Manta Sleep Mask',
    image: '/affiliate/manta-sleep-mask.webp',
    description: 'Invite 2 friends',
  },
  {
    title: 'Classic Night Swannies',
    image: '/affiliate/classic-night-swannies.webp',
    description: 'Invite 3 friends',
  },
  {
    title: 'Theragun Mini',
    image: '/affiliate/theragun-mini.webp',
    description: 'Invite 4 friends',
  },
  {
    title: 'Venom 2 Back',
    image: '/affiliate/venom-2-back.webp',
    description: 'Invite 4 friends',
  },
];

export const AffilliateHero = () => {
  const { width } = useWindowDimensions();

  return (
    <header className="mx-auto flex h-full flex-col justify-end pb-40">
      <div className="relative z-10 py-16">
        <H2 className="text-white">
          Refer your friends
          <br />
        </H2>
        <H2 className="text-white/75">Earn Rewards</H2>
        <div className="mt-8">
          {
            // We want to show a carousel on mobile
            width <= 1024 ? (
              <Carousel className="cursor-grab px-4 [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] active:cursor-grabbing">
                <CarouselMainContainer>
                  {PRODUCTS.map((card, index) => (
                    <SliderMainItem
                      key={index}
                      className={index > 0 ? 'px-4' : ''}
                    >
                      <ProductCard
                        title={card.title}
                        image={card.image}
                        description={card.description}
                      />
                    </SliderMainItem>
                  ))}
                </CarouselMainContainer>
                <CarouselThumbsContainer className="justify-center gap-x-1.5">
                  {Array.from({ length: PRODUCTS.length }).map((_, index) => (
                    <CarouselIndicator
                      key={index}
                      index={index}
                      className="size-1.5 data-[active='false']:bg-white/30 data-[active='true']:bg-white hover:bg-white/50"
                    />
                  ))}
                </CarouselThumbsContainer>
              </Carousel>
            ) : (
              <div className="grid w-full grid-cols-4 gap-4">
                {PRODUCTS.map((card, index) => (
                  <div key={index}>
                    <ProductCard
                      title={card.title}
                      image={card.image}
                      description={card.description}
                    />
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </header>
  );
};

const ProductCard = ({
  title,
  image,
  description,
}: {
  title: string;
  image: string;
  description: string;
}) => {
  return (
    <div className="relative mx-auto h-56 w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-400/15 p-4 backdrop-blur-xl">
      <img
        src={image}
        alt={title}
        className="absolute inset-0 size-full select-none object-contain"
      />
      <div className="relative flex size-full h-48 flex-col">
        <H4 className="text-white">{title}</H4>
        <div className="flex-1"></div>
        <Body3 className="text-white">{description}</Body3>
      </div>
    </div>
  );
};
