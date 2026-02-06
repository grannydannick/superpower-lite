import { useQuery } from '@tanstack/react-query';

import { $api } from '@/orpc/client';

/**
 * Hook to fetch the authenticated user's claimed B2B benefits.
 * Returns the array of claimed benefits.
 */
export function useGetBenefitClaims() {
  return useQuery($api.queryOptions('get', '/b2b/benefit-claims'));
}
