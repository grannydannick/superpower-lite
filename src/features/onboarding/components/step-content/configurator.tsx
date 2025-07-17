import { motion } from 'framer-motion';

import { TestimonialCarousel } from '@/components/shared/testimonials/components/testimonial-carousel';
import { H4 } from '@/components/ui/typography';
import { ConfiguratorSections } from '@/features/onboarding/components/configurator/configurator-sections';
import { MembershipCard } from '@/features/onboarding/components/configurator/membership-card';
import { ConfiguratorLayout } from '@/features/onboarding/components/layouts';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';

export const Configurator = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 1024;

  return (
    <>
      <ConfiguratorSections />
      <div
        className={cn(
          'flex flex-col gap-6 lg:min-h-[750px] overflow-hidden sticky top-8 items-center justify-center max-h-[calc(100dvh-4rem)] flex-1 lg:bg-[#120B04] w-full lg:rounded-3xl',
        )}
      >
        <div className="hidden flex-1 flex-col justify-end pt-8 lg:flex">
          <H4 className="mb-16 max-w-[256px] text-center text-zinc-50 opacity-50">
            One last step before we start your membership
          </H4>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 2,
          }}
          className={cn(
            'absolute inset-0 -z-10 bg-[url("/onboarding/gradient.webp")] bg-cover bg-center hidden lg:block',
          )}
        />
        <div className="relative hidden flex-1 items-center justify-center lg:flex">
          <MembershipCard />
        </div>
        <div className="flex flex-1 flex-col justify-end px-8 pb-8">
          <TestimonialCarousel darkMode={!isMobile} />
        </div>
      </div>
    </>
  );
};

export const ConfiguratorStep = () => (
  <ConfiguratorLayout title="Configurator">
    <Configurator />
  </ConfiguratorLayout>
);
