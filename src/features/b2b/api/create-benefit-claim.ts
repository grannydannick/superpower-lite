import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export type CreateBenefitClaimResponse = {
  benefits?: unknown[];
};

export function useCreateBenefitClaim() {
  return useMutation({
    mutationFn: async ({
      organizationId,
      claimGrantToken,
    }: {
      organizationId: string;
      claimGrantToken: string;
    }) => {
      return api.post(
        `/rpc/b2b/organizations/${organizationId}/benefit-claims/grant`,
        {
          claimGrantToken,
        },
      ) as Promise<CreateBenefitClaimResponse>;
    },
  });
}
