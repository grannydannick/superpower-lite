import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export type SendB2bEligibilityOtpResult = {
  success: true;
};

export function useSendB2bEligibilityOtp() {
  return useMutation({
    mutationFn: async ({
      organizationId,
      email,
    }: {
      organizationId: string;
      email: string;
    }) => {
      return api.post('/rpc/b2b/send-eligibility-otp', {
        organizationId,
        email,
      }) as Promise<SendB2bEligibilityOtpResult>;
    },
  });
}

export type VerifyB2bEligibilityOtpVariables = {
  organizationId: string;
  email: string;
  code: string;
};

export type VerifyB2bEligibilityOtpResult = {
  success: boolean;
  claimGrantToken: string;
  authStatus: 'logged_in' | 'no_existing_account';
};

export function useVerifyB2bEligibilityOtp() {
  return useMutation<
    VerifyB2bEligibilityOtpResult,
    Error,
    VerifyB2bEligibilityOtpVariables
  >({
    mutationFn: async ({ organizationId, email, code }) => {
      return api.post('/rpc/b2b/verify-eligibility-otp', {
        organizationId,
        email,
        code,
      }) as Promise<VerifyB2bEligibilityOtpResult>;
    },
  });
}
