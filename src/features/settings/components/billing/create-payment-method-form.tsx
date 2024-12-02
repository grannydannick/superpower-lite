import {
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { StripeError } from '@stripe/stripe-js';
import React, { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { StripeCardForm } from '@/components/shared/stripe-card-form';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { useAddPaymentMethod } from '@/features/settings/api';

interface PaymentMethodFormProps {
  /**
   * Callback function invoked upon successful form submission.
   */
  onSuccess?: () => void;
}

export const CreatePaymentMethodForm = ({
  onSuccess,
}: PaymentMethodFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { mutateAsync, isSuccess } = useAddPaymentMethod();

  const [error, setError] = useState<StripeError | undefined>(undefined);
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (isSuccess) {
      onSuccess && onSuccess();
    }
  }, [isSuccess]);

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
    } catch (e) {
      setProcessing(false);
      return;
    }
  };

  return (
    <div className="space-y-8">
      <StripeCardForm
        processing={processing}
        onSubmit={handleSubmit}
        error={error}
        setError={setError}
        id="paymentMethodForm"
      />
      <div className="flex w-full flex-col gap-4 pt-6 md:flex-row md:justify-end">
        <DialogClose asChild>
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </DialogClose>

        <Button type="submit" form="paymentMethodForm" disabled={processing}>
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
