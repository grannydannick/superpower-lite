import { motion } from 'framer-motion';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { ShimmerDune } from '@/components/ui/shimmer-dune';
import { SlideToUnlock } from '@/components/ui/slide-to-unlock';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Body1, H1 } from '@/components/ui/typography';

import { useSequence } from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

export const IntroStep = () => {
  const { next } = useSequence();

  const contentVariants = {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: {
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 1.2,
        ease: 'easeOut',
        delay: 3.5,
      },
    },
  };

  const footerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        delay: 5.2,
      },
    },
  };

  return (
    <Sequence.StepLayout centered className="overflow-visible">
      <Sequence.StepMedia className="relative flex items-center pb-40 md:max-w-xl">
        {/* Logo with mask reveal animation */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="relative h-16 w-48 md:h-20 md:w-56">
            {/* Base logo that gets revealed with soft radial mask */}
            <motion.div
              className="absolute inset-0"
              style={{
                WebkitMaskImage:
                  'radial-gradient(circle at 50% 50%, black 0%, black 30%, transparent 70%)',
                maskImage:
                  'radial-gradient(circle at 50% 50%, black 0%, black 30%, transparent 70%)',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
              }}
              initial={{
                WebkitMaskSize: '0% 0%',
                maskSize: '0% 0%',
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                WebkitMaskSize: [
                  '0% 0%',
                  '40% 40%',
                  '180% 180%',
                  '220% 220%',
                  '220% 220%',
                  '280% 280%',
                  '350% 350%',
                  '450% 450%',
                ],
                maskSize: [
                  '0% 0%',
                  '40% 40%',
                  '180% 180%',
                  '220% 220%',
                  '220% 220%',
                  '280% 280%',
                  '350% 350%',
                  '450% 450%',
                ],
                opacity: [0, 0.8, 1, 1, 1, 0.7, 0.3, 0],
                scale: [0.95, 0.98, 1, 1, 1, 1.01, 1.03, 1.05],
                filter: [
                  'blur(4px)',
                  'blur(1px)',
                  'blur(0px)',
                  'blur(0px)',
                  'blur(0px)',
                  'blur(2px)',
                  'blur(5px)',
                  'blur(10px)',
                ],
              }}
              transition={{
                duration: 4.5,
                times: [0, 0.12, 0.28, 0.38, 0.6, 0.75, 0.88, 1],
                ease: 'easeInOut',
              }}
            >
              <SuperpowerLogo className="size-full" />
            </motion.div>

            {/* Shimmer highlight overlay */}
            <motion.div
              className="pointer-events-none absolute inset-0 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0.8, 0.8, 0] }}
              transition={{
                duration: 4.5,
                times: [0, 0.35, 0.45, 0.55, 0.65],
                ease: 'easeInOut',
              }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(110deg, transparent 0%, transparent 30%, rgba(255,255,255,0.25) 42%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 58%, transparent 70%, transparent 100%)',
                  backgroundSize: '250% 100%',
                }}
                initial={{ backgroundPosition: '120% 0' }}
                animate={{
                  backgroundPosition: ['120% 0', '120% 0', '-50% 0', '-50% 0'],
                }}
                transition={{
                  duration: 4.5,
                  times: [0, 0.35, 0.6, 1],
                  ease: [0.4, 0, 0.2, 1],
                }}
              />
            </motion.div>
          </div>
        </div>

        <motion.div
          className="flex size-full flex-col items-center justify-center px-6 pt-12 md:px-16"
          variants={contentVariants}
          initial="initial"
          animate="animate"
        >
          <ShimmerDune className="h-40 w-full shrink-0 md:h-72" />
          <div className="relative z-10">
            <H1 className="-mt-16 mb-2 text-center md:-mt-32 md:text-5xl">
              Welcome to <br />
              your home for health
            </H1>
            <Body1 className="text-center text-secondary">
              For people taking control of their health
            </Body1>
          </div>
        </motion.div>
      </Sequence.StepMedia>
      <Sequence.StepFooter>
        <motion.div
          className="relative mx-auto h-16 w-full max-w-sm"
          variants={footerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-vermillion-500 to-vermillion-900 opacity-25 blur-2xl" />
          <SlideToUnlock
            onComplete={next}
            noShrink
            className="relative z-20 flex items-center justify-between rounded-full border border-black/[.03] bg-white/90 p-2 shadow-xl backdrop-blur-2xl"
          >
            <div className="flex size-full items-center justify-between gap-2 px-6">
              <div className="size-0.5 shrink-0 bg-zinc-200" />
              <div className="size-0.5 shrink-0 bg-zinc-200" />
              <div className="size-0.5 shrink-0 bg-zinc-200" />
              <div className="size-0.5 shrink-0 bg-zinc-200" />
              <TextShimmer
                className="truncate text-sm [--base-color:rgba(0,0,0,0.5)] [--base-gradient-color:#ffffff]"
                duration={2}
              >
                Unlock your potential
              </TextShimmer>
              <div className="size-0.5 shrink-0 bg-zinc-200" />
              <div className="size-0.5 shrink-0 bg-zinc-200" />
              <div className="size-0.5 shrink-0 bg-zinc-200" />
              <div className="size-0.5 shrink-0 bg-zinc-200" />
            </div>
          </SlideToUnlock>
        </motion.div>
      </Sequence.StepFooter>
    </Sequence.StepLayout>
  );
};
