import { useMutation } from '@tanstack/react-query';
import z from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export const createFlexCheckoutSessionInputSchema = z.object({
  state: z.string(),
  coupon: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

export type CreateFlexCheckoutSessionInput = z.infer<
  typeof createFlexCheckoutSessionInputSchema
>;

export type CreateFlexCheckoutSessionResponse = {
  redirectUrl: string;
};

export const createFlexCheckoutSession = ({
  data,
}: {
  data: CreateFlexCheckoutSessionInput;
}): Promise<CreateFlexCheckoutSessionResponse> => {
  return api.post('/billing/hsa-fsa/checkout-session', data);
};

type UseCreateFlexCheckoutSessionOptions = {
  mutationConfig?: MutationConfig<typeof createFlexCheckoutSession>;
};

export const useCreateFlexCheckoutSession = ({
  mutationConfig,
}: UseCreateFlexCheckoutSessionOptions = {}) => {
  return useMutation({
    mutationFn: createFlexCheckoutSession,
    ...(mutationConfig || {}),
  });
};
