import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { PhlebotomyLocation } from '@/types/api';

export const getPhlebotomyLocations = ({
  postalCode,
}: {
  postalCode: string;
}): Promise<{ locations: PhlebotomyLocation[] }> => {
  return api.get(`/phlebotomy/locations?postalCode=${postalCode}`);
};

export const getPhlebotomyLocationsQueryOptions = (postalCode: string) => {
  return queryOptions({
    queryKey: ['phlebotomyLocations', postalCode],
    queryFn: () => getPhlebotomyLocations({ postalCode }),
  });
};

type UsePhlebotomyLocationsOptions = {
  postalCode: string;
  queryConfig?: QueryConfig<typeof getPhlebotomyLocationsQueryOptions>;
};

export const usePhlebotomyLocations = ({
  postalCode,
  queryConfig,
}: UsePhlebotomyLocationsOptions) => {
  return useQuery({
    ...getPhlebotomyLocationsQueryOptions(postalCode),
    ...queryConfig,
  });
};
