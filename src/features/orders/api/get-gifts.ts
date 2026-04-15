import { useQuery } from '@tanstack/react-query';

import { $api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

type GetGiftsResponse =
  operations['gifts.listGifts']['responses'][200]['content']['application/json'];

export type Gift = GetGiftsResponse['gifts'][number];

export const getGiftsQueryOptions = () => {
  return $api.queryOptions('get', '/gifts');
};

export function useGifts(options?: { enabled?: boolean }) {
  return useQuery({
    ...getGiftsQueryOptions(),
    enabled: options?.enabled ?? true,
  });
}
