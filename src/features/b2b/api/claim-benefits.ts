import { $api } from '@/orpc/client';

/**
 * Mutation hook to claim B2B benefits for an organization
 * Creates credits for each benefit product and marks benefits as claimed
 */
export function useClaimBenefits() {
  return $api.useMutation(
    'post',
    '/b2b/organizations/{organizationId}/claim-benefits',
  );
}
