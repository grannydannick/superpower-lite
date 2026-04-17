import { queryOptions } from '@tanstack/react-query';

import { getBiomarkersQueryOptions } from '@/features/data/api/get-biomarkers';
import { getCategoriesQueryOptions } from '@/features/data/api/get-categories';
import { getLatestBioAgeQueryOptions } from '@/features/data/api/get-latest-bio-age';
import { getLatestHealthScoreQueryOptions } from '@/features/data/api/get-latest-healthscore';
import { createFollowups } from '@/features/messages/api/create-followups';
import { getCreditsQueryOptions } from '@/features/orders/api/credits';
import { getGiftsQueryOptions } from '@/features/orders/api/get-gifts';
import { getOrdersQueryOptions } from '@/features/orders/api/get-orders';
import { getRedrawsQueryOptions } from '@/features/redraw/api/get-redraws';
import { getWearablesQueryOptions } from '@/features/settings/api/get-wearables';
import { $aiChatApi } from '@/orpc/ai-chat-api';
import { $api } from '@/orpc/client';

const HOMEPAGE_FOLLOWUPS_CONTEXT =
  "I'm on the Superpower home page. Suggest short, specific questions about my health data, biomarkers, or next steps I can ask the AI concierge.";
const HOMEPAGE_FOLLOWUPS_COUNT = 3;

/**
 * Homepage data seam.
 *
 * Homepage-owned cards should import query options from this module so route
 * prefetching and card-level reads stay aligned. When the future `/home`
 * endpoint lands, this file should be the main swap point.
 */

export const healthScoreQuery = () => getLatestHealthScoreQueryOptions();
export const bioAgeQuery = () => getLatestBioAgeQueryOptions();
export const biomarkersQuery = () => getBiomarkersQueryOptions();
export const categoriesQuery = () => getCategoriesQueryOptions();
export const protocolQuery = () =>
  $aiChatApi.queryOptions('get', '/protocol-v2/latest');
export const ordersQuery = () => getOrdersQueryOptions();
export const creditsQuery = () => getCreditsQueryOptions();
export const giftsQuery = () => getGiftsQueryOptions();
export const redrawsQuery = () => getRedrawsQueryOptions();
export const wearablesQuery = () => getWearablesQueryOptions();
export const familyRiskPlanQuery = () =>
  queryOptions({
    ...$api.queryOptions('get', '/family-risk/plan'),
    select: (data) => data.plan,
  });
export const homepageFollowupsQuery = () =>
  queryOptions({
    queryKey: [
      'followups',
      HOMEPAGE_FOLLOWUPS_CONTEXT,
      HOMEPAGE_FOLLOWUPS_COUNT,
    ] as const,
    queryFn: ({ signal }) =>
      createFollowups({
        data: {
          context: HOMEPAGE_FOLLOWUPS_CONTEXT,
          count: HOMEPAGE_FOLLOWUPS_COUNT,
        },
        signal,
      }),
    staleTime: 1000 * 60 * 5,
  });

interface HomepagePrefetchQueryClient {
  ensureQueryData: (options: {
    queryKey: readonly unknown[];
  }) => Promise<unknown>;
}

export function prefetchHomepageQueries(
  queryClient: HomepagePrefetchQueryClient,
) {
  const prefetches = [
    queryClient.ensureQueryData(healthScoreQuery()),
    queryClient.ensureQueryData(bioAgeQuery()),
    queryClient.ensureQueryData(biomarkersQuery()),
    queryClient.ensureQueryData(categoriesQuery()),
    queryClient.ensureQueryData(protocolQuery()),
    queryClient.ensureQueryData(ordersQuery()),
    queryClient.ensureQueryData(creditsQuery()),
    queryClient.ensureQueryData(giftsQuery()),
    queryClient.ensureQueryData(redrawsQuery()),
    queryClient.ensureQueryData(wearablesQuery()),
    queryClient.ensureQueryData(familyRiskPlanQuery()),
    queryClient.ensureQueryData(homepageFollowupsQuery()),
  ];

  return Promise.allSettled(prefetches);
}
