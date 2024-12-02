import {
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { StripeError } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

import { ConsentInfo } from '@/components/shared/consent-info';
import { StripeCardForm } from '@/components/shared/stripe-card-form';
import { Checkbox } from '@/components/ui/checkbox';
import { H2 } from '@/components/ui/typography';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import {
  useAddPaymentMethod,
  useCreateSubscription,
  useMembershipPrice,
} from '@/features/settings/api';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';

import { trackSubscription } from '../../utils/gtm';

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
  const code = localStorage.getItem('superpower-code');
  const membershipQuery = useMembershipPrice({
    code: code ?? undefined,
  });

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
          code: code ?? undefined,
          referralId: (window as any)?.Rewardful?.referral,
        },
      });

      if (subscription) {
        // Track but don't await or let errors bubble up
        try {
          trackSubscription(membershipQuery.data);
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
      <div className="flex items-center justify-between gap-2">
        <H2 className="text-zinc-900">Payment</H2>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            delay: 0.3,
          }}
          className={cn(
            'text-xs font-medium w-fit',
            'px-2.5 py-0.5 rounded-full',
            'bg-gradient-to-r from-vermillion-500/10 via-vermillion-200/10 to-vermillion-900/10',
            'text-vermillion-900',
            'ring-1 ring-vermillion-500',
          )}
        >
          Billed annually
        </motion.div>
      </div>

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
