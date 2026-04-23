import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import { getConsultsQueryOptions } from './get-consults';

export const cancelConsult = ({ uid }: { uid: string }): Promise<unknown> => {
  return api.post(`/consults/cal/bookings/${uid}/cancel`);
};

type UseCancelConsultOptions = {
  mutationConfig?: MutationConfig<typeof cancelConsult>;
};

export const useCancelConsult = ({
  mutationConfig,
}: UseCancelConsultOptions = {}) => {
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
    mutationFn: cancelConsult,
  });
};
