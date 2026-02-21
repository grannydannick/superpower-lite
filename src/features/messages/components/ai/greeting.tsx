import { m } from 'framer-motion';

import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

import { AnimatedIcon } from './animated-icon';

export const Greeting = () => {
  const { data: user } = useUser();
  return (
    <div
      key="overview"
      className="relative mx-auto flex size-full flex-col items-center"
    >
      <DuneGradient />
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-2 text-xl md:text-2xl"
      >
        <AnimatedIcon state="idle" />
        Hi {user?.firstName ?? 'from Superpower'}, how can we help you?
      </m.div>
    </div>
  );
};

export const DuneGradient = ({ className }: { className?: string }) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 40, x: '-50%' }}
      animate={{
        opacity: [0, 0.6, 0.6, 0],
        y: [40, 0, 0, 0],
        x: '-50%',
      }}
      exit={{ opacity: 0, y: 40, x: '-50%' }}
      transition={{
        duration: 3,
        ease: 'easeOut',
        times: [0, 0.35, 0.7, 1],
      }}
      className={cn(
        'pointer-events-none absolute -top-48 left-1/2 h-60 w-full overflow-hidden',
        className,
      )}
    >
      <div className="dune-fade-mask absolute inset-0 bg-[url('/concierge/dune.png')] bg-contain bg-center bg-no-repeat" />
      <m.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          duration: 2,
          ease: 'easeInOut',
          delay: 0.3,
        }}
        className="dune-shimmer dune-fade-mask absolute inset-0"
      />
    </m.div>
  );
};
