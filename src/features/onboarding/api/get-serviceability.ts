import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { ServiceabilityResponse } from '@/types/api';

export const getServiceabilityInputSchema = z.object({
  postalCode: z.string().min(1, 'Required'),
});

export type GetServiceabilityInput = z.infer<
  typeof getServiceabilityInputSchema
>;

export const getServiceability = ({
  data,
}: {
  data: GetServiceabilityInput;
}): Promise<ServiceabilityResponse> => {
  return api.post(`/appointments/serviceability`, data);
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
