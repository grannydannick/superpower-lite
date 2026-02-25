import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import { getSubscriptionsQueryOptions } from './get-subscriptions';

export const cancelSubscription = (id: string) => {
  return api.post(`/rx/contract/${id}/cancel`);
};

type UseCancelSubscriptionOptions = {
  mutationConfig?: MutationConfig<typeof cancelSubscription>;
};

export const useCancelSubscription = ({
  mutationConfig,
}: UseCancelSubscriptionOptions = {}) => {
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
    mutationFn: cancelSubscription,
  });
};
