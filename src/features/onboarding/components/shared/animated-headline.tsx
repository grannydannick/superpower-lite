import type { Variants } from 'framer-motion';

import { TextEffect } from '@/components/ui/text-effect';
import { H2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface AnimatedHeadlineProps {
  children: string;
  className?: string;
}

const headlineContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.24,
      ease: 'easeOut',
    },
  },
};

const headlineItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    filter: 'blur(6px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.18,
      ease: 'easeOut',
    },
  },
};

export const AnimatedHeadline = ({
  children,
  className,
}: AnimatedHeadlineProps) => {
  return (
    <div className={cn('w-full text-center', className)}>
      <H2 className="text-secondary">
        <TextEffect
          per="word"
          as="span"
          className={cn('inline-block text-balance text-secondary')}
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
