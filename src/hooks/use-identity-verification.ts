import { useStripe } from '@stripe/react-stripe-js';
import { StripeError } from '@stripe/stripe-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { isIdentityVerificationExpired } from '@/components/ui/questionnaire/utils';
import { toast } from '@/components/ui/sonner';
// eslint-disable-next-line import/no-restricted-paths
import { useCreateVerificationSession } from '@/features/onboarding/api/create-verification-session';
import { useTask } from '@/features/tasks/api/get-task';
// eslint-disable-next-line import/no-restricted-paths
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { useUser } from '@/lib/auth';

const ONBOARDING_TASK_NAME = 'onboarding-identity';
const VERIFICATION_KEY = ['identity-verification'];
const STRIPE_SESSION_CANCELLED_ERROR_CODE = 'session_cancelled';

export const useIdentityVerification = () => {
  const queryClient = useQueryClient();
  const stripe = useStripe();
  const createVerificationMutation = useCreateVerificationSession({});
  const idvTask = useTask({
    taskName: ONBOARDING_TASK_NAME,
  });
  const updateTaskMutation = useUpdateTask();
  const { data: user } = useUser();

  const { data: hasVerifiedInSession = false } = useQuery({
    queryKey: VERIFICATION_KEY,
    queryFn: () => {
      const cached = queryClient.getQueryData<boolean>(VERIFICATION_KEY);
      return cached ?? false;
    },
    enabled: true,
    notifyOnChangeProps: ['data'],
  });

  const verificationMutation = useMutation({
    mutationFn: async () => {
      if (!stripe) {
        throw new Error('Stripe is not available');
      }

      const response = await createVerificationMutation.mutateAsync({});
      if (!response.clientSecret) {
        throw new Error('No client secret returned');
      }

      const { error } = await stripe.verifyIdentity(response.clientSecret);

      if (error) {
        // don't throw for cancelled sessions (user closed modal)
        if (error.code !== STRIPE_SESSION_CANCELLED_ERROR_CODE) {
          throw error;
        }
        return false;
      }

      return true;
    },
    onSuccess: (success) => {
      if (success) {
        queryClient.setQueryData(VERIFICATION_KEY, true);

        // Update task status if needed
        if (idvTask.data?.task.status === 'draft') {
          updateTaskMutation.mutate({
            data: { status: 'in-progress' },
            taskName: ONBOARDING_TASK_NAME,
          });
        }

        toast.success('Identity processed successfully');
      }
    },
    onError: (error: StripeError) => {
      if (error?.code !== STRIPE_SESSION_CANCELLED_ERROR_CODE) {
        toast.error(
          'We were unable to verify your identity. Please try again later.',
        );
      }
    },
  });

  const isExpired = useMemo(() => {
    // If verified in this session, ignore expiration
    if (hasVerifiedInSession) {
      return false;
    }
    return isIdentityVerificationExpired(user?.identityUpdatedTime);
  }, [hasVerifiedInSession, user?.identityUpdatedTime]);

  const isVerified = useMemo(() => {
    return (
      hasVerifiedInSession || user?.identityVerificationStatus === 'VERIFIED'
    );
  }, [hasVerifiedInSession, user?.identityVerificationStatus]);

  const needsVerification = useMemo(() => {
    if (hasVerifiedInSession) {
      return false;
    }
    return !isVerified || isExpired;
  }, [hasVerifiedInSession, isVerified, isExpired]);

  return {
    isVerified,
    isExpired,
    needsVerification,
    verificationMutation,
  };
};
