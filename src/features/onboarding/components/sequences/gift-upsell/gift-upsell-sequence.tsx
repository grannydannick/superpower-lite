import { CheckIcon } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import { useOnboardingNavigation } from '@/features/onboarding/hooks/use-onboarding-navigation';
import { useOnboardingFlowStore } from '@/features/onboarding/stores/onboarding-flow-store';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';
import { buildGiftCheckoutUrl } from '@/utils/gifting-routing';

const BENEFITS = [
  'Detect early signs of 1,000+ conditions',
  'A clear plan to improve their health',
  '24/7 concierge whenever they need it',
] as const;

export const GiftUpsellSequence = () => {
  const { next } = useOnboardingNavigation();
  const { dismissGiftUpsell, beginExternalRedirect } = useOnboardingFlowStore(
    useShallow((state) => ({
      dismissGiftUpsell: state.dismissGiftUpsell,
      beginExternalRedirect: state.beginExternalRedirect,
    })),
  );
  const { data: user } = useUser();
  const { track } = useAnalytics();

  const handleMaybeLater = () => {
    track('gifting_upsell_dismissed', { source: 'onboarding' });
    dismissGiftUpsell();
    next();
  };

  const handleGiftSuperpower = () => {
    track('gifting_upsell_clicked', { source: 'onboarding' });
    // beginExternalRedirect causes StepRenderer to render null, preventing any
    // flash of the next onboarding step while the browser navigates away.
    beginExternalRedirect();
    dismissGiftUpsell();
    next();
    window.location.assign(buildGiftCheckoutUrl('onboarding', user?.email));
  };

  return (
    <>
      <Head title="Gift Superpower" />
      <main className="theme-product flex min-h-screen flex-col bg-zinc-50">
        <div className="flex items-center justify-start px-4 py-6">
          <a href="https://superpower.com">
            <SuperpowerLogo className="h-4" />
          </a>
        </div>

        <div className="flex flex-1 flex-col items-center px-4 pb-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <H2 className="text-balance">
                Give them what you just gave yourself
              </H2>
              <Body1 className="text-zinc-500">
                Gift a parent, partner or friend 100+ health insights and a
                dedicated care team in their pocket.
              </Body1>
            </div>

            <div className="h-80 w-full [mask-image:radial-gradient(ellipse_80%_65%_at_50%_38%,black_40%,transparent_75%)]">
              <img
                src="/onboarding/upsell/gifting/family.webp"
                alt="Family"
                className="h-full w-full object-cover object-top"
                loading="eager"
              />
            </div>

            <div className="flex flex-col gap-3 rounded-[20px] border border-border bg-white py-4 pl-3 pr-4 shadow-[0px_0px_1px_0px_rgba(0,0,0,0.33),0px_24px_24px_-12px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-2">
                <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
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

              <ul className="flex flex-col gap-1 pl-2 text-secondary">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2">
                    <CheckIcon
                      className="size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span className="type-body-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
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
