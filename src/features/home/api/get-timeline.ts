import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { TimelineItem } from '@/types/api';

export const getTimeline = (page = 1): Promise<TimelineItem[]> => {
  return api.get(`/timeline`, {
    params: {
      page,
    },
  });
};

export const getTimelineQueryOptions = ({ page }: { page?: number } = {}) => {
  return queryOptions({
    queryKey: page ? ['timeline', { page }] : ['timeline'],
    queryFn: () => getTimeline(page),
  });
};

type UseTimelineOptions = {
  page?: number;
  queryConfig?: QueryConfig<typeof getTimelineQueryOptions>;
};

export const useTimeline = ({ queryConfig, page }: UseTimelineOptions = {}) => {
  return useQuery({
    ...getTimelineQueryOptions({ page }),
    ...queryConfig,
  });
};
