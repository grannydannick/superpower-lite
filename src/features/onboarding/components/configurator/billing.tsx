import {
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { StripeError } from '@stripe/stripe-js';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

import { ConsentInfo } from '@/components/shared/consent-info';
import { StripeCardForm } from '@/components/shared/stripe-card-form';
import { Checkbox } from '@/components/ui/checkbox';
import { H2 } from '@/components/ui/typography';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import {
  useAddPaymentMethod,
  useAvailableSubscriptions,
  useCreateSubscription,
} from '@/features/settings/api';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';

import { trackSubscription } from '../../utils/gtm';

export const SectionBilling = () => {
  const elements = useElements();
  const stripe = useStripe();
  const { data: user } = useUser();
  const [error, setError] = useState<StripeError | undefined>(undefined);
  const addPaymentMethodMutation = useAddPaymentMethod();
  const createSubscriptionMutation = useCreateSubscription();
  const nextOnboardingStep = useStepper((s) => s.nextOnboardingStep);

  const {
    membershipType,
    consentGiven,
    setProcessing,
    processing,
    setConsentGiven,
  } = useOnboarding();

  const availableSubscriptionsQuery = useAvailableSubscriptions();

  const selectedSubscription = availableSubscriptionsQuery.data?.find(
    (as) => as.type === membershipType,
  );

  const handleSubmit = async (event: FormEvent) => {
    if (!user) return;
    if (!consentGiven) {
      toast.warning('You need to give consent first!');
      return;
    }
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

      const subscription = await createSubscriptionMutation.mutateAsync({
        data: {
          code: localStorage.getItem('superpower-code') ?? undefined,
          referralId: (window as any)?.Rewardful?.referral,
          membershipType,
        },
      });

      if (subscription) {
        // Track but don't await or let errors bubble up
        try {
          trackSubscription(selectedSubscription?.total);
        } catch (e) {
          console.error('Failed to track subscription:', e);
        }
        await nextOnboardingStep(user.onboarding.id);
      }
    } catch (e) {
      setProcessing(false);
      return;
    }
  };

  return (
    <div className="space-y-8">
      <H2 className="text-zinc-900">Payment</H2>

      <StripeCardForm
        processing={processing}
        onSubmit={handleSubmit}
        error={error}
        setError={setError}
        id="billingForm"
      />

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
