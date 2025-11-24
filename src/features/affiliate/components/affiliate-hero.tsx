import {
  Carousel,
  CarouselIndicator,
  CarouselMainContainer,
  CarouselThumbsContainer,
  SliderMainItem,
} from '@/components/ui/carousel';
import { H2, H4 } from '@/components/ui/typography';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

const PRODUCTS: {
  title: string;
  image: string;
}[] = [
  {
    title: 'Magnesium Glycinate',
    image: '/affiliate/magnesium-glycinate.webp',
  },
  {
    title: 'NAD+ Gold',
    image: '/affiliate/nad-gold.webp',
  },
  {
    title: 'Creatine',
    image: '/affiliate/creatine.webp',
  },
  {
    title: 'One Omega',
    image: '/affiliate/one-omega.webp',
  },
];

export const AffiliateHero = () => {
  const { width } = useWindowDimensions();

  return (
    <header className="mx-auto flex h-full flex-col justify-end pb-32 md:pb-40">
      <div className="relative z-10 py-16">
        <H2 className="text-white">
          Refer your friends <br />
          <span className="text-white/75">Earn rewards on supplements</span>
        </H2>

        <div className="mt-8">
          {width <= 1024 ? (
            <Carousel className="cursor-grab px-4 [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] active:cursor-grabbing">
              <CarouselMainContainer>
                {PRODUCTS.map((card, index) => (
                  <SliderMainItem
                    key={index}
                    className={index > 0 ? 'px-4' : ''}
                  >
                    <ProductCard title={card.title} image={card.image} />
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
                  <ProductCard title={card.title} image={card.image} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const ProductCard = ({ title, image }: { title: string; image: string }) => {
  return (
    <div className="mx-auto flex h-56 w-full max-w-sm flex-col justify-between rounded-2xl border border-white/10 bg-zinc-200/10 p-6 text-white backdrop-blur-xl">
      <H4 className="text-white">{title}</H4>

      <img
        src={image}
        alt={title}
        className="max-h-32 select-none object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
        draggable={false}
      />
    </div>
  );
};
