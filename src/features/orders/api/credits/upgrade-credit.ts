import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Credit } from '@/types/api';

import { getCreditsQueryOptions } from './get-credits';

export const upgradeCreditInputSchema = z.object({
  upgradeType: z.enum(['advanced', 'baseline-bundle', 'at-home']),
  creditIds: z.array(z.string()).optional(),
  paymentMethodId: z.string().optional(),
  quantity: z.number().optional(),
});

export type UpgradeCreditInput = z.infer<typeof upgradeCreditInputSchema>;

export const upgradeCredt = ({
  data,
}: {
  data: UpgradeCreditInput;
}): Promise<{ credits: Credit[] }> => {
  return api.post(`/credits/upgrade`, data);
};
type UseUpgradeCreditOptions = {
  mutationConfig?: MutationConfig<typeof upgradeCredt>;
};

export const useUpgradeCredit = ({
  mutationConfig,
}: UseUpgradeCreditOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: upgradeCredt,
    onSuccess: (
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
  });
};
