import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { getOrdersQueryOptions } from '@/features/orders/api';
import { useAnalytics } from '@/hooks/use-analytics';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Subscription } from '@/types/api';
import { getAccessCode } from '@/utils/access-code';
import { getReferralId } from '@/utils/referral-id';
import { getUtmData } from '@/utils/utm-middleware';

export const createSubscriptionInputSchema = z.object({
  code: z.string().optional(),
  referralId: z.string().optional(),
  campaignData: z.record(z.string(), z.any()).optional(),
  state: z.string(),
  paymentMethod: z.string().optional(),
  hsaFsaCheckoutSessionId: z.string().optional(),
});

export type CreateSubscriptionInput = z.infer<
  typeof createSubscriptionInputSchema
>;

export const createSubscription = ({
  data,
}: {
  data: CreateSubscriptionInput;
}): Promise<{ subscription: Subscription }> => {
  // Get UTM data from cookie if not provided
  if (!data.campaignData) {
    data.campaignData = getUtmData() || undefined;
  }
  return api.post(`/billing/subscriptions`, data);
};

type UseCreateSubscriptionOptions = {
  mutationConfig?: MutationConfig<typeof createSubscription>;
};

export const useCreateSubscription = ({
  mutationConfig,
}: UseCreateSubscriptionOptions = {}) => {
  const queryClient = useQueryClient();
  const { track } = useAnalytics();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getOrdersQueryOptions().queryKey,
      });

      try {
        track('subscription_created', {
          access_code: getAccessCode(),
          referral_id: getReferralId(),
          currency: 'USD',
          value: args[0].subscription.total,
          payment_method: args[1].data.paymentMethod,
        });
      } catch (e) {
        console.error('Failed to track subscription:', e);
      }
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createSubscription,
  });
};
