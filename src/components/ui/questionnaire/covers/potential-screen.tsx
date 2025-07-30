import { useState } from 'react';

import { SlideToUnlock } from '@/components/ui/slide-to-unlock';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Body1, H1 } from '@/components/ui/typography';

const PotentialSlideToUnlock = ({ handleNext }: { handleNext: () => void }) => {
  const [progress, setProgress] = useState(0);

  return (
    <div className="absolute bottom-8 h-16 w-full max-w-[calc(100%-2rem)] md:static md:max-w-sm">
      <SlideToUnlock
        onComplete={handleNext}
        onProgress={(progress) => {
          setProgress(progress);
        }}
        className="relative touch-pan-right rounded-full border border-white/[.16] bg-white/20 p-1.5 backdrop-blur-2xl"
      >
        <div
          style={{ opacity: 1 - progress }}
          className="flex h-full items-center justify-center"
        >
          <TextShimmer
            className="truncate text-sm [--base-color:rgba(255,255,255,0.5)] [--base-gradient-color:#ffffff]"
            duration={2}
          >
            Slide to unlock your potential
          </TextShimmer>
        </div>
      </SlideToUnlock>
    </div>
  );
};

export const PotentialScreen = ({ handleNext }: { handleNext: () => void }) => {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-start md:justify-center">
      <H1 className="mx-auto mb-6 max-w-md text-balance text-center text-white max-md:text-5xl md:max-w-xl">
        Every body has 100 year potential
      </H1>
      <Body1 className="mx-auto mb-8 max-w-xl text-balance text-center text-white md:max-w-md">
        No matter where you come from, your body holds that potential.{' '}
        <br className="md:hidden" />
        <br className="md:hidden" />
        We give you the system to unlock it.
      </Body1>
      <PotentialSlideToUnlock handleNext={handleNext} />
    </div>
  );
};
