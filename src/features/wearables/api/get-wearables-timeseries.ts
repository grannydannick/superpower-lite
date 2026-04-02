import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type WearablesTimeseriesParams = {
  resource: string;
  startDate?: string;
  endDate?: string;
  provider?: string;
};

export type WearablesTimeseriesResponse = {
  resource: string;
  items: Record<string, any>[];
  window: { startDate: string; endDate: string };
  errors: Array<{ resource: string; name: string; message: string }>;
};

export const getWearablesTimeseries = async (
  params: WearablesTimeseriesParams,
): Promise<WearablesTimeseriesResponse> => {
  const raw: WearablesTimeseriesResponse = await api.get(
    '/chat/wearables/timeseries',
    { params },
  );
  // Backend returns items as { data: {...} } wrappers — unwrap for metric accessors
  return {
    ...raw,
    items: (raw.items ?? []).map(
      (item: Record<string, any>) => item.data ?? item,
    ),
  };
};

export const getWearablesTimeseriesQueryOptions = (
  params: WearablesTimeseriesParams,
) => {
  return queryOptions({
    queryKey: [
      'wearables-timeseries',
      params.resource,
      params.startDate,
      params.endDate,
      params.provider,
    ],
    queryFn: () => getWearablesTimeseries(params),
    placeholderData: (prev) => prev,
  });
};

type UseWearablesTimeseriesOptions = {
  params: WearablesTimeseriesParams;
  queryConfig?: QueryConfig<typeof getWearablesTimeseriesQueryOptions>;
  enabled?: boolean;
};

export const useWearablesTimeseries = ({
  params,
  queryConfig,
  enabled = true,
}: UseWearablesTimeseriesOptions) => {
  return useQuery({
    ...getWearablesTimeseriesQueryOptions(params),
    ...queryConfig,
    enabled,
  });
};
