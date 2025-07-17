import {
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { StripeError } from '@stripe/stripe-js';
import { FormEvent, useState } from 'react';

import { ConsentInfo } from '@/components/shared/consent-info';
import { StripeCardForm } from '@/components/shared/stripe-card-form';
import { Button } from '@/components/ui/button';
import { AnimatedCheckbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/sonner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { H3 } from '@/components/ui/typography';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import {
  useAddPaymentMethod,
  useCreateSubscription,
} from '@/features/settings/api';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';
import { getAccessCode } from '@/utils/access-code';
import { trackSubscription } from '@/utils/gtm';
import { getUtmData } from '@/utils/utm-middleware';

import {
  VisaIcon,
  AmericanExpressIcon,
  MasterCardIcon,
  HSAFSAIcon,
} from '../credit-card-icons';

const AVAILABLE_PAYMENT_METHODS = [
  { icon: <AmericanExpressIcon /> },
  { icon: <VisaIcon /> },
  { icon: <MasterCardIcon /> },
  { icon: <HSAFSAIcon /> },
];

export const BillingSection = () => {
  const elements = useElements();
  const stripe = useStripe();
  const { data: user } = useUser();
  const [error, setError] = useState<StripeError | undefined>(undefined);
  const addPaymentMethodMutation = useAddPaymentMethod();
  const createSubscriptionMutation = useCreateSubscription();
  const { activeStep, nextStep } = useStepper((s) => s);
  const { mutateAsync: updateTaskProgress } = useUpdateTask();

  const {
    membership,
    consentGiven,
    setProcessing,
    processing,
    setConsentGiven,
    showAccessCode,
    setShowAccessCode,
  } = useOnboarding();

  const handleSubmit = async (event: FormEvent) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!user) return;
    if (!membership) {
      toast('Select membership first!');
      return;
    }

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
        toast.error(error.message);

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
          code: getAccessCode() ?? undefined,
          referralId: (window as any)?.Rewardful?.referral,
          membershipType: membership.type,
          // Use cookie-based UTM data instead of sessionStorage
          campaignData: getUtmData() ?? undefined,
        },
      });

      if (subscription) {
        // Track but don't await or let errors bubble up
        try {
          trackSubscription(membership?.total);
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
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="mb-6 flex flex-col gap-2 md:mb-0 md:flex-row md:items-center md:gap-4">
          <H3 className="text-zinc-900">Payment details</H3>
          <div className="flex gap-2">
            {AVAILABLE_PAYMENT_METHODS.map((pm, i) => (
              <div
                key={i}
                className="flex h-6 w-10 items-center justify-center rounded-[4px] border border-zinc-200 p-0.5"
              >
                {pm.icon}
              </div>
            ))}
          </div>
        </div>
        <StripeCardForm
          processing={processing}
          onSubmit={handleSubmit}
          error={error}
          setError={setError}
          id="billingForm"
        />
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
            disabled={processing}
            checked={consentGiven}
            onCheckedChange={(checked: boolean) => setConsentGiven(checked)}
          />
        </div>

        <ConsentInfo htmlFor="terms" />
      </div>
      <div className="space-y-2">
        <Button
          className="w-full rounded-xl border border-zinc-500 bg-black px-6 py-4"
          disabled={processing || !consentGiven || !membership}
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

        {!showAccessCode ? (
          <Button
            variant="link"
            size="small"
            className="mr-auto px-0 text-zinc-500"
            onClick={() => setShowAccessCode(true)}
            disabled={processing}
          >
            I have an access code
          </Button>
        ) : null}
      </div>
    </div>
  );
};
