import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { File } from '@/types/api';

const EXTRACTION_POLL_INTERVAL = 5000;

const getFiles = (page = 1): Promise<{ files: File[] }> => {
  return api.get(`/files`, {
    params: {
      page,
    },
  });
};

export const getFilesQueryOptions = ({ page }: { page?: number } = {}) => {
  return queryOptions({
    queryKey: page ? ['files', { page }] : ['files'],
    queryFn: () => getFiles(page),
  });
};

const hasInProgressExtractions = (files: File[]): boolean => {
  return files.some(
    (f) =>
      f.ingestion?.extraction?.status === 'registered' ||
      f.ingestion?.extraction?.status === 'processing',
  );
};

type UseFilesOptions = {
  page?: number;
  queryConfig?: QueryConfig<typeof getFilesQueryOptions>;
};

export const useFiles = ({ queryConfig, page }: UseFilesOptions = {}) => {
  return useQuery({
    ...getFilesQueryOptions({ page }),
    ...queryConfig,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && hasInProgressExtractions(data.files)) {
        return EXTRACTION_POLL_INTERVAL;
      }
      return false;
    },
  });
};
