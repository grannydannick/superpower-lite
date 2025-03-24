import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateOrderInput } from '@/features/orders/api/create-order';
import { getOrdersQueryOptions } from '@/features/orders/api/get-orders';
import { getServicesQueryOptions } from '@/features/services/api';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Order } from '@/types/api';

export const createBulkOrders = ({
  data,
}: {
  data: CreateOrderInput[];
}): Promise<{ order: Order }> => {
  return api.post('/orders/bulk', data);
};

type UseCreateBulkOrderOptions = {
  mutationConfig?: MutationConfig<typeof createBulkOrders>;
};

export const useCreateBulkOrders = ({
  mutationConfig,
}: UseCreateBulkOrderOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getOrdersQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getServicesQueryOptions().queryKey,
      });
      // https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation#query-matching-with-invalidatequeries
      // we want to invalidate ALL service queries here
      queryClient.invalidateQueries({
        queryKey: ['service'],
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createBulkOrders,
  });
};
