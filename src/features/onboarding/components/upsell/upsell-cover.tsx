import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { H1, H4 } from '@/components/ui/typography';

export const UpsellCover = ({ goToNext }: { goToNext: () => void }) => {
  return (
    <div
      className="absolute left-1/2 top-1/2 col-span-2 h-dvh w-screen -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-[url('/onboarding/upsell/upsell-cover-main.webp')] bg-cover bg-center"
      style={{
        outline: 'none',
        border: 'none',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        WebkitTransformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {/* <video
        className="absolute inset-0 z-0 size-full object-cover"
        autoPlay
        muted
        preload="metadata"
      >
        <source src="/onboarding/upsell/upsell-cover.webm" type="video/webm" />
      </video> */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          // delay: 1.5
        }}
      >
        <H1 className="mb-4 max-w-96 text-balance text-center leading-tight text-white md:max-w-xl">
          Learn more about your body
        </H1>
        <H4 className="mb-10 max-w-xl px-2 text-center text-base text-white md:px-0 md:text-xl">
          Your membership covers 100+ biomarkers. But additional tests could
          give you even more critical insights.
        </H4>
        <Button
          variant="white"
          className="absolute bottom-4 w-full max-w-[calc(100%-32px)] md:static md:max-w-xs"
          onClick={goToNext}
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
};
