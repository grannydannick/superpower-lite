import { CheckIcon } from 'lucide-react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Body1, H2 } from '@/components/ui/typography';
import { useOnboardingNavigation } from '@/features/onboarding/hooks/use-onboarding-navigation';
import { setOnboardingProgress } from '@/features/onboarding/stores/onboarding-progress-store';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';
import { buildGiftCheckoutUrl } from '@/utils/gifting-routing';

import { DomeImage } from '../../shared/dome-image';

const BENEFITS = [
  'Detect early signs of 1,000+ conditions',
  'A clear plan to improve their health',
  '24/7 concierge whenever they need it',
] as const;

export const GiftUpsellSequence = () => {
  const { next } = useOnboardingNavigation();
  const { data: user } = useUser();
  const { track } = useAnalytics();

  const handleMaybeLater = () => {
    track('gifting_upsell_dismissed', { source: 'onboarding' });
    if (user != null) setOnboardingProgress(user.id, 'hasSeenGiftUpsell', true);
    next();
  };

  const handleGiftSuperpower = () => {
    track('gifting_upsell_clicked', { source: 'onboarding' });
    // Defer the store mutation until the browser is unloading. Flipping
    // hasSeenGiftUpsell synchronously would cause OnboardingFlow to re-evaluate
    // validSteps and Navigate to the next step, briefly flashing it before the
    // external redirect completes. Persist on pagehide so the rehydrated value
    // skips this step when the user returns.
    if (user != null) {
      window.addEventListener(
        'pagehide',
        () => setOnboardingProgress(user.id, 'hasSeenGiftUpsell', true),
        { once: true },
      );
    }
    window.location.assign(buildGiftCheckoutUrl('onboarding', user?.email));
  };

  return (
    <>
      <Head title="Gift Superpower" />
      <main className="theme-product relative flex min-h-screen flex-col bg-zinc-50">
        <div className="flex items-center justify-start px-4 py-6">
          <a href="https://superpower.com" className="hidden md:block">
            <SuperpowerLogo className="h-4" />
          </a>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-between overflow-x-hidden px-4 pb-8 md:justify-center md:pb-12">
          <div className="relative flex w-full max-w-md flex-1 flex-col justify-between gap-12 md:justify-center">
            <div></div>

            <div className="pb-12">
              <div className="flex flex-col items-center gap-2 text-center">
                <H2 className="text-pretty">
                  Give them what you just gave yourself
                </H2>
                <Body1 className="text-pretty text-zinc-500">
                  Gift a parent, partner or friend 100+ health insights and a
                  dedicated care team in their pocket.
                </Body1>
              </div>
              <DomeImage
                src="/onboarding/upsell/gifting/family.webp"
                alt="Family"
                loading="eager"
              />

              <Card className="relative z-10 mx-auto -mt-12 w-full max-w-sm shadow-xl shadow-black/5 ring-1 ring-black/5">
                <CardContent className="flex flex-col gap-3 p-0 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="size-12 shrink-0 overflow-hidden">
                      <img
                        src="/onboarding/upsell/gifting/baseline-tube.webp"
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-3 pr-2">
                      <span className="type-body-lg text-primary">
                        Membership Gift
                      </span>
                      <span className="type-body-lg text-primary">$199</span>
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  <ul className="flex flex-col gap-1 pl-1 text-secondary">
                    {BENEFITS.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2">
                        <CheckIcon
                          className="size-4 shrink-0 text-tertiary"
                          aria-hidden="true"
                        />
                        <span className="type-body-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleGiftSuperpower}
                variant="default"
                className="h-14 w-full rounded-xl text-base"
              >
                Gift Superpower
              </Button>
              <Button
                onClick={handleMaybeLater}
                variant="ghost"
                className="h-14 w-full rounded-xl text-base text-secondary hover:text-primary"
              >
                Maybe later
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
