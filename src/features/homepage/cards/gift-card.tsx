import { m } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

import { Body1, Body2 } from '@/components/ui/typography';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';
import { buildGiftCheckoutUrl } from '@/utils/gifting-routing';

export const GiftCard: React.FC = () => {
  const { data: user } = useUser();
  const { track } = useAnalytics();

  const handleGiftSuperpower = () => {
    track('gifting_upsell_clicked', { source: 'app' });
    window.open(
      buildGiftCheckoutUrl('app', user?.email),
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-3xl">
      <button
        type="button"
        onClick={handleGiftSuperpower}
        className="relative flex w-full items-center justify-between bg-zinc-900 pr-6 text-left"
      >
        <div
          className="absolute -left-4 top-0 h-full w-56 overflow-hidden md:w-72"
          style={{
            WebkitMaskImage:
              'linear-gradient(to right, black 50%, transparent 65%)',
            maskImage: 'linear-gradient(to right, black 50%, transparent 65%)',
          }}
        >
          <m.img
            src="/onboarding/upsell/gifting/family.webp"
            alt="Gift a Superpower membership"
            className="pointer-events-none size-full select-none object-cover"
            style={{ objectPosition: 'center -70px' }}
            loading="lazy"
            decoding="async"
            initial={{ y: 12 }}
            animate={{ y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 220,
              damping: 20,
              mass: 0.9,
            }}
          />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-20 lg:w-28 xl:w-36" />
          <div className="md:py-6">
            <Body2 className="line-clamp-1 text-zinc-400">
              Give the gift of health.
            </Body2>
            <Body1 className="hidden text-white md:block">
              Gift Superpower Membership
            </Body1>
            <Body1 className="block text-white md:hidden">
              Gift a Membership
            </Body1>
          </div>
        </div>
        <ChevronRight className="size-5 shrink-0 text-white transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
};
