import { AnimationProps, motion } from 'framer-motion';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const MembershipCard = () => {
  const { data: user } = useUser();

  const shimmerAnimation = {
    opacity: [0.7, 1, 0.7],
    filter: ['brightness(1)', 'brightness(0.7)', 'brightness(1)'],
  } satisfies AnimationProps['animate'];

  return (
    <motion.div
      className={cn(
        'z-10 absolute aspect-[4/3] h-56 w-96 overflow-hidden rounded-2xl bg-cover bg-center outline outline-1 -outline-offset-1 outline-white/10 bg-[url("/onboarding/card-organic-bg.webp")]',
      )}
      initial={{ y: 500, opacity: 0 }}
      animate={{
        y: 0,
        rotate: -4,
        opacity: 1,
        zIndex: 10,
      }}
      transition={{
        type: 'spring',
        damping: 11,
        stiffness: 50,
        duration: 3,
      }}
    >
      <motion.div
        animate={shimmerAnimation}
        transition={{
          duration: 2.5,
          repeat: 2,
          ease: 'easeInOut',
        }}
        className="mix-blend-soft-light"
      >
        <SuperpowerLogo
          fill="white"
          className="absolute left-6 top-5 z-20 w-32"
        />
      </motion.div>
      <motion.p
        className="absolute bottom-4 right-4 z-20 text-right text-white/95"
        animate={shimmerAnimation}
        transition={{
          duration: 2.5,
          repeat: 2,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      >
        <span className="font-medium">
          {user?.firstName === 'Unknown'
            ? user?.email
            : `${user?.firstName} ${user?.lastName}`}
        </span>
      </motion.p>
    </motion.div>
  );
};
