import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { z } from 'zod';

import { isBloodPanel } from '@/const/services';
import { getTimelineQueryOptions } from '@/features/home/api/get-timeline';
import { getOrdersQueryOptions } from '@/features/orders/api/get-orders';
import { getServicesQueryOptions } from '@/features/services/api';
import { useAnalytics } from '@/hooks/use-analytics';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Order } from '@/types/api';

export const upgradeOrderInputSchema = z.object({
  upgradeType: z.enum(['advanced']),
});

export type UpgradeOrderInput = z.infer<typeof upgradeOrderInputSchema>;

export const upgradeOrder = ({
  data,
}: {
  data: UpgradeOrderInput;
}): Promise<{ order: Order }> => {
  return api.post(`/orders/upgrade`, data);
};

export const resyncDataAfterUpgradedOrder = ({
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

type UseUpgradeOrderOptions = {
  shouldResyncImmediately?: boolean;
  mutationConfig?: MutationConfig<typeof upgradeOrder>;
};

export const useUpgradeOrder = (
  { mutationConfig, shouldResyncImmediately }: UseUpgradeOrderOptions = {
    shouldResyncImmediately: true,
  },
) => {
  const queryClient = useQueryClient();
  const { track } = useAnalytics();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: upgradeOrder,
    onSuccess: (response, variables, context) => {
      // Track upgrade order events
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

      if (shouldResyncImmediately)
        resyncDataAfterUpgradedOrder({ queryClient });

      onSuccess?.(response, variables, context);
    },
    ...restConfig,
  });
};
