import { queryOptions, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';
import { QueryConfig } from '@/lib/react-query';
import { Biomarker } from '@/types/api';

import {
  FILTERED_FEMALE_BIOMARKERS,
  FILTERED_MALE_BIOMARKERS,
} from '../const/filters';

export const getBiomarkers = async ({
  category,
}: {
  gender?: string;
  category?: string;
}): Promise<{ biomarkers: Biomarker[] }> => {
  return await api.get('/biomarkers', {
    params: { category },
  });
};

export const getBiomarkersQueryOptions = (category?: string) => {
  return queryOptions({
    queryKey: ['biomarkers', category],
    queryFn: () => getBiomarkers({ category }),
  });
};

type UseBiomarkersOptions = {
  queryConfig?: QueryConfig<typeof getBiomarkersQueryOptions>;
  category?: string;
};

export const useBiomarkers = ({
  queryConfig,
  category,
}: UseBiomarkersOptions = {}) => {
  const { data: user } = useUser();

  const query = useQuery({
    ...getBiomarkersQueryOptions(category),
    ...queryConfig,
  });

  // TODO: Move this into backend when we have the capacity for it
  const filteredData = useMemo(() => {
    if (!query.data) return query.data;

    const gender = user?.gender?.toLowerCase();

    if (gender !== 'female' && gender !== 'male') {
      return query.data;
    }

    const biomarkers = query.data.biomarkers.filter((biomarker) => {
      if (
        gender === 'female' &&
        FILTERED_FEMALE_BIOMARKERS.includes(biomarker.name)
      ) {
        return false;
      }

      if (
        gender === 'male' &&
        FILTERED_MALE_BIOMARKERS.includes(biomarker.name)
      ) {
        return false;
      }

      return true;
    });

    if (biomarkers.length === query.data.biomarkers.length) {
      return query.data;
    }

    return {
      ...query.data,
      biomarkers,
    };
  }, [query.data, user?.gender]);

  return {
    ...query,
    data: filteredData,
  };
};
