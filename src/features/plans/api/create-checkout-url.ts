import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Product } from '@/types/api';

export const createCheckoutUrl = ({
  data,
}: {
  data: { products: Product[] };
}): Promise<{ checkoutUrl: string }> => {
  return api.post('/shop/checkout', data); // TODO: double check this endpoint post cutover
};

type UseCreateCheckoutUrlOptions = {
  mutationConfig?: MutationConfig<typeof createCheckoutUrl>;
};

export const useCreateCheckoutUrl = ({
  mutationConfig,
}: UseCreateCheckoutUrlOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createCheckoutUrl,
  });
};
