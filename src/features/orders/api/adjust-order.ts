import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { addressInputSchema } from '@/types/address';
import { RequestGroup } from '@/types/api';

import { getOrdersQueryOptions } from './get-orders';

export const adjustOrderInputSchema = z.object({
  orderIds: z.array(z.string().min(1)).min(1),
  startTime: z.string(),
  endTime: z.string(),
  address: addressInputSchema,
});

export type AdjustOrderInput = z.infer<typeof adjustOrderInputSchema>;

export const adjustOrder = ({
  data,
}: {
  data: AdjustOrderInput;
}): Promise<{ requestGroup: RequestGroup }> => {
  return api.post('/phlebotomy/adjust', data);
};

type UseAdjustOrderOptions = {
  mutationConfig?: MutationConfig<typeof adjustOrder>;
};

export const useAdjustOrder = ({
  mutationConfig,
}: UseAdjustOrderOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (
      response,
      variables,
      onMutateResult,
      mutationFunctionContext,
    ) => {
      await queryClient.invalidateQueries({
        queryKey: getOrdersQueryOptions().queryKey,
      });
      onSuccess?.(response, variables, onMutateResult, mutationFunctionContext);
    },
    ...restConfig,
    mutationFn: adjustOrder,
  });
};
