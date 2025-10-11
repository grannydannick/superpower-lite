import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { checkLabOrderSupport } from '@/const';
import { getTimelineQueryOptions } from '@/features/home/api/get-timeline';
import {
  consentInputSchema,
  locationInputSchema,
} from '@/features/orders/api/create-order';
import { getServices } from '@/features/services/api';
import { useAnalytics } from '@/hooks/use-analytics';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Order } from '@/types/api';

export const updateOrderInputSchema = z.object({
  location: locationInputSchema.optional(),
  timestamp: z.string().optional(),
  externalId: z.string().optional(),
  timezone: z.string().optional(),
  informedConsent: consentInputSchema.optional(),
  method: z.enum(['AT_HOME', 'IN_LAB', 'PHLEBOTOMY_KIT', 'EVENT']).optional(),
  addOnServiceIds: z.array(z.string().min(1, 'This is required.')).optional(),
  status: z
    .enum([
      'UPCOMING',
      'COMPLETED',
      'CANCELLED',
      'REVOKED',
      'DRAFT',
      'PENDING',
      'ACTIVE',
    ])
    .optional(),
  paymentMethodId: z.string().optional(),
});

export type UpdateOrderInput = z.infer<typeof updateOrderInputSchema>;

export const updateOrder = ({
  orderId,
  data,
}: {
  orderId: string;
  data: UpdateOrderInput;
}): Promise<{ order: Order }> => {
  return api.put(`/orders/${orderId}`, data);
};

type UseUpdateOrderOptions = {
  mutationConfig?: MutationConfig<typeof updateOrder>;
};

export const useUpdateOrder = ({
  mutationConfig,
}: UseUpdateOrderOptions = {}) => {
  const queryClient = useQueryClient();
  const { track } = useAnalytics();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (response, variables, context) => {
      const order = response.order;

      queryClient.invalidateQueries({
        queryKey: getTimelineQueryOptions().queryKey,
      });
      onSuccess?.(response, variables, context);

      // should be non blocking in theory
      // simple api call to just get data, TODO: we can likely grab it from query client cache as well
      const data = await getServices({});
      const service = data?.services?.find((s) => s.id === order.serviceId);

      track('order_updated', {
        order_id: order.id,
        order_name: order.serviceName,
        order_status: order.status,
        order_collection_method: order.collectionMethod,
        service_id: order.serviceId,
        service_name: order.serviceName,
        is_blood_panel: checkLabOrderSupport(order.serviceName),
        value: service?.price,
        currency: 'USD',
      });
    },
    ...restConfig,
    mutationFn: updateOrder,
  });
};
