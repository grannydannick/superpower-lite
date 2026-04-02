import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { toast } from '@/components/ui/sonner';
import { getUser } from '@/lib/auth';
import { authClient } from '@/lib/auth-client';
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
  const { error } = await authClient.signIn.emailOtp({
    email: data.email,
    otp: data.code,
  });

  if (error) {
    toast.error(error.message);
    throw new Error(error.message);
  }

  const user = await getUser();
  return { success: true, user };
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
