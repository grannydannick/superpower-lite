import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Biomarker } from '@/types/api';

export const getBiomarker = async ({
  id,
}: {
  id: string;
}): Promise<{ biomarker: Biomarker }> => {
  return await api.get(`/biomarkers/${id}`);
};

export const getBiomarkerQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ['biomarkers', id],
    queryFn: () => getBiomarker({ id }),
  });
};

type UseBiomarkerOptions = {
  id: string;
  queryConfig?: QueryConfig<typeof getBiomarkerQueryOptions>;
};

export const useBiomarker = ({ queryConfig, id }: UseBiomarkerOptions) => {
  return useQuery({
    ...getBiomarkerQueryOptions(id),
    ...queryConfig,
  });
};
