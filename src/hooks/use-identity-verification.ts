import { StripeError } from '@stripe/stripe-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { isIdentityVerificationExpired } from '@/components/ui/questionnaire/utils';
import { toast } from '@/components/ui/sonner';
import { useCreateVerificationSession } from '@/features/onboarding/api/create-verification-session';
import { useUser } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';

const VERIFICATION_KEY = ['identity-verification'];
const STRIPE_SESSION_CANCELLED_ERROR_CODE = 'session_cancelled';

/** Status-only hook — no Stripe dependency, safe outside <Elements>. */
export const useIdentityVerificationStatus = () => {
  const queryClient = useQueryClient();
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

  const isExpired = useMemo(() => {
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
  };
};

/** Full hook with Stripe verification mutation. No <Elements> context required. */
export const useIdentityVerification = () => {
  const queryClient = useQueryClient();
  const createVerificationMutation = useCreateVerificationSession({});
  const status = useIdentityVerificationStatus();

  const verificationMutation = useMutation({
    mutationFn: async () => {
      const stripe = await getStripe();
      if (stripe === null) {
        throw new Error('Stripe is not available');
      }

      const response = await createVerificationMutation.mutateAsync({});
      if (!response.clientSecret) {
        throw new Error('No client secret returned');
      }

      const { error } = await stripe.verifyIdentity(response.clientSecret);

      if (error) {
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

  return {
    ...status,
    verificationMutation,
  };
};
