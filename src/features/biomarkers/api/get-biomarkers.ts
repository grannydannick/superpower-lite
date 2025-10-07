import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';
import { QueryConfig } from '@/lib/react-query';
import { Biomarker } from '@/types/api';

import {
  FILTERED_FEMALE_BIOMARKERS,
  FILTERED_MALE_BIOMARKERS,
} from '../const/filters';

export const getBiomarkers = async ({
  dateOfBirth,
}: {
  dateOfBirth?: string;
  gender?: string;
}): Promise<{ biomarkers: Biomarker[] }> => {
  return await api.get('/biomarkers', {
    params: { dateOfBirth },
  });
};

export const getBiomarkersQueryOptions = (dateOfBirth?: string) => {
  return queryOptions({
    queryKey: ['biomarkers'],
    queryFn: () => getBiomarkers({ dateOfBirth }),
  });
};

type UseBiomarkersOptions = {
  queryConfig?: QueryConfig<typeof getBiomarkersQueryOptions>;
};

export const useBiomarkers = ({ queryConfig }: UseBiomarkersOptions = {}) => {
  const { data: user } = useUser();

  const query = useQuery({
    ...getBiomarkersQueryOptions(user?.dateOfBirth),
    ...queryConfig,
  });

  // TODO: Move this into backend when we have the capacity for it
  const filteredData = query.data
    ? {
        ...query.data,
        biomarkers: query.data.biomarkers.filter((biomarker) => {
          if (
            user?.gender.toLowerCase() === 'female' &&
            FILTERED_FEMALE_BIOMARKERS.includes(biomarker.name)
          ) {
            return false;
          }

          if (
            user?.gender.toLowerCase() === 'male' &&
            FILTERED_MALE_BIOMARKERS.includes(biomarker.name)
          ) {
            return false;
          }

          return true;
        }),
      }
    : query.data;

  return {
    ...query,
    data: filteredData,
  };
};
