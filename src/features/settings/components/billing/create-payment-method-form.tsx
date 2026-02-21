import {
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { StripeError } from '@stripe/stripe-js';
import React, { FormEvent, useState } from 'react';

import { StripeCardElement } from '@/components/shared/stripe-card-element';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { useAddPaymentMethod } from '@/features/settings/api';

interface PaymentMethodFormProps {
  /**
   * Callback function invoked upon successful form submission.
   */
  onSuccess?: () => void;
  /**
   * Callback function invoked upon clicking the cancel button.
   */
  onClose?: () => void;
  /**
   * Whether to show the cancel button.
   * @default true
   */
  showCancelButton?: boolean;
}

export const CreatePaymentMethodForm = ({
  onSuccess,
  showCancelButton = true,
  onClose,
}: PaymentMethodFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { mutateAsync } = useAddPaymentMethod();

  const [error, setError] = useState<StripeError | undefined>(undefined);
  const [processing, setProcessing] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe.js has not loaded yet.');
      return;
    }

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      toast.error('Could not find the Stripe card element.');
      return;
    }

    setProcessing(true);
    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setError(error);
        setProcessing(false);

        return;
      }

      const { id } = paymentMethod;

      await mutateAsync({ data: { paymentMethodId: id } });

      setProcessing(false);
      onSuccess?.();
    } catch (e) {
      setProcessing(false);
      return;
    }
  };

  return (
    <div className="space-y-8">
      <StripeCardElement
        processing={processing}
        error={error}
        setError={setError}
      />
      <div className="flex w-full flex-col gap-4 pt-6 md:flex-row md:justify-end">
        {showCancelButton && (
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
        )}

        <Button onClick={handleSubmit} disabled={processing}>
          {processing ? (
            <TextShimmer
              className="line-clamp-1 text-base [--base-color:white] [--base-gradient-color:#a1a1aa]"
              duration={1}
            >
              Confirming…
            </TextShimmer>
          ) : (
            'Add card'
          )}
        </Button>
      </div>
    </div>
  );
};
