import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getWearablesQueryOptions } from '@/features/settings/api/get-wearables';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export const deleteWearable = ({ provider }: { provider: string }) => {
  return api.delete(`/wearables/${provider}`);
};

type UseDeleteWearableOptions = {
  mutationConfig?: MutationConfig<typeof deleteWearable>;
};

export const useDeleteWearable = ({
  mutationConfig,
}: UseDeleteWearableOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getWearablesQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteWearable,
  });
};
