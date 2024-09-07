import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import { getSubscriptionsQueryOptions } from './get-subscriptions';

export const cancelSubscription = (): Promise<void> => {
  return api.put(`billing/subscription/cancel`);
};

type CancelSubscriptionOptions = {
  mutationConfig?: MutationConfig<typeof cancelSubscription>;
};

export const useCancelMembership = ({
  mutationConfig,
}: CancelSubscriptionOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getSubscriptionsQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: cancelSubscription,
  });
};
