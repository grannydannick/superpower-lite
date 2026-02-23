import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { ServiceableResponse } from '@/types/api';

export const getServiceabilityInputSchema = z.object({
  zipCode: z.string().min(5, 'This is required.'),
  collectionMethod: z.enum(['AT_HOME', 'IN_LAB', 'PHLEBOTOMY_KIT', 'EVENT']),
});

export type GetServiceabilityInput = z.infer<
  typeof getServiceabilityInputSchema
>;

export const getServiceability = ({
  data,
}: {
  data: GetServiceabilityInput;
}): Promise<ServiceableResponse> => {
  return api.post(`/phlebotomy/serviceable`, data);
};

type UseGetServiceabilityOptions = {
  mutationConfig?: MutationConfig<typeof getServiceability>;
};

export const useGetServiceability = ({
  mutationConfig,
}: UseGetServiceabilityOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (
      response,
      variables,
      onMutateResult,
      mutationFunctionContext,
    ) => {
      onSuccess?.(response, variables, onMutateResult, mutationFunctionContext);
    },
    ...restConfig,
    mutationFn: getServiceability,
  });
};
