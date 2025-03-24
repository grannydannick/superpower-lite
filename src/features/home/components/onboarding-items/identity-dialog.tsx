import { useStripe } from '@stripe/react-stripe-js';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useCreateVerificationSession } from '@/features/onboarding/api/create-verification-session';
import { useUpdateTask } from '@/features/tasks/api/update-task';

export const IdentityDialog = () => {
  const stripe = useStripe();
  const createVerificationMutation = useCreateVerificationSession({});
  const { mutate } = useUpdateTask();

  const verify = async () => {
    if (!stripe) return;

    try {
      const response = await createVerificationMutation.mutateAsync({});
      if (!response.clientSecret) {
        return;
      }

      /**
       * This uses clientSecret that stripe returns us and opens modal that is purely controlled by Stripe
       */
      const { error } = await stripe.verifyIdentity(response.clientSecret);

      if (error) {
        toast.error(error.code);
        return;
      }

      mutate({
        data: { status: 'in-progress' },
        taskName: 'onboarding-identity',
      });
    } catch (error) {
      toast.error('Unable to verify identity');
    }
  };

  return (
    <Button
      onClick={verify}
      variant="outline"
      size="medium"
      className="bg-white"
    >
      {createVerificationMutation.isPending ? (
        <Spinner variant="primary" />
      ) : (
        'Verify me'
      )}
    </Button>
  );
};
