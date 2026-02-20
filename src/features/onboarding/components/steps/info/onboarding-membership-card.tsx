import { motion } from 'framer-motion';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { cn } from '@/lib/utils';

export const OnboardingCard = () => {
  return (
    <motion.div
      className={cn(
        'relative aspect-[16/9] h-56 w-96 overflow-hidden rounded-2xl bg-[url("/onboarding/shared/backgrounds/card-organic-bg.webp")] bg-cover bg-center shadow-2xl outline outline-1 -outline-offset-1 outline-white/20',
      )}
      initial={{ rotate: 0, scale: 0.7, opacity: 0, filter: 'blur(2px)' }}
      animate={{
        rotate: -4,
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        zIndex: 10,
      }}
      transition={{
        type: 'spring',
        damping: 11,
        stiffness: 50,
        duration: 3,
      }}
    >
      <div className="absolute left-6 top-5 z-20 inline-block mix-blend-soft-light">
        <SuperpowerLogo fill="white" className="block w-32" />
      </div>
      <p className="absolute bottom-4 right-4 z-20 text-right text-white/80">
        <span className="select-none text-xl font-medium">Membership</span>
      </p>
    </motion.div>
  );
};
