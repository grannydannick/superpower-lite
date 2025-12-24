import { $api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

// Extract response types from the generated operations
type VerifyEligibilityResponse =
  operations['b2b.verifyEligibility']['responses'][200]['content']['application/json'];

export type EligibilityResult = VerifyEligibilityResponse;

/** A single B2B benefit allocation returned from verifyEligibility */
export type B2bBenefit = EligibilityResult['benefits'][number];

/**
 * Mutation hook to verify if an email is eligible for B2B credits with a specific organization
 */
export function useVerifyEligibility() {
  return $api.useMutation(
    'post',
    '/b2b/organizations/{organizationId}/verify-eligibility',
  );
}
