import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { getOrdersQueryOptions } from '@/features/orders/api/get-orders';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { addressInputSchema } from '@/shared/api';
import { Order } from '@/types/api';

export const serviceItemInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number(),
});

export type ServiceInput = z.infer<typeof serviceItemInputSchema>;

export const webAddressInputSchema = z.object({
  url: z.string().min(1),
  type: z.enum(['ZOOM']),
});

export type WebAddressInput = z.infer<typeof webAddressInputSchema>;

export const locationInputSchema = z.object({
  name: z.string().optional(),
  isDefault: z.boolean().optional(),
  address: addressInputSchema.optional(),
  webAddress: webAddressInputSchema.optional(),
});

export type LocationInput = z.infer<typeof locationInputSchema>;

export const createOrderInputSchema = z.object({
  id: z.string().optional(),
  serviceId: z.string().min(1, 'Required'),
  items: z.array(serviceItemInputSchema).optional(),
  location: locationInputSchema,
  timestamp: z.string().min(1, 'Required'),
  externalId: z.string().optional(),
  timezone: z.string().min(1, 'Required'),
  method: z.array(z.enum(['AT_HOME', 'IN_LAB', 'PHLEBOTOMY_KIT'])),
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

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

export const createOrder = ({
  data,
}: {
  data: CreateOrderInput;
}): Promise<{ order: Order }> => {
  return api.post('/orders', data);
};

type UseCreateOrderOptions = {
  mutationConfig?: MutationConfig<typeof createOrder>;
};

export const useCreateOrder = ({
  mutationConfig,
}: UseCreateOrderOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getOrdersQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createOrder,
  });
};
