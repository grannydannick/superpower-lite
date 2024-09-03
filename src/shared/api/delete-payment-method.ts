import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { getPaymentMethodsQueryOptions } from '@/shared/api/get-payment-methods';
import { Subscription } from '@/types/api';

export const deletePaymentMethod = ({
  paymentMethodId,
}: {
  paymentMethodId: string;
}): Promise<Subscription> => {
  return api.delete(`billing/methods/${paymentMethodId}`);
};

type UseDeletePaymentMethodOptions = {
  mutationConfig?: MutationConfig<typeof deletePaymentMethod>;
};

export const useDeletePaymentMethod = ({
  mutationConfig,
}: UseDeletePaymentMethodOptions = {}) => {
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
    mutationFn: deletePaymentMethod,
  });
};
