import { motion } from 'framer-motion';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Body1, H1 } from '@/components/ui/typography';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

export const MaintenancePage = () => {
  const { width } = useWindowDimensions();

  return (
    <div
      className="relative flex h-screen w-full flex-col items-center bg-[url('/onboarding/shared/backgrounds/bg-spine.webp')] bg-cover bg-center"
      role="alert"
    >
      <motion.div
        className="relative z-10 flex min-h-screen w-full flex-col items-center gap-6 p-4 pt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <SuperpowerLogo className="h-auto w-[163px]" fill="#ffffff" />

        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          >
            <H1 className="text-center text-white">
              We&apos;re currently doing scheduled maintenance.
            </H1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
          >
            <Body1 className="text-center text-white/90">
              We&apos;re making some changes behind the scenes to serve you
              better.
              {width > 768 ? <br /> : ' '}
              Please check back for updates and an improved experience.
            </Body1>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 z-20 h-64 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
};
