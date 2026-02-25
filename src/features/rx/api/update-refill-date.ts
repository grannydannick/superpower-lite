import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import { getSubscriptionsQueryOptions } from './get-subscriptions';

export const updateRefillDate = ({
  id,
  anchorDate,
}: {
  id: string;
  anchorDate: string;
}) => {
  return api.put(`/rx/contract/${id}/anchor-date`, { anchorDate });
};

type UseUpdateRefillDateOptions = {
  mutationConfig?: MutationConfig<typeof updateRefillDate>;
};

export const useUpdateRefillDate = ({
  mutationConfig,
}: UseUpdateRefillDateOptions = {}) => {
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
    mutationFn: updateRefillDate,
  });
};
