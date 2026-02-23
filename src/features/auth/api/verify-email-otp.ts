import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { VerifyEmailOTPResponse } from '@/types/api';

export const verifyEmailOTPInputSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export type VerifyEmailOTPInput = z.infer<typeof verifyEmailOTPInputSchema>;

export const verifyEmailOTP = async ({
  data,
}: {
  data: VerifyEmailOTPInput;
}): Promise<VerifyEmailOTPResponse> => {
  // We intentionally do not set x-hide-toast here; OTP errors are surfaced
  // with targeted copy (invalid vs expired) and should show a toast upstream.
  return api.post(`/auth/verify-otp`, data, {
    headers: { 'Content-Type': 'application/json' },
  }) as Promise<VerifyEmailOTPResponse>;
};

type UseVerifyEmailOTPOptions = {
  mutationConfig?: MutationConfig<typeof verifyEmailOTP>;
};

export const useVerifyEmailOTP = ({
  mutationConfig,
}: UseVerifyEmailOTPOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: verifyEmailOTP,
  });
};
