import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import { getConsultsQueryOptions } from './get-consults';

export type CreateConsultInput = {
  start: string;
  practitionerId: string;
};

export const createConsult = ({
  data,
}: {
  data: CreateConsultInput;
}): Promise<unknown> => {
  return api.post('/consults/cal/bookings', data);
};

type UseCreateConsultOptions = {
  mutationConfig?: MutationConfig<typeof createConsult>;
};

export const useCreateConsult = ({
  mutationConfig,
}: UseCreateConsultOptions = {}) => {
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
        queryKey: getConsultsQueryOptions().queryKey,
      });
      onSuccess?.(response, variables, onMutateResult, mutationFunctionContext);
    },
    ...restConfig,
    mutationFn: createConsult,
  });
};
