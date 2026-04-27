import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Subscription } from '@/types/api';

import { getPaymentMethodsQueryOptions } from './get-payment-methods';

export const setDefaultPaymentMethodInputSchema = z.object({
  setDefault: z.boolean(),
});

export type SetDefaultPaymentMethodInput = z.infer<
  typeof setDefaultPaymentMethodInputSchema
>;

export const setDefaultPaymentMethod = ({
  data,
  paymentMethodId,
}: {
  data: SetDefaultPaymentMethodInput;
  paymentMethodId: string;
}): Promise<Subscription> => {
  return api.post(`billing/methods/${paymentMethodId}/default`, data);
};

type UseSetDefaultPaymentMethodOptions = {
  mutationConfig?: MutationConfig<typeof setDefaultPaymentMethod>;
};

export const useSetDefaultPaymentMethod = ({
  mutationConfig,
}: UseSetDefaultPaymentMethodOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: async (...args) => {
      // Await the refetch so `isPending` stays true until the payment methods
      // list reflects the new default — keeps the "Default method" label move
      // and the disabled-row state in sync for callers that read `isPending`.
      await queryClient.invalidateQueries({
        queryKey: getPaymentMethodsQueryOptions().queryKey,
      });
      await onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: setDefaultPaymentMethod,
  });
};
