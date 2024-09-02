import { useMotionValueEvent, useScroll, motion } from 'framer-motion';
import React, { useRef, useState } from 'react';

import { ConfiguratorForm } from '@/features/onboarding/components/configurator/configurator-form';
import { FaqSection } from '@/features/onboarding/components/configurator/faq-section';
import { SectionLocations } from '@/features/onboarding/components/configurator/locations';
import { SectionMembership } from '@/features/onboarding/components/configurator/membership';
import { SectionPackages } from '@/features/onboarding/components/configurator/packages';
import { SectionServices } from '@/features/onboarding/components/configurator/services';
import { ConfiguratorLayout } from '@/features/onboarding/components/layouts';
import { cn } from '@/lib/utils';

export const Configurator = () => {
  const content = [
    {
      component: <SectionMembership />,
      image: (
        <img
          src="/onboarding/dashboard.png"
          className="h-auto w-full max-w-[400px] object-cover"
          alt="dashboard"
        />
      ),
    },
    {
      component: <SectionPackages />,
      image: (
        <img
          src="/onboarding/superpower-blood-nobg.png"
          className="h-auto w-full max-w-[423px] object-cover"
          alt="tube"
        />
      ),
    },
    {
      component: <SectionLocations />,
      image: (
        <img
          src="/onboarding/test-kit.png"
          className="h-auto w-full max-w-[300px] object-cover mix-blend-darken"
          alt="dashboard"
        />
      ),
    },
    {
      component: <SectionServices />,
      image: (
        <img
          src="/onboarding/dashboard.png"
          className="h-auto w-full max-w-[400px] object-cover"
          alt="dashboard"
        />
      ),
    },
  ];

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCard, setActiveCard] = React.useState(0);
  // wrapper ref is responsible for entire layout
  const wrapperRef = useRef<HTMLDivElement>(null);
  // faw ref is responsible for the left div in layout
  const faqRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: wrapperRef,
    offset: ['start start', 'end start'],
  });
  const cardLength = content.length;

  /* NB: if amount of section increases u need to adjust cardsBreakpoints (or come up with smarter way :=D */
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const cardsBreakpoints = content.map(
      (_, index) => index / cardLength / 1.5,
    );

    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);

        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative flex h-screen justify-center overflow-y-auto text-white"
      ref={wrapperRef}
    >
      <div
        className={cn(
          'hidden lg:flex flex-col items-center justify-between h-screen sticky top-0 w-full bg-[#F7F7F7] p-8',
        )}
        ref={faqRef}
      >
        <img
          src="/logo-dark.svg"
          alt="logo"
          className="h-auto w-[114px] object-cover"
        />
        {content[activeCard].image ?? null}
        <FaqSection faqRef={faqRef} />
      </div>
      <ConfiguratorForm
        parentRef={wrapperRef}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        activeCard={activeCard}
        content={content}
      />
    </motion.div>
  );
};

export const ConfiguratorStep = () => (
  <ConfiguratorLayout title="Configurator">
    <Configurator />
  </ConfiguratorLayout>
);
