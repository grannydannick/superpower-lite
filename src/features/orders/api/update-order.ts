import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { getTimelineQueryOptions } from '@/features/home/api/get-timeline';
import {
  consentInputSchema,
  locationInputSchema,
} from '@/features/orders/api/create-order';
import { getOrdersQueryOptions } from '@/features/orders/api/get-orders';
import { getServicesQueryOptions } from '@/features/services/api';
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
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
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
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateOrder,
  });
};
