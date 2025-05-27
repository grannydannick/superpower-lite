import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { getTimelineQueryOptions } from '@/features/home/api/get-timeline';
import { getOrdersQueryOptions } from '@/features/orders/api/get-orders';
import { getServicesQueryOptions } from '@/features/services/api';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Order } from '@/types/api';

export const cancelOrder = ({
  orderId,
}: {
  orderId: string;
}): Promise<{ order: Order }> => {
  return api.post(`/orders/${orderId}/cancel`);
};

export const resyncDataAfterCancelOrder = ({
  queryClient,
}: {
  queryClient: QueryClient;
}) => {
  queryClient.invalidateQueries({
    queryKey: getOrdersQueryOptions().queryKey,
  });
  queryClient.invalidateQueries({
    queryKey: getTimelineQueryOptions().queryKey,
  });
  queryClient.invalidateQueries({
    queryKey: getServicesQueryOptions().queryKey,
  });
  queryClient.invalidateQueries({
    queryKey: ['service'],
  });
};

type UseCancelOrderOptions = {
  shouldResyncImmediately?: boolean;
  mutationConfig?: MutationConfig<typeof cancelOrder>;
};

export const useCancelOrder = (
  { mutationConfig, shouldResyncImmediately }: UseCancelOrderOptions = {
    shouldResyncImmediately: true,
  },
) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      if (shouldResyncImmediately) resyncDataAfterCancelOrder({ queryClient });

      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: cancelOrder,
  });
};
