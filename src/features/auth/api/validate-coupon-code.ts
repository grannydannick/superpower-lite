import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Coupon } from '@/types/api';

export const validateCode = ({
  accessCode,
}: ValidateInput): Promise<{ coupon: Coupon }> => {
  return api.get(`/billing/coupons?code=${accessCode}`, {
    headers: {
      'x-hide-toast': 'true',
    },
  });
};

export const validateInputSchema = z.object({
  accessCode: z.string().min(1, { message: 'Access code is required' }),
});

export type ValidateInput = z.infer<typeof validateInputSchema>;

type UseValidateCodeOptions = {
  mutationConfig?: MutationConfig<typeof validateCode>;
};

export const useValidateCode = ({ mutationConfig }: UseValidateCodeOptions) => {
  return useMutation({
    ...mutationConfig,
    mutationFn: validateCode,
  });
};
