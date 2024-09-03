import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { getPaymentMethodsQueryOptions } from '@/shared/api/get-payment-methods';
import { Subscription } from '@/types/api';

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
  return api.post(`billing/methods/${paymentMethodId}`, data);
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
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getPaymentMethodsQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: setDefaultPaymentMethod,
  });
};
