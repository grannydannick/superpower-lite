import { queryOptions, useQuery } from '@tanstack/react-query';

import { biologicalAgeBiomarker } from '@/features/biomarkers/utils/biological-age-biomarker';
import { paceOfAgingBiomarker } from '@/features/biomarkers/utils/pace-of-aging-biomarker';
import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';
import { QueryConfig } from '@/lib/react-query';
import { Biomarker } from '@/types/api';

export const getBiomarkers = async ({
  dateOfBirth,
}: {
  dateOfBirth?: string;
  gender?: string;
}): Promise<{ biomarkers: Biomarker[] }> => {
  const response: { biomarkers: Biomarker[] } = await api.get('/biomarkers');

  if (response.biomarkers) {
    // if dateOfBirth is provided, add special biomarkers at the beginning of the list
    if (dateOfBirth) {
      const bioAgeMarker = biologicalAgeBiomarker(
        response.biomarkers,
        dateOfBirth,
      );
      const paceBiomarker = paceOfAgingBiomarker(
        response.biomarkers,
        dateOfBirth,
      );

      // add the pace and biological age markers to the start of the biomarkers array
      response.biomarkers.unshift(...[bioAgeMarker, paceBiomarker]);
    }
  }

  return response;
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

  return useQuery({
    ...getBiomarkersQueryOptions(user?.dateOfBirth),
    ...queryConfig,
  });
};
