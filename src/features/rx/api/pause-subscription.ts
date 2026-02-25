import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import { getSubscriptionsQueryOptions } from './get-subscriptions';

export const pauseSubscription = (id: string) => {
  return api.post(`/rx/contract/${id}/pause`);
};

type UsePauseSubscriptionOptions = {
  mutationConfig?: MutationConfig<typeof pauseSubscription>;
};

export const usePauseSubscription = ({
  mutationConfig,
}: UsePauseSubscriptionOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (...args) => {
      onSuccess?.(...args);

      queryClient.invalidateQueries({
        queryKey: getSubscriptionsQueryOptions().queryKey,
      });
    },
    ...restConfig,
    mutationFn: pauseSubscription,
  });
};
