import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SplitScreenLayout } from '@/components/layouts';
import { AtHomeNoticeSection } from '@/components/shared/at-home-notice-section';
import { ConsentInfo } from '@/components/shared/consent-info';
import { PaymentDetails } from '@/components/shared/payment-details';
import { StripeCardElement } from '@/components/shared/stripe-card-element';
import { StripeExpressCheckoutElement } from '@/components/shared/stripe-express-checkout-element';
import { Button } from '@/components/ui/button';
import { AnimatedCheckbox } from '@/components/ui/checkbox';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2, H3 } from '@/components/ui/typography';
import { COLLECTION_METHODS } from '@/const';
import {
  AtHomeDrawCreditSection,
  BaselineSummary,
} from '@/features/auth/components/configurator';
import {
  CouponCodeBtn,
  PurchaseMembershipInfoSection,
  VerifyCouponCodeSection,
} from '@/features/auth/components/configurator/sections';
import { useCheckout } from '@/features/auth/hooks/use-checkout';
import { useCheckoutContext } from '@/features/auth/stores';
import { useAvailableSubscriptions } from '@/features/settings/api';
import { useTask } from '@/features/tasks/api/get-task';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { getState } from '@/utils/verify-state-from-postal';

/**
 * note: this component is basically created to support 9000 users who were in
 * onboarding step 0 before we moved checkout into registration
 *
 * you should not touch or delete it because we have users with onboarding step 0
 * who are not subscribed and we need to handle them
 */
export const LegacyCheckoutRoute = () => {
  const navigate = useNavigate();
  const updateMembership = useCheckoutContext((s) => s.updateMembership);
  const coupon = useCheckoutContext((s) => s.coupon);

  const { data: user } = useUser();
  const onboardingTask = useTask({
    taskName: 'onboarding',
  });
  const availableSubscriptionsQuery = useAvailableSubscriptions({
    coupon: coupon ?? undefined,
    state: getState(user?.primaryAddress?.postalCode ?? '')?.state,
    queryConfig: {
      enabled: !!user?.primaryAddress?.postalCode,
    },
  });

  const availableSubscriptions = availableSubscriptionsQuery.data ?? [];

  // preload subscription
  useEffect(() => {
    if (availableSubscriptions.length > 0) {
      updateMembership(availableSubscriptions[0]);
    } else {
      updateMembership(null);
    }
  }, [availableSubscriptions]);

  // safety check so subscribed users won't accidentally access this legacy page
  useEffect(() => {
    if (!user) return;

    if (user.subscribed) navigate('/');
  }, [user, navigate]);

  // safety check if onboarding task already completed then they should not see it
  useEffect(() => {
    if (!onboardingTask.data) return;

    if (onboardingTask.data.task.status === 'completed') {
      navigate('/', {
        replace: true,
      });
    }
  }, [onboardingTask.data, navigate]);

  // all legacy users should have primary address
  if (!user?.primaryAddress?.postalCode)
    return (
      <Body1 className="text-pink-700">
        No primary address found for legacy user. Please contact support:
        concierge@superpower.com
      </Body1>
    );

  return (
    <SplitScreenLayout title="Checkout" className="bg-zinc-50">
      <>
        <BillingInfo postalCode={user.primaryAddress.postalCode} />
        <BaselineSummary postalCode={user.primaryAddress.postalCode} />
      </>
    </SplitScreenLayout>
  );
};

export const BillingInfo = ({ postalCode }: { postalCode: string }) => {
  const { membership, processing, couponMetadata } = useCheckoutContext();
  const [expressAvailable, setExpressAvailable] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const atHomeDrawCredit =
    couponMetadata?.blood_draw_method === COLLECTION_METHODS.AT_HOME.value;

  const {
    handleCardNumberPayment,
    handleDigitalWalletPayment,
    stripeError,
    setStripeError,
    isMutationPending,
  } = useCheckout({ postalCode });

  return (
    <div className="space-y-8 px-4 md:px-8">
      <AtHomeNoticeSection
        postalCode={postalCode}
        atHomeDrawCredit={atHomeDrawCredit}
        className="lg:hidden"
      />
      <PurchaseMembershipInfoSection />
      <AtHomeDrawCreditSection />
      <div className="space-y-4">
        {expressAvailable ? <H3 className="text-primary">Payment</H3> : null}
        <StripeExpressCheckoutElement
          onConfirm={(event) => handleDigitalWalletPayment(event)}
          membershipAmountInCents={membership?.total}
          processing={processing || isMutationPending}
          onAvailabilityChange={setExpressAvailable}
        />
        {expressAvailable ? (
          <div className="flex items-center">
            <div className="h-px flex-1 bg-zinc-200" />
            <Body1 className="mx-4 text-center text-base text-zinc-500">
              or pay by card
            </Body1>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>
        ) : null}
        <PaymentDetails />
        <StripeCardElement
          processing={processing || isMutationPending}
          error={stripeError}
          setError={setStripeError}
        />
        <CouponCodeBtn />
        <VerifyCouponCodeSection />
      </div>
      <div className="space-y-2">
        <div className="group flex items-start space-x-2">
          <div
            className={cn(
              'flex aspect-square size-5 items-center justify-center rounded-md border transition-all duration-150',
              consentGiven
                ? 'border-zinc-900 bg-black'
                : 'border-zinc-200 group-hover:border-zinc-300 group-hover:bg-zinc-100',
            )}
          >
            <AnimatedCheckbox
              id="terms"
              className="data-[state=checked]:text-white"
              variant="default"
              checked={consentGiven}
              onCheckedChange={(status) => setConsentGiven(status as boolean)}
              disabled={processing}
            />
          </div>

          <ConsentInfo htmlFor="terms" />
        </div>
        <Button
          className="w-full rounded-xl border border-zinc-500 bg-black px-6 py-4"
          disabled={processing || isMutationPending || !consentGiven}
          type="button"
          onClick={() => handleCardNumberPayment()}
        >
          {processing || isMutationPending ? (
            <TransactionSpinner className="flex justify-center" />
          ) : (
            'Purchase'
          )}
        </Button>

        <Body2 className="text-zinc-400">
          By purchasing this subscription, you agree that your membership will
          automatically renew at the end of each term for the same duration and
          at the then-current rate, unless you cancel in accordance with the
          Membership Agreement. You authorize Superpower to charge your payment
          method for the initial term and any subsequent renewal terms unless
          canceled. To cancel, email{' '}
          <a href="mailto:concierge@superpower.com">concierge@superpower.com</a>{' '}
          or log into your account and follow the cancellation instructions. No
          refunds are provided for the remainder of the subscription term after
          cancellation. For full details, please refer to your Membership
          Agreement.
        </Body2>
      </div>
    </div>
  );
};
