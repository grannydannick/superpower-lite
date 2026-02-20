import { Check, CheckCircle, X } from 'lucide-react';
import React from 'react';
import { Navigate, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { ChevronLeft } from '@/components/icons/chevron-left-icon';
import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, Body3, H2, H4 } from '@/components/ui/typography';
import {
  useLatestProtocol,
  useRevealLatest,
  type Activity,
  type Goal,
  useCompleteReveal,
  useCreateAutopilotCheckout,
} from '@/features/protocol/api';
import { ReadonlyItemCard } from '@/features/protocol/components/checkout/readonly-item-card';
import { CheckoutLayout } from '@/features/protocol/components/layouts/checkout-layout';
import { REVEAL_STEPS } from '@/features/protocol/components/reveal/reveal-stepper';
import { getActivityPricing } from '@/features/protocol/utils/get-activity-pricing';
import { useAnalytics } from '@/hooks/use-analytics';
import { formatMoney } from '@/utils/format-money';

const BENEFITS = [
  {
    image: '/action-plan/pill.webp',
    title: 'Personalized Monthly Protocol',
    description:
      'Everything your body needs this month, delivered at the exact cadence based on your biomarkers.',
    cycle: 'Delivered monthly',
  },
  {
    image: '/action-plan/test-tube.webp',
    title: 'Curated Follow-Up Testing',
    description:
      'Your diagnostic panels are split into a monthly cost (e.g., $29/mo, $19/mo). We test only the markers that matter for your biology.',
    cycle: '2x a Year',
  },
];

/**
 * Standalone autopilot page for fake door experiment.
 * Path: /protocol/autopilot
 *
 * This is NOT part of the reveal stepper flow - it's a separate page
 * that users reach by clicking "Learn more" on the AutopilotCard.
 */
export const ProtocolAutopilotRoute = () => {
  const navigate = useNavigate();
  const { data: revealData, isLoading: revealLoading } = useRevealLatest();
  const { data: protocol, isLoading: protocolLoading } = useLatestProtocol();

  const carePlanId = revealData?.carePlanId;
  const isLoading = revealLoading || protocolLoading;

  if (isLoading) {
    return (
      <>
        <Head title="Superpower Autopilot" />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner variant="primary" />
        </div>
      </>
    );
  }

  // No carePlanId means no protocol available
  if (!carePlanId || !protocol) {
    return <Navigate to="/protocol" replace />;
  }

  // Navigate back to order-summary step in reveal flow
  const handleBack = () => {
    navigate('/protocol/reveal/order-summary');
  };

  const handleCheckoutError = () => {
    toast.error('Unable to checkout. Please try again or contact support.');
  };

  return (
    <AutopilotView
      carePlanId={carePlanId}
      activities={protocol.activities}
      autopilotPrice={protocol.autopilotPrice}
      previous={handleBack}
      onCheckoutError={handleCheckoutError}
    />
  );
};

type AutopilotViewProps = {
  carePlanId: string;
  goals?: Goal[];
  activities?: Activity[];
  autopilotPrice?: number | null; // Monthly price in dollars from backend
  previous: () => void;
  onCheckoutError: () => void;
};

export function AutopilotView({
  carePlanId,
  activities,
  autopilotPrice,
  previous,
  onCheckoutError,
}: AutopilotViewProps) {
  const createCheckout = useCreateAutopilotCheckout();
  const completeReveal = useCompleteReveal();
  const { track } = useAnalytics();

  const productItems = React.useMemo(
    () => (activities ?? []).filter((a) => a.type === 'product'),
    [activities],
  );

  const serviceItems = React.useMemo(
    () => (activities ?? []).filter((a) => a.type === 'service'),
    [activities],
  );

  // Calculate total one-time cost (products + services) in cents
  const oneTimeTotalCents = React.useMemo(() => {
    let total = 0;

    // Add products (getActivityPricing returns cents)
    for (const activity of productItems) {
      const { originalCents } = getActivityPricing(activity, null);
      total += originalCents;
    }

    // Add services (service.price is already in cents)
    for (const activity of serviceItems) {
      if (activity.type === 'service') {
        total += activity.service.price;
      }
    }

    return total;
  }, [productItems, serviceItems]);

  // Convert backend autopilotPrice (dollars) to cents for display
  const monthlyPriceCents = autopilotPrice
    ? Math.round(autopilotPrice * 100)
    : 0;

  const handleSubscribe = async () => {
    const returnUrl = `${window.location.origin}/protocol`;

    track('protocol_reveal_autopilot_subscription_checkout_clicked');

    try {
      const result = await createCheckout.mutateAsync({
        carePlanId,
        returnUrl,
      });

      // Mark protocol reveal as completed
      await completeReveal.mutateAsync(carePlanId);

      // Replace current page with Stripe checkout
      window.location.href = result.checkoutUrl;
    } catch {
      onCheckoutError();
    }
  };

  return (
    <CheckoutLayout step={REVEAL_STEPS.AUTOPILOT}>
      <div className="mb-8 h-auto flex-1 space-y-4 rounded-3xl bg-white p-4 lg:sticky lg:top-20 lg:mb-0 lg:border lg:p-8">
        <Body1 className="text-secondary">What&apos;s included</Body1>
        <img
          className="mx-auto w-full max-w-xs"
          src="/action-plan/autopilot.webp"
          alt="Multiple tests in one view"
        />
        {BENEFITS.map((benefit, index) => {
          return (
            <div
              key={index}
              className="flex w-full items-center justify-between gap-4 rounded-2xl border border-zinc-200 p-5 shadow-sm shadow-black/[.03]"
            >
              <div className="flex items-center gap-2">
                <img
                  src={benefit.image}
                  alt={benefit.title}
                  className="size-16 shrink-0 rounded-xl object-cover"
                />
                <div className="space-y-0.5">
                  <Body2>{benefit.title}</Body2>
                  <Body2 className="text-balance text-secondary">
                    {benefit.description}
                  </Body2>
                </div>
              </div>
              <Body2 className="w-16 shrink-0">{benefit.cycle}</Body2>
            </div>
          );
        })}
        <div className="mt-2 pt-4">
          <div className="flex items-start justify-between">
            <Body1 className="text-secondary">Total</Body1>
            <div className="flex items-center gap-6">
              <div className="space-y-0.5">
                <H4 className="leading-none text-secondary line-through">
                  {formatMoney(oneTimeTotalCents)}
                </H4>
                <Body3 className="text-secondary">once</Body3>
              </div>
              <div className="space-y-0.5">
                <H4 className="leading-none">
                  {formatMoney(monthlyPriceCents)}
                </H4>
                <Body3 className="text-secondary">a month</Body3>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[680px] space-y-8 px-6 pb-16">
        <div className="flex justify-between gap-4">
          <Button
            variant="ghost"
            className="group -ml-1.5 flex items-center gap-0.5 p-0"
            onClick={() => {
              previous();
            }}
          >
            <ChevronLeft className="-mt-px w-[15px] text-zinc-400 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:text-zinc-600" />
            <Body2 className="text-zinc-500 transition-all duration-150 group-hover:text-zinc-700">
              Back
            </Body2>
          </Button>
          <SuperpowerLogo className="w-28" />
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <H2>Superpower Autopilot</H2>
            <Body1 className="text-secondary">
              A system that can take better care of your health than you could.
              Your health, set to auto-update.
            </Body1>
          </div>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Check className="mt-1 size-4 text-secondary" />
              <Body1 className="text-secondary">
                Never think about what to take again. <br /> We handle every
                refill, dose, and adjustment.
              </Body1>
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-1 size-4 text-secondary" />
              <Body1 className="text-secondary">
                Your plan updates as your body changes. <br /> Every follow-up
                test automatically rebuilds your protocol.
              </Body1>
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-1 size-4 text-secondary" />
              <Body1 className="text-secondary">
                Stay confident you’re doing the right things. <br /> We do the
                thinking, tracking, and recommendations for you.
              </Body1>
            </li>
          </ul>
          <div className="space-y-4">
            <Button
              className="w-full py-4"
              onClick={handleSubscribe}
              disabled={createCheckout.isPending}
            >
              {createCheckout.isPending ? 'Loading...' : 'Upgrade now'}
            </Button>
            <div className="flex flex-wrap items-center gap-3 lg:gap-5">
              <div className="flex items-center gap-2">
                <Check className="size-4 text-secondary" />
                <Body2 className="text-secondary">Cancel anytime</Body2>
              </div>
              <div className="flex items-center gap-2">
                <X className="size-4 text-secondary" />
                <Body2 className="text-secondary">No hidden fees</Body2>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-secondary" />
                <Body2 className="text-secondary">HSA/FSA eligible</Body2>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">This month’s protocol</h2>
          <div className="space-y-3">
            {productItems.map((activity, idx) => (
              <ReadonlyItemCard
                key={`non-service-${idx}`}
                activity={activity}
              />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Diagnostics in 6 months</h2>
          <div className="space-y-3">
            {serviceItems.map((activity, idx) => (
              <ReadonlyItemCard key={`service-${idx}`} activity={activity} />
            ))}
          </div>
        </div>
      </div>
    </CheckoutLayout>
  );
}
