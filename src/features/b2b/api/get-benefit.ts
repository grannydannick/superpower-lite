import { useQuery } from '@tanstack/react-query';

import { $api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

// Extract response types from the generated operations
type GetBenefitsResponse =
  operations['b2b.getBenefits']['responses'][200]['content']['application/json'];

export type B2bOrganization = GetBenefitsResponse;

/**
 * Hook to fetch B2B organization benefits (credit service IDs)
 * @param organizationId - The ID of the B2B organization
 */
export function useBenefits(organizationId: string) {
  return useQuery({
    ...$api.queryOptions(
      'get',
      '/b2b/organizations/{organizationId}/benefits',
      {
        params: {
          path: { organizationId },
        },
      },
    ),
    enabled: !!organizationId,
  });
}
