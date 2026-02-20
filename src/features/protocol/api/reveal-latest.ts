import { $api } from '@/orpc/client';

export const revealLatestQueryOptions = $api.queryOptions(
  'post',
  '/protocol/reveal/latest',
);

export const revealLatestQueryKey = revealLatestQueryOptions.queryKey;
