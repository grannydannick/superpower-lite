import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { VerifyOPT } from '@/types/api';

export const verifyOtpInputSchema = z.object({
  phone: z.string().min(1, 'Required'),
  code: z.string().min(5, {
    message: 'Your one-time password must be 5 characters.',
  }),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpInputSchema>;

export const verifyOtp = ({
  data,
}: {
  data: VerifyOtpInput;
}): Promise<VerifyOPT> => {
  return api.post('/verify-otp', { code: data.code });
};

type UseVerifyOtpOptions = {
  mutationConfig?: MutationConfig<typeof verifyOtp>;
};

export const useVerifyOtp = ({ mutationConfig }: UseVerifyOtpOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: verifyOtp,
  });
};
