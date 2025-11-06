import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { HSAFSACheckoutButton } from '@/components/shared/hsa-fsa-checkout-button';
import { StripeCardElement } from '@/components/shared/stripe-card-element';
import { StripeExpressCheckoutElement } from '@/components/shared/stripe-express-checkout-element';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2, H3 } from '@/components/ui/typography';
import { useCheckout } from '@/features/auth/hooks/use-checkout';
import { useCheckoutContext } from '@/features/auth/stores';
import { PaymentDetails } from '@/features/users/components/payment/payment-details';
import { RegisterInput } from '@/lib/auth';
import { getAccessCode } from '@/utils/access-code';
import { getState } from '@/utils/verify-state-from-postal';

import { VerifyCouponCodeSection } from './verify-coupon-code-section';

export const BillingSection = () => {
  const form = useFormContext<RegisterInput>();
  const { membership, processing } = useCheckoutContext();
  const [expressAvailable, setExpressAvailable] = useState(false);
  const formValues = form.watch();

  const {
    handleCardNumberPayment,
    handleDigitalWalletPayment,
    handleHSAFSAPayment,
    stripeError,
    setStripeError,
    isMutationPending,
  } = useCheckout({ postalCode: formValues.postalCode });

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {expressAvailable ? <H3 className="text-primary">Payment</H3> : null}
        <StripeExpressCheckoutElement
          onClick={async (event) => {
            const isValid = await form.trigger(undefined, {
              shouldFocus: true,
            });
            if (isValid) {
              event.resolve();
            } else {
              toast.error(
                'Cannot launch Apple/Google Pay before completing all fields',
              );
            }
          }}
          onConfirm={(event) =>
            form.handleSubmit((data) =>
              handleDigitalWalletPayment(event, data),
            )()
          }
          membershipAmountInCents={membership?.total}
          processing={processing || isMutationPending}
          onAvailabilityChange={setExpressAvailable}
        />
        <HSAFSACheckoutButton
          onClick={async (event) => {
            const isValid = await form.trigger(undefined, {
              shouldFocus: true,
            });
            if (isValid) {
              event.resolve();
            } else {
              toast.error('Please complete all required fields.');
            }
          }}
          onPaymentSuccess={(paymentData) =>
            form.handleSubmit((data) =>
              handleHSAFSAPayment(paymentData, data),
            )()
          }
          disabled={processing || isMutationPending}
          state={getState(formValues.postalCode)?.state ?? 'CA'}
          coupon={getAccessCode() || undefined}
          email={formValues.email}
          phone={formValues.phone}
        />
        <div className="flex items-center">
          <div className="h-px flex-1 bg-zinc-200" />
          <Body1 className="mx-4 text-center text-base text-zinc-500">
            or pay by card
          </Body1>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>
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
        <Button
          className="w-full rounded-xl border border-zinc-500 bg-black px-6 py-4"
          disabled={processing || isMutationPending}
          type="button"
          onClick={form.handleSubmit(handleCardNumberPayment)}
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

export const CouponCodeBtn = () => {
  const { showCoupon, processing, setShowCoupon } = useCheckoutContext();

  return !showCoupon ? (
    <Button
      variant="link"
      size="small"
      className="p-0 text-base text-zinc-500"
      onClick={() => setShowCoupon(true)}
      disabled={processing}
    >
      Have an access code?
    </Button>
  ) : null;
};
