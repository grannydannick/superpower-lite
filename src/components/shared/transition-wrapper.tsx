import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

type TransitionType = 'fade-in';

interface TransitionConfig {
  initial: MotionProps['initial'];
  animate: MotionProps['animate'];
  transition: MotionProps['transition'];
}

const TRANSITION_CONFIGS: Record<TransitionType, TransitionConfig> = {
  'fade-in': {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, delay: 0.5, ease: 'easeOut' },
  },
};

interface TransitionWrapperProps {
  type: TransitionType;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const TransitionWrapper = ({
  type,
  children,
  className,
  delay,
}: TransitionWrapperProps) => {
  const config = TRANSITION_CONFIGS[type];
  const configDelay = (config.transition as { delay?: number })?.delay;

  return (
    <motion.div
      className={className}
      initial={config.initial}
      animate={config.animate}
      transition={{
        ...config.transition,
        delay: delay ?? configDelay,
      }}
    >
      {children}
    </motion.div>
  );
};
