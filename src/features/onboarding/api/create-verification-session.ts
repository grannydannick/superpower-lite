import { useMutation } from '@tanstack/react-query';

import { useAnalytics } from '@/hooks/use-analytics';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { UserIdentityVerificationSession } from '@/types/api';

export const createVerificationSession = ({
  redirectUrl,
}: {
  redirectUrl?: string;
}): Promise<UserIdentityVerificationSession> => {
  return api.post('/identity/create-verification-session', { redirectUrl });
};

type UseCreateVerificationSessionOptions = {
  mutationConfig?: MutationConfig<typeof createVerificationSession>;
};

export const useCreateVerificationSession = ({
  mutationConfig = {},
}: UseCreateVerificationSessionOptions) => {
  const { track } = useAnalytics();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (
      session,
      variables,
      onMutateResult,
      mutationFunctionContext,
    ) => {
      // Track identity verification
      track('verified_id', {
        verification_method: 'stripe_identity',
        session_created: session.created,
      });

      onSuccess?.(session, variables, onMutateResult, mutationFunctionContext);
    },
    ...restConfig,
    mutationFn: createVerificationSession,
  });
};
