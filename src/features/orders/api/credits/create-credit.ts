import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Credit } from '@/types/api';

import { getCreditsQueryOptions } from './get-credits';

export const consentInputSchema = z.object({
  agreedAt: z.string(),
});

export const createCreditInputSchema = z.object({
  serviceIds: z.array(z.string().min(1, 'This is required.')),
  paymentMethodId: z.string().optional(),
  informedConsent: z.enum(['test-kit']).optional(),
});

export type CreateCreditInput = z.infer<typeof createCreditInputSchema>;

export const createCredit = ({
  data,
}: {
  data: CreateCreditInput;
}): Promise<{ credits: Credit[] }> => {
  return api.post('/credits', data);
};

type UseCreateCreditOptions = {
  mutationConfig?: MutationConfig<typeof createCredit>;
};

export const useCreateCredit = ({
  mutationConfig,
}: UseCreateCreditOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (
      response,
      variables,
      onMutateResult,
      mutationFunctionContext,
    ) => {
      queryClient.invalidateQueries({
        queryKey: getCreditsQueryOptions().queryKey,
      });
      onSuccess?.(response, variables, onMutateResult, mutationFunctionContext);
    },
    ...restConfig,
    mutationFn: createCredit,
  });
};
