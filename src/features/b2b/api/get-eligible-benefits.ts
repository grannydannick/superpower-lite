import { useMutation } from '@tanstack/react-query';

import { api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

// Extract response types from the generated operations
type GetEligibleBenefitsResponse =
  operations['b2b.getEligibleBenefits']['responses'][200]['content']['application/json'];

/** A single B2B benefit allocation */
export type B2bBenefit = GetEligibleBenefitsResponse[number];

/**
 * Mutation hook to check if an email is eligible for B2B benefits with a specific organization.
 * Returns the array of unclaimed benefits; an empty array means not eligible.
 */
export function useGetEligibleBenefits() {
  return useMutation({
    mutationFn: async ({
      organizationId,
      email,
    }: {
      organizationId: string;
      email: string;
    }) => {
      const { data, error } = await api.GET(
        '/b2b/organizations/{organizationId}/eligible-benefits',
        {
          params: {
            path: { organizationId },
            query: { email },
          },
        },
      );
      if (error) throw error;
      return data;
    },
  });
}
