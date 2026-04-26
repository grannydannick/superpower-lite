import { useQuery } from '@tanstack/react-query';

import { $api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

export type MarketplaceSummary =
  operations['marketplace.summary']['responses'][200]['content']['application/json'];

export const marketplaceSummaryQueryOptions = () =>
  $api.queryOptions('get', '/marketplace/summary');

export const useMarketplaceSummary = () => {
  return useQuery({
    ...marketplaceSummaryQueryOptions(),
  });
};
