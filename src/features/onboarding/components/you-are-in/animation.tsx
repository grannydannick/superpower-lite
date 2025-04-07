import { useWindowWidth } from '@wojtekmaj/react-hooks';
import { differenceInYears, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Button } from '@/components/ui/button';
import { H1, H2, H3 } from '@/components/ui/typography';
import { Collage } from '@/features/onboarding/components/you-are-in/collage';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const Activation = ({
  sequence,
  setSequence,
}: {
  sequence: number;
  setSequence: (sequence: number) => void;
}) => {
  const { data: user } = useUser();
  const scrollableSectionRef = useRef<HTMLElement>(null);
  const [scrollInSection, setScrollInSection] = useState(0);
  const width = useWindowWidth();
  const isMobile = width ? width < 768 : false;

  const birthDate = parseISO(user?.dateOfBirth ?? '');
  const today = new Date();
  const age = differenceInYears(today, birthDate);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollableSectionRef.current && sequence > 0) {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const scrollPercent = Math.round(
          (scrollTop /
            (scrollableSectionRef.current.scrollHeight - windowHeight)) *
            100,
        );

        setScrollInSection(scrollPercent);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sequence, setSequence]);

  const variants = {
    initial: {
      width: '100%',
      height: '100%',
      opacity: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] },
    },
    big: {
      width: '100%',
      height: '100%',
      opacity: 1,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] },
    },
    small: {
      width: width ? (width < 768 ? 300 : 474) : 474,
      height: width ? (width < 768 ? 188 : 301) : 301,
      opacity: 1,
      borderRadius: width ? (width < 768 ? '8px' : '20px') : '20px',
      transition: {
        duration: 1,
        ease: [0.68, 0.35, 0.27, 1],
        borderRadius: { duration: 0.5, delay: 0.1 },
      },
    },
    final: {
      width: width ? (width < 768 ? 300 : 474) : 474,
      height: width ? (width < 768 ? 188 : 301) : 301,
      opacity: 1,
      boxShadow: '0px 16px 64px 0px rgba(252,95,43,1)',
      borderRadius: width ? (width < 768 ? '8px' : '20px') : '20px',
      transition: {
        duration: 1,
        ease: [0.68, 0.35, 0.27, 1],
        borderRadius: { duration: 0.5, delay: 0.1 },
      },
    },
  };

  return (
    <section
      ref={scrollableSectionRef}
      className={cn(
        'relative flex flex-col',
        sequence === 0 ? 'max-h-svh' : 'min-h-[500vh]',
      )}
    >
      <div className="z-10 flex size-full h-svh items-center justify-center">
        <motion.div
          className={cn(
            'relative flex items-center justify-center overflow-hidden bg-cover',
            sequence !== 0 && 'border border-white/10',
          )}
          initial="initial"
          animate={sequence === 0 ? 'big' : sequence === 1 ? 'small' : 'final'}
          variants={variants}
          style={{
            backgroundImage: 'url(/onboarding/activation-image.webp)',
            backgroundSize: 'cover',
            transform: `rotate(-${scrollInSection / 2}deg)`,
          }}
        >
          <img
            src="/onboarding/card-texture.webp"
            alt="card texture"
            className={cn(
              'absolute inset-0 z-10 size-full object-cover transition-opacity duration-1000',
              sequence >= 1 ? 'opacity-100' : 'opacity-0',
            )}
          />
          <div
            className={cn(
              'absolute inset-0 z-20 flex items-center justify-center md:p-8 p-4 transition-all delay-300 ease-out duration-700',
              sequence >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75',
            )}
          >
            <div className="flex size-full flex-col justify-between text-xs md:text-sm">
              <H2 className="text-left text-lg text-white md:text-3xl">
                {user?.firstName}
              </H2>
              <div className="flex w-full items-end justify-between gap-4">
                <p className="text-white">
                  Since {new Date(user?.createdAt ?? new Date()).getFullYear()}
                </p>
                <div className="flex flex-col">
                  <H3 className="text-right text-2xl text-white md:!text-3xl">
                    {age}
                  </H3>
                  <p className="text-right text-white">
                    Chronological years old
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              'absolute px-4 inset-0 z-20 flex flex-col justify-between items-center py-16 transition-all ease-[cubic-bezier(0.25,0.1,0.25,1.0)] duration-[850ms]',
              sequence === 0
                ? 'opacity-100 scale-100'
                : 'opacity-0 invisible pointer-events-none scale-50',
            )}
          >
            <SuperpowerLogo fill="white" />
            <div className="flex max-w-lg flex-col items-center gap-4 px-8 md:px-0">
              <p className="text-center text-white">You&apos;re on</p>
              <H1 className="mb-10 text-center text-4xl text-white md:!text-6xl">
                Let&apos;s activate your membership
              </H1>
              <Button
                onClick={() => {
                  setSequence(1);
                  setTimeout(() => {
                    setSequence(2);
                  }, 1000);
                }}
                variant="white"
                className="w-full max-w-sm rounded-full"
              >
                Activate
              </Button>
            </div>
            <div />
          </div>
        </motion.div>
      </div>

      {sequence >= 1 && (
        <div className="h-full flex-1">
          <p
            className={cn(
              'absolute left-1/2 mx-auto -ml-10 -mt-16 -translate-x-1/2 transition-opacity duration-500 ease-out animate-bounce text-center text-sm text-zinc-400',
              scrollInSection < 1 ? 'opacity-100' : 'opacity-0',
            )}
          >
            Scroll down
          </p>
          <motion.div
            animate={{
              opacity: scrollInSection > 5 && scrollInSection < 20 ? 1 : 0,
              y:
                scrollInSection < 5
                  ? 60
                  : scrollInSection > 5 && scrollInSection < 20
                    ? 20
                    : 0,
              filter:
                scrollInSection > 5 && scrollInSection < 20
                  ? 'blur(0px)'
                  : 'blur(4px)',
            }}
            className="opacity-0 blur-sm"
          >
            <H2 className="bg-gradient-to-b from-zinc-600 to-zinc-700 bg-clip-text px-8 text-center text-transparent">
              If it hasn&apos;t sunk in yet...
            </H2>
          </motion.div>
          <motion.div
            animate={{
              opacity: scrollInSection > 10 && scrollInSection < 20 ? 1 : 0,
              y:
                scrollInSection < 10
                  ? 60
                  : scrollInSection > 10 && scrollInSection < 20
                    ? 20
                    : 0,
              filter:
                scrollInSection > 10 && scrollInSection < 20
                  ? 'blur(0px)'
                  : 'blur(4px)',
            }}
            className="opacity-0 blur-sm"
          >
            <H2 className="bg-gradient-to-b from-zinc-600 to-zinc-700 bg-clip-text px-8 text-center text-transparent">
              You just made one of the biggest decisions of your life...
            </H2>
          </motion.div>
          <motion.div
            animate={{
              opacity: scrollInSection > 20 && scrollInSection < 50 ? 1 : 0,
            }}
            className="pointer-events-none sticky top-0 -mt-80 flex h-screen w-full items-center justify-center overflow-hidden"
          >
            <motion.div
              animate={{
                transform: `rotateX(${scrollInSection / 2}deg) rotateY(${scrollInSection / 2}deg) rotateZ(${scrollInSection / 2}deg) scale(${2 - (scrollInSection / 100) * 3.5})`,
              }}
              style={{
                perspective: '1000px',
                perspectiveOrigin: 'center',
                transformStyle: 'preserve-3d',
              }}
              className="invisible absolute inset-0 md:visible"
            >
              <img
                src="/onboarding/mission/vo2-max-opt-1080.webp"
                alt="blood biomarker chart"
                className="absolute -left-16 top-8 w-80 md:left-40"
                style={{
                  transform: ` rotateX(-28deg) rotateY(33deg) rotateZ(11deg)`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'visible',
                  transformOrigin: 'center',
                }}
              />
              <img
                src="/onboarding/mission/mris-opt-1080.webp"
                alt="blood biomarker chart"
                className="absolute bottom-8 right-0 w-20 md:right-96"
                style={{
                  transform: 'rotateX(26deg) rotateY(-34deg) rotateZ(23deg)',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'visible',
                  transformOrigin: 'center',
                }}
              />
              <img
                src="/onboarding/mission/intestinal-permeability-panel-opt-1080.webp"
                alt="blood biomarker chart"
                className="absolute -left-32 bottom-0 w-80 md:bottom-16 md:left-24"
                style={{
                  transform: `rotateX(45deg) rotateY(39deg) rotateZ(-18deg)`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'visible',
                  transformOrigin: 'center',
                }}
              />
              <img
                src="/onboarding/mission/dexa-scan-opt-1080.webp"
                alt="blood biomarker chart"
                className="absolute bottom-24 right-24 w-64"
                style={{
                  transform: `rotateX(43deg) rotateY(-19deg) rotateZ(18deg)`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'visible',
                  transformOrigin: 'center',
                }}
              />
              <img
                src="/onboarding/mission/grail-cancer-test-opt-1080.webp"
                alt="blood biomarker chart"
                className="absolute -right-40 top-1/2 -mt-24 w-40 -translate-y-1/2 md:right-24"
                style={{
                  transform: `rotateX(24deg) rotateY(-17deg) rotateZ(4deg)`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'visible',
                  transformOrigin: 'center',
                }}
              />
              <img
                src="/onboarding/mission/cgm-charts-opt-1080.webp"
                alt="blood biomarker chart"
                className="absolute -right-12 top-24 w-64 -translate-y-1/2 md:right-24"
                style={{
                  transform: ` rotateX(-26deg) rotateY(-23deg) rotateZ(13deg)`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'visible',
                  transformOrigin: 'center',
                }}
              />
              <img
                src="/onboarding/mission/blood-biomarker-chart-opt-1080.webp"
                alt="blood biomarker chart"
                className="absolute -left-64 top-1/2 w-64 -translate-y-1/2 md:left-24"
                style={{
                  transform: `rotateX(17deg) rotateY(32deg) rotateZ(-8deg)`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'visible',
                  transformOrigin: 'center',
                }}
              />
            </motion.div>
            <motion.div
              animate={{
                filter:
                  scrollInSection > 20 && scrollInSection < 50
                    ? 'blur(0px)'
                    : 'blur(4px)',
                opacity: scrollInSection > 20 && scrollInSection < 50 ? 1 : 0,
              }}
              className="blur-sm"
            >
              <H1
                style={{
                  transform: isMobile
                    ? `scale(${(scrollInSection / 100) * 2})`
                    : undefined,
                }}
                className="relative z-10 bg-gradient-to-br from-zinc-400 to-zinc-700 bg-clip-text text-center text-transparent transition-all"
              >
                You’ve officially become a <br /> Superpower member
              </H1>
              <div className="absolute left-1/2 top-1/2 h-[50vh] w-screen max-w-7xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FAFAFA] blur-3xl md:h-64" />
            </motion.div>
          </motion.div>
          <div className="mt-[100vh] size-full">
            <motion.div
              animate={{
                opacity: scrollInSection > 50 && scrollInSection < 65 ? 1 : 0,
                y:
                  scrollInSection < 50
                    ? 40
                    : scrollInSection > 50 && scrollInSection < 65
                      ? 20
                      : 0,
                filter:
                  scrollInSection > 50 && scrollInSection < 65
                    ? 'blur(0px)'
                    : 'blur(4px)',
              }}
              className="opacity-0 blur-sm"
            >
              <H2 className="bg-gradient-to-b from-zinc-600 to-zinc-700 bg-clip-text px-8 text-center text-transparent">
                You won’t forget this moment...
              </H2>
            </motion.div>
            <motion.div
              animate={{
                opacity: scrollInSection > 52 && scrollInSection < 67 ? 1 : 0,
                y:
                  scrollInSection < 52
                    ? 40
                    : scrollInSection > 52 && scrollInSection < 67
                      ? 20
                      : 0,
                filter:
                  scrollInSection > 52 && scrollInSection < 67
                    ? 'blur(0px)'
                    : 'blur(4px)',
              }}
              className="opacity-0 blur-sm"
            >
              <H2 className="bg-gradient-to-b from-zinc-600 to-zinc-700 bg-clip-text px-8 text-center text-transparent">
                And neither will we
              </H2>
            </motion.div>
          </div>
          <motion.div
            animate={{
              filter: scrollInSection > 67 ? 'blur(0px)' : 'blur(4px)',
              opacity: scrollInSection > 67 ? 1 : 0,
            }}
            className="pointer-events-none sticky top-0 -mt-40 flex h-screen w-full items-center justify-center overflow-hidden"
          >
            <H1 className="max-w-4xl bg-gradient-to-br from-zinc-400 to-zinc-700 bg-clip-text px-8 text-center text-transparent md:px-0">
              From this day forward, you’ll have us by your side as your
              lifelong health partner
            </H1>
            {scrollInSection > 72 && <Collage setSequence={setSequence} />}
          </motion.div>
        </div>
      )}
    </section>
  );
};
