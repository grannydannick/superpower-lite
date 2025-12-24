import { useQuery } from '@tanstack/react-query';

import { $api } from '@/orpc/client';

/**
 * Hook to check if the authenticated user has redeemed a B2B credit
 */
export function useHasClaimedBenefits() {
  return useQuery($api.queryOptions('get', '/b2b/has-claimed-benefits'));
}
