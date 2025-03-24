import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { getOrdersQueryOptions } from '@/features/orders/api';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Subscription } from '@/types/api';

export const createSubscriptionInputSchema = z.object({
  code: z.string().optional(),
  referralId: z.string().optional(),
  membershipType: z.enum(['advanced', 'baseline']),
});

export type CreateSubscriptionInput = z.infer<
  typeof createSubscriptionInputSchema
>;

export const createSubscription = ({
  data,
}: {
  data: CreateSubscriptionInput;
}): Promise<Subscription> => {
  return api.post(`/billing/subscription`, data);
};

type UseCreateSubscriptionOptions = {
  mutationConfig?: MutationConfig<typeof createSubscription>;
};

export const useCreateSubscription = ({
  mutationConfig,
}: UseCreateSubscriptionOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getOrdersQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createSubscription,
  });
};
