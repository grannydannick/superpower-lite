import { $api } from '@/orpc/client';

/**
 * Mutation hook to create a benefit claim for the authenticated user.
 * Returns the claimed benefits on success.
 */
export function useCreateBenefitClaim() {
  return $api.useMutation(
    'post',
    '/b2b/organizations/{organizationId}/benefit-claims',
  );
}
