import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';

export type CreateSetupIntentResponse = {
  client_secret: string;
};

export const createSetupIntent =
  async (): Promise<CreateSetupIntentResponse> => {
    return api.post('billing/setup-intent', {});
  };

type UseCreateSetupIntentOptions = {
  mutationConfig?: MutationConfig<typeof createSetupIntent>;
};

export const useCreateSetupIntent = ({
  mutationConfig,
}: UseCreateSetupIntentOptions = {}) => {
  return useMutation({
    mutationFn: createSetupIntent,
    ...(mutationConfig || {}),
  });
};
