import { useQuery } from '@tanstack/react-query';

import { $api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

// Extract types from generated operations
type GetRecommendationsResponse =
  operations['recommendations.getRecommendations']['responses'][200]['content']['application/json'];

type Recommendation = GetRecommendationsResponse['products'][number];

type RecommendationReason = Recommendation['reasons'][number];

export type {
  GetRecommendationsResponse,
  Recommendation,
  RecommendationReason,
};

/**
 * Hook to fetch product recommendations for the current user
 */
export function useRecommendations(options?: { enabled?: boolean }) {
  return useQuery({
    ...$api.queryOptions('get', '/rpc/recommendations'),
    enabled: options?.enabled ?? true,
  });
}

// Query options for external use
export const getRecommendationsQueryOptions = () =>
  $api.queryOptions('get', '/rpc/recommendations');
