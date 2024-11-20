import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import {
  consentInputSchema,
  locationInputSchema,
} from '@/features/orders/api/create-order';
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
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateOrder,
  });
};
