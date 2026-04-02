import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type WearablesCitationResolved = {
  ok: true;
  resolvedAt: string;
  uri: string;
  kind: 'summary' | 'timeseries' | 'stream';
  resource: string;
  data: Record<string, unknown>;
};

export type WearablesCitationError = {
  ok: false;
  uri: string;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type WearablesCitationResolveResult =
  | WearablesCitationResolved
  | WearablesCitationError;

export const resolveWearablesCitation = (
  uri: string,
): Promise<WearablesCitationResolveResult> => {
  return api.get('/chat/wearables/citation/resolve', {
    params: { uri },
    headers: { 'x-hide-toast': 'true' },
  });
};

export const resolveWearablesCitationQueryOptions = (uri: string) => {
  return queryOptions({
    queryKey: ['wearables-citation', uri],
    queryFn: () => resolveWearablesCitation(uri),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    enabled: uri.length > 0,
  });
};

type UseResolveWearablesCitationOptions = {
  queryConfig?: QueryConfig<typeof resolveWearablesCitationQueryOptions>;
  uri: string;
};

export const useResolveWearablesCitation = ({
  queryConfig,
  uri,
}: UseResolveWearablesCitationOptions) => {
  return useQuery({
    ...resolveWearablesCitationQueryOptions(uri),
    ...queryConfig,
  });
};
