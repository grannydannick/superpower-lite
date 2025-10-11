import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { checkLabOrderSupport } from '@/const';
import { getTimelineQueryOptions } from '@/features/home/api/get-timeline';
import { getServices } from '@/features/services/api';
import { useAnalytics } from '@/hooks/use-analytics';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { addressInputSchema } from '@/types/address';
import { Order } from '@/types/api';

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

export const consentInputSchema = z.object({
  agreedAt: z.string(), // You can store `agreedAt` as a string (ISO date format)
});

export const createOrderInputSchema = z.object({
  id: z.string().optional(),
  serviceId: z.string().min(1, 'This is required.'),
  addOnServiceIds: z.array(z.string().min(1, 'This is required.')).optional(),
  location: locationInputSchema,
  timestamp: z.string().min(1, 'This is required.'),
  externalId: z.string().optional(),
  timezone: z.string().min(1, 'This is required.'),
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
  informedConsent: consentInputSchema.optional(),
  paymentMethodId: z.string().optional(),
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
  const { track } = useAnalytics();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (response, variables, context) => {
      const order = response.order;
      queryClient.invalidateQueries({
        queryKey: getTimelineQueryOptions().queryKey,
      });
      onSuccess?.(response, variables, context);

      // simple api call to just get data, TODO: we can likely grab it from query client cache as well
      const data = await getServices({});
      const service = data?.services?.find((s) => s.id === order.serviceId);
      track('order_created', {
        order_id: order.id,
        order_name: order.serviceName,
        order_status: order.status,
        order_collection_method: order?.collectionMethod,
        service_id: order.serviceId,
        service_name: order.serviceName,
        is_blood_panel: checkLabOrderSupport(order.serviceName),
        value: service?.price,
        currency: 'USD',
      });
    },
    ...restConfig,
    mutationFn: createOrder,
  });
};
