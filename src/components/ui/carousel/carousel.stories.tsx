import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import {
  Carousel,
  CarouselIndicator,
  CarouselMainContainer,
  CarouselNext,
  CarouselPrevious,
  CarouselThumbsContainer,
  SliderMainItem,
} from './carousel';

const meta: Meta<typeof Carousel> = {
  component: Carousel,
};

export default meta;

type Story = StoryObj<typeof Carousel>;

const CarouselIndicatorExample = () => {
  return (
    <Carousel>
      <CarouselNext />
      <CarouselPrevious />
      <div className="relative ">
        <CarouselMainContainer className="h-60">
          {Array.from({ length: 5 }).map((_, index) => (
            <SliderMainItem key={index} className="bg-transparent">
              <div className="flex size-full items-center justify-center rounded-xl bg-background outline outline-1 outline-border">
                Slide {index + 1}
              </div>
            </SliderMainItem>
          ))}
        </CarouselMainContainer>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <CarouselThumbsContainer className="gap-x-1 ">
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselIndicator key={index} index={index} />
            ))}
          </CarouselThumbsContainer>
        </div>
      </div>
    </Carousel>
  );
};

export const Default: Story = {
  render: () => <CarouselIndicatorExample />,
};
