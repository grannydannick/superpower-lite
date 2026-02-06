import type { Variants } from 'framer-motion';

import { TextEffect } from '@/components/ui/text-effect';
import { H2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

type AnimatedHeadlineProps = {
  children: string;
  className?: string;
};

/**
 * Custom animation variants for the headline effect:
 * - Enter: Words fade in with blur and slide up from 14px below
 * - Exit: Simple fade out without blur or movement
 */
const headlineContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

const headlineItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    // Keep y and filter at their visible values to prevent movement/blur on exit
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
};

export const AnimatedHeadline = ({
  children,
  className,
}: AnimatedHeadlineProps) => {
  return (
    <div className={cn('text-organic-reveal text-gradient-mask', className)}>
      <H2 className="text-secondary">
        <TextEffect
          per="word"
          variants={{
            container: headlineContainerVariants,
            item: headlineItemVariants,
          }}
        >
          {children}
        </TextEffect>
      </H2>
    </div>
  );
};
