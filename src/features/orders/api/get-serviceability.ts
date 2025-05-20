import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { ServiceableResponse } from '@/types/api';

export const getServiceabilityInputSchema = z.object({
  zipCode: z.string().min(5, 'Required'),
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
  const { ...restConfig } = mutationConfig || {};

  return useMutation({
    ...restConfig,
    mutationFn: getServiceability,
  });
};
