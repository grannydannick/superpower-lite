import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { checkLabOrderSupport } from '@/const';
import { getTimelineQueryOptions } from '@/features/home/api/get-timeline';
import { getOrdersQueryOptions } from '@/features/orders/api/get-orders';
import { getServicesQueryOptions } from '@/features/services/api';
import { useAnalytics } from '@/hooks/use-analytics';
import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';
import { MutationConfig } from '@/lib/react-query';
import { Order } from '@/types/api';
import { getUpgradePrice } from '@/utils/get-upgrade-price';

export const upgradeOrderInputSchema = z.object({
  upgradeType: z.enum(['advanced', 'custom-panel']),
  addOnServiceIds: z.array(z.string().min(1, 'This is required.')).optional(),
});

export type UpgradeOrderInput = z.infer<typeof upgradeOrderInputSchema>;

export const upgradeOrder = ({
  data,
}: {
  data: UpgradeOrderInput;
}): Promise<{ order: Order }> => {
  return api.post(`/orders/upgrade`, data);
};
type UseUpgradeOrderOptions = {
  mutationConfig?: MutationConfig<typeof upgradeOrder>;
};

export const useUpgradeOrder = ({
  mutationConfig,
}: UseUpgradeOrderOptions = {}) => {
  const queryClient = useQueryClient();
  const { track } = useAnalytics();
  const { data: user } = useUser();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: upgradeOrder,
    onSuccess: (response, variables, context) => {
      const order = response.order;

      queryClient.invalidateQueries({
        queryKey: getTimelineQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getOrdersQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getServicesQueryOptions().queryKey,
      });
      onSuccess?.(response, variables, context);

      // TODO: adjust to also work with custom panels?
      // TODO: we can likely grab service info from query client cache as well
      track('order_upgraded', {
        order_id: order.id,
        order_name: order.serviceName,
        order_status: order.status,
        order_collection_method: order?.collectionMethod,
        service_id: order.serviceId,
        service_name: order.serviceName,
        is_blood_panel: checkLabOrderSupport(order.serviceName),
        value: getUpgradePrice(user),
        currency: 'USD',
        order,
      });
    },
    ...restConfig,
  });
};
