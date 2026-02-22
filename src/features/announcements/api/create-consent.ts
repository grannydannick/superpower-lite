import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { ConsentType } from '@/types/api';

export interface CreateConsentInput {
  agreedAt: string;
  type?: ConsentType;
  accepted?: boolean;
  metadata?: Record<string, unknown>;
}

export const createConsent = ({
  data,
}: {
  data: CreateConsentInput;
}): Promise<{ consent: { id: string; agreedAt: string } }> => {
  return api.post('/consent', data);
};

type UseCreateConsentOptions = {
  mutationConfig?: MutationConfig<typeof createConsent>;
};

export const useCreateConsent = ({
  mutationConfig,
}: UseCreateConsentOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      // Invalidate any consent-related queries if they exist in the future
      queryClient.invalidateQueries({
        queryKey: ['consent'],
      });

      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createConsent,
  });
};
