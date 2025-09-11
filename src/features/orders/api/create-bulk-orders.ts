import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isBloodPanel } from '@/const/services';
import { CreateOrderInput } from '@/features/orders/api/create-order';
import { getOrdersQueryOptions } from '@/features/orders/api/get-orders';
import { getServicesQueryOptions } from '@/features/services/api';
import { useAnalytics } from '@/hooks/use-analytics';
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
  const { track } = useAnalytics();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (response, variables, context) => {
      // Track order events for each order in the bulk creation
      const order = response.order;

      // Track blood test orders for all blood panels
      if (isBloodPanel(order.serviceName)) {
        track('ordered_blood_test', {
          blood_test: order.serviceName,
          value: order.amount,
        });
      } else {
        // Track service order for all non-blood panel services
        track('ordered_service', {
          service_name: order.serviceName,
          value: order.amount,
        });
      }

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
      onSuccess?.(response, variables, context);
    },
    ...restConfig,
    mutationFn: createBulkOrders,
  });
};
