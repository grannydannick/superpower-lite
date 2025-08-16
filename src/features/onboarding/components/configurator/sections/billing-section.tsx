import {
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import {
  StripeError,
  StripeExpressCheckoutElementConfirmEvent,
} from '@stripe/stripe-js';
import { FormEvent, useState } from 'react';

import { ConsentInfo } from '@/components/shared/consent-info';
import { PaymentDetails } from '@/components/shared/payment-details';
import { StripeCardForm } from '@/components/shared/stripe-card-form';
import { Button } from '@/components/ui/button';
import { AnimatedCheckbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/sonner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2, H3 } from '@/components/ui/typography';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import {
  useAddPaymentMethod,
  useCreateSetupIntent,
  useCreateSubscription,
  useSetDefaultPaymentMethod,
} from '@/features/settings/api';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';
import { getAccessCode } from '@/utils/access-code';
import { trackSubscription } from '@/utils/gtm';
import { getUtmData } from '@/utils/utm-middleware';

import { DigitalWalletSection } from './digital-wallet-section';

export const BillingSection = () => {
  const elements = useElements();
  const stripe = useStripe();
  const { data: user } = useUser();
  const [error, setError] = useState<StripeError | undefined>(undefined);
  const addPaymentMethodMutation = useAddPaymentMethod();
  const createSubscriptionMutation = useCreateSubscription();
  const setupIntentMutation = useCreateSetupIntent();
  const setDefaultPaymentMethodMutation = useSetDefaultPaymentMethod();
  const { activeStep, nextStep } = useStepper((s) => s);
  const { mutateAsync: updateTaskProgress } = useUpdateTask();
  const { track } = useAnalytics();

  const {
    membership,
    setProcessing,
    processing,
    showAccessCode,
    setShowAccessCode,
    consentGiven,
    setConsentGiven,
  } = useOnboarding();

  const createSubscription = async (paymentMethod: string) => {
    try {
      const subscription = await createSubscriptionMutation.mutateAsync({
        data: {
          code: getAccessCode() ?? undefined,
          referralId: (window as any)?.Rewardful?.referral,
          campaignData: getUtmData() ?? undefined,
        },
      });

      if (subscription) {
        try {
          track('subscription_created', {
            access_code: getAccessCode(),
            referral_id: (window as any)?.Rewardful?.referral,
            currency: 'USD',
            value: membership?.total,
            payment_method: paymentMethod,
          });
          trackSubscription(membership?.total, paymentMethod);
        } catch (e) {
          console.error('Failed to track subscription:', e);
        }

        await updateTaskProgress({
          taskName: 'onboarding',
          data: { progress: activeStep + 1 },
        });
        nextStep();
      }
    } catch (e) {
      console.error(e);
      toast.error((e as StripeError)?.message ?? 'An error occurred');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    // If any of the following are null, or if we're in the middle of processing, do not proceed with submission
    if (!user || !stripe || !elements || !membership || processing) return;

    const cardNumber = elements.getElement(CardNumberElement);

    if (!cardNumber) {
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumber,
      });

      if (error) {
        throw new Error(`Failed adding payment method: ${error.message}`);
      }

      const { success } = await addPaymentMethodMutation.mutateAsync({
        data: { paymentMethodId: paymentMethod.id },
      });

      if (!success) {
        throw new Error('Failed adding payment method');
      }

      await createSubscription('card');
    } catch (e) {
      console.error(e);
      toast.error((e as StripeError)?.message ?? 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const handleDigitalWalletPayment = async (
    event: StripeExpressCheckoutElementConfirmEvent,
  ) => {
    // If any of the following are null, or if we're in the middle of processing, do not proceed with submission
    if (!user || !stripe || !elements || !membership || processing) return;

    setProcessing(true);

    try {
      const { error: submitError } = await elements.submit();

      if (submitError) {
        throw submitError;
      }

      const { client_secret } =
        await setupIntentMutation.mutateAsync(undefined);

      const { error: confirmSetupError, setupIntent } =
        await stripe.confirmSetup({
          elements,
          clientSecret: client_secret,
          confirmParams: {
            return_url: `${window.location.origin}`,
          },
          redirect: 'if_required',
        });

      const isValidSetupIntent =
        setupIntent?.status === 'succeeded' ||
        setupIntent?.status === 'processing';

      if (confirmSetupError || !isValidSetupIntent) {
        throw confirmSetupError;
      }

      const paymentMethod = setupIntent?.payment_method as string;

      if (!paymentMethod) {
        throw new Error('No payment method found in setup intent');
      }

      await setDefaultPaymentMethodMutation.mutateAsync({
        data: { setDefault: true },
        paymentMethodId: paymentMethod,
      });

      await createSubscription(event.expressPaymentType);
    } catch (e) {
      setError(e as StripeError);
      toast.error((e as StripeError)?.message ?? 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <H3 className="text-primary">Purchase Membership</H3>
        <Body1 className="text-zinc-500">
          Your membership auto-renews each year. Cancel anytime. HSA/FSA
          eligible.
        </Body1>
      </div>
      <div className="space-y-4">
        {membership ? (
          <DigitalWalletSection
            onConfirm={handleDigitalWalletPayment}
            membershipAmountInCents={membership?.total}
            processing={processing}
          />
        ) : null}
        <PaymentDetails />
        <StripeCardForm
          processing={processing}
          onSubmit={handleSubmit}
          error={error}
          setError={setError}
          id="billingForm"
        />
        {!showAccessCode ? (
          <Button
            variant="link"
            size="small"
            className="p-0 text-base text-zinc-500"
            onClick={() => setShowAccessCode(true)}
            disabled={processing}
          >
            Have an access code?
          </Button>
        ) : null}
      </div>

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
            checked={consentGiven}
            onCheckedChange={(checked: boolean) => setConsentGiven(checked)}
            disabled={processing}
          />
        </div>

        <ConsentInfo htmlFor="terms" />
      </div>
      <div className="space-y-2">
        <Button
          className="w-full rounded-xl border border-zinc-500 bg-black px-6 py-4"
          disabled={processing || !consentGiven}
          type="submit"
          form="billingForm"
          onClick={async (e) => {
            e.stopPropagation();
          }}
        >
          {processing ? (
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
          canceled. To cancel, email concierge@superpower.com or log into your
          account and follow the cancellation instructions. No refunds are
          provided for the remainder of the subscription term after
          cancellation. For full details, please refer to your Membership
          Agreement.
        </Body2>
      </div>
    </div>
  );
};
