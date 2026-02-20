import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { addressInputSchema } from '@/types/address';
import { RequestGroup } from '@/types/api';

export const createOrderInputSchema = z.object({
  id: z.string().optional(),
  creditIds: z.array(z.string().min(1, 'This is required.')),
  address: addressInputSchema,
  timestamp: z.string().min(1, 'This is required.').optional(),
  timezone: z.string().min(1, 'This is required.').optional(),
  appointmentType: z.enum(['SCHEDULED', 'UNSCHEDULED']).optional(),
  paymentMethodId: z.string().optional(),
  collectionMethod: z.enum(['AT_HOME', 'PHLEBOTOMY_KIT', 'IN_LAB']).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

export const createOrder = ({
  data,
}: {
  data: CreateOrderInput;
}): Promise<{ requestGroup: RequestGroup }> => {
  return api.post('/orders', data);
};

type UseCreateOrderOptions = {
  mutationConfig?: MutationConfig<typeof createOrder>;
};

export const useCreateOrder = ({
  mutationConfig,
}: UseCreateOrderOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (
      response,
      variables,
      onMutateResult,
      mutationFunctionContext,
    ) => {
      onSuccess?.(response, variables, onMutateResult, mutationFunctionContext);
    },
    ...restConfig,
    mutationFn: createOrder,
  });
};
