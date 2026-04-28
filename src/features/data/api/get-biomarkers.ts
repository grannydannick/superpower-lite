import { queryOptions, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

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

// TODO: Move this into backend when we have the capacity for it
const filterBiomarkersByGender = (
  data: { biomarkers: Biomarker[] },
  gender: string | undefined,
): { biomarkers: Biomarker[] } => {
  const normalized = gender?.toLowerCase();
  if (normalized !== 'female' && normalized !== 'male') {
    return data;
  }

  const biomarkers = data.biomarkers.filter((biomarker) => {
    if (
      normalized === 'female' &&
      FILTERED_FEMALE_BIOMARKERS.includes(biomarker.name)
    ) {
      return false;
    }

    if (
      normalized === 'male' &&
      FILTERED_MALE_BIOMARKERS.includes(biomarker.name)
    ) {
      return false;
    }

    return true;
  });

  if (biomarkers.length === data.biomarkers.length) {
    return data;
  }

  return {
    ...data,
    biomarkers,
  };
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
  const gender = user?.gender;

  const query = useQuery({
    ...getBiomarkersQueryOptions(category),
    ...queryConfig,
  });

  const filteredData = useMemo(() => {
    if (!query.data) return query.data;
    return filterBiomarkersByGender(query.data, gender);
  }, [query.data, gender]);

  const { refetch: queryRefetch } = query;
  const refetch: typeof queryRefetch = useCallback(
    async (options) => {
      const result = await queryRefetch(options);
      if (!result.data) return result;
      return { ...result, data: filterBiomarkersByGender(result.data, gender) };
    },
    [queryRefetch, gender],
  );

  return {
    ...query,
    refetch,
    data: filteredData,
  };
};
