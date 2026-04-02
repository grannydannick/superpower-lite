import { useQuery } from '@tanstack/react-query';

import { $api } from '@/orpc/client';
import type { operations } from '@/orpc/types.generated';

type GetRedrawsResponse =
  operations['redraw.getRedraws']['responses'][200]['content']['application/json'];

export type MemberRedraw = GetRedrawsResponse['redraws'][number];
export type RedrawStatus = MemberRedraw['redrawStatus'];

export const getRedrawsQueryOptions = () => {
  return $api.queryOptions('get', '/redraw');
};

export function useRedraws(options?: { enabled?: boolean }) {
  return useQuery({
    ...getRedrawsQueryOptions(),
    enabled: options?.enabled ?? true,
  });
}
