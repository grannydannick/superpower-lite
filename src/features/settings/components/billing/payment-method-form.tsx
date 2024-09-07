import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAddPaymentMethod } from '@/features/settings/api';

// TODO: Refactor this based on Onboarding approach
export const PaymentMethodForm = ({ setClosed }: { setClosed: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { mutateAsync, isPending } = useAddPaymentMethod();

  const handleSubmit = async (): Promise<void> => {
    if (!stripe || !elements) {
      console.error('Stripe.js has not loaded yet.');
      return;
    }

    const cardElement = elements?.getElement(CardElement);
    if (!cardElement) {
      console.error('Could not find the Stripe card element.');
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error(`There was an error saving the payment method: ${error}`);
      return;
    }

    const { id } = paymentMethod;

    await mutateAsync({ data: { paymentMethodId: id } });

    setClosed();
  };

  return (
    <div className="space-y-8">
      <CardElement
        className="mt-8 border border-x-0 border-t-0 border-b-gray-200"
        options={{
          disableLink: true,
        }}
      />
      <div className="flex w-full justify-end gap-4">
        <Button variant="outline" type="button" onClick={setClosed}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {isPending ? <Spinner /> : 'Add card'}
        </Button>
      </div>
    </div>
  );
};
