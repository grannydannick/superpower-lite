import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { StripeElementStyle, StripeError } from '@stripe/stripe-js';
import { FormEvent, useState } from 'react';

import { ConsentInfo } from '@/components/shared/consent-info';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Body3, H2 } from '@/components/ui/typography';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import {
  useAddPaymentMethod,
  useCreateSubscription,
} from '@/features/settings/api';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';

// TODO: bring into reusable components
const STRIPE_INPUT_STYLE: { style: StripeElementStyle } = {
  style: {
    base: {
      color: '#52525B',
      fontSize: '16px',
      '::placeholder': {
        color: '#A1A1AA',
      },
      '::selection': { color: 'white', backgroundColor: '#FDBA74' },
    },
    invalid: {
      color: '#B90090',
    },
  },
};

enum ERROR_TYPES {
  CVC = 'incomplete_cvc',
  EXPIRY = 'incomplete_expiry',
  NUMBER = 'incomplete_number',
}

export const SectionBilling = () => {
  const elements = useElements();
  const stripe = useStripe();
  const { data: user } = useUser();
  const [error, setError] = useState<StripeError | undefined>(undefined);
  const addPaymentMethodMutation = useAddPaymentMethod();
  const createSubscriptionMutation = useCreateSubscription();
  const setProcessing = useOnboarding((s) => s.setProcessing);
  const processing = useOnboarding((s) => s.processing);
  const consentGiven = useOnboarding((s) => s.consentGiven);
  const setConsentGiven = useOnboarding((s) => s.setConsentGiven);
  const nextOnboardingStep = useStepper((s) => s.nextOnboardingStep);

  const handleSubmit = async (event: FormEvent) => {
    if (!user) return;
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

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
        setError(error);
        setProcessing(false);

        return;
      }

      const { success } = await addPaymentMethodMutation.mutateAsync({
        data: { paymentMethodId: paymentMethod.id },
      });

      if (!success) {
        setProcessing(false);
        return;
      }

      await createSubscriptionMutation.mutateAsync({
        data: {
          code: localStorage.getItem('superpower-code') ?? undefined,
          referralId: (window as any)?.Rewardful?.referral,
        },
      });

      await nextOnboardingStep(user.onboarding.id);
    } catch (e) {
      setProcessing(false);
      return;
    }
  };

  return (
    <div className="space-y-8">
      <H2 className="text-zinc-900">Payment</H2>
      <form onSubmit={handleSubmit} className="grid gap-8" id="billingForm">
        <div className="space-y-2">
          <Label
            htmlFor="cardNumber"
            className={cn(
              'text-sm text-zinc-500',
              error?.code === ERROR_TYPES.NUMBER ? 'text-pink-700' : null,
            )}
          >
            Card number
          </Label>
          <CardNumberElement
            id="cardNumber"
            options={{
              disableLink: true,
              disabled: processing,
              ...STRIPE_INPUT_STYLE,
            }}
            onFocus={() => setError(undefined)}
            className={cn(
              'rounded-xl border border-input bg-white px-6 py-4 text-base text-foreground',
              processing ? 'opacity-50' : null,
              error?.code === ERROR_TYPES.NUMBER
                ? 'border-pink-700 bg-pink-50 text-pink-700 placeholder:text-pink-700'
                : null,
            )}
          />
          {error?.code === ERROR_TYPES.NUMBER ? (
            <Body3 className="text-pink-700">{error?.message}</Body3>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="cardExpiration"
              className={cn(
                'text-sm text-zinc-500',
                error?.code === ERROR_TYPES.EXPIRY ? 'text-pink-700' : null,
              )}
            >
              Expiration date
            </Label>
            <CardExpiryElement
              options={{
                disabled: processing,
                ...STRIPE_INPUT_STYLE,
              }}
              onFocus={() => setError(undefined)}
              id="cardExpiration"
              className={cn(
                'rounded-xl border border-input bg-white px-6 py-4 text-base text-foreground',
                processing ? 'opacity-50' : null,
                error?.code === ERROR_TYPES.EXPIRY
                  ? 'border-pink-700 bg-pink-50 text-pink-700 placeholder:text-pink-700'
                  : null,
              )}
            />
            {error?.code === ERROR_TYPES.EXPIRY ? (
              <Body3 className="text-pink-700">{error?.message}</Body3>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="cardCvc"
              className={cn(
                'text-sm text-zinc-500',
                error?.code === ERROR_TYPES.CVC ? 'text-pink-700' : null,
              )}
            >
              CVC
            </Label>
            <CardCvcElement
              options={{
                disabled: processing,
                ...STRIPE_INPUT_STYLE,
              }}
              onFocus={() => setError(undefined)}
              id="cardCvc"
              className={cn(
                'rounded-xl border border-input bg-white px-6 py-4 text-base text-foreground',
                processing ? 'opacity-50' : null,
                error?.code === ERROR_TYPES.CVC
                  ? 'border-pink-700 bg-pink-50 text-pink-700 placeholder:text-pink-700'
                  : null,
              )}
            />
            {error?.code === ERROR_TYPES.CVC ? (
              <Body3 className="text-pink-700">{error?.message}</Body3>
            ) : null}
          </div>
        </div>
      </form>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          disabled={processing}
          checked={consentGiven}
          onCheckedChange={(checked: boolean) => setConsentGiven(checked)}
        />

        <ConsentInfo htmlFor="terms" />
      </div>
    </div>
  );
};
