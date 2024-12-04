import { queryOptions, useQuery } from '@tanstack/react-query';

import { biologicalAgeBiomarker } from '@/features/biomarkers/utils/biological-aging-biomarker';
import { filterBiomarkersByGender } from '@/features/biomarkers/utils/filter-biomarkers-by-gender';
import { orderBiomarkerCards } from '@/features/biomarkers/utils/order-biomarker-cards';
import { paceOfAgingBiomarker } from '@/features/biomarkers/utils/pace-of-aging-biomarker';
import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';
import { QueryConfig } from '@/lib/react-query';
import { Biomarker } from '@/types/api';

export const getBiomarkers = async ({
  dateOfBirth,
  gender,
}: {
  dateOfBirth?: string;
  gender?: string;
}): Promise<{ biomarkers: Biomarker[] }> => {
  const response: { biomarkers: Biomarker[] } = await api.get('/biomarkers');

  if (response.biomarkers) {
    // Order the biomarkers
    response.biomarkers = orderBiomarkerCards(response.biomarkers);

    // If dateOfBirth is provided, add special biomarkers at the beginning of the list
    if (dateOfBirth) {
      const bioAgeMarker = biologicalAgeBiomarker(
        response.biomarkers,
        dateOfBirth,
      );
      const paceBiomarker = paceOfAgingBiomarker(
        response.biomarkers,
        dateOfBirth,
      );

      // Add the pace and biological age markers to the start of the biomarkers array
      response.biomarkers.unshift(paceBiomarker);
      response.biomarkers.unshift(bioAgeMarker);
    }

    response.biomarkers = filterBiomarkersByGender(response.biomarkers, gender);
  }

  return response;
};

export const getBiomarkersQueryOptions = (
  dateOfBirth?: string,
  gender?: string,
) => {
  return queryOptions({
    queryKey: ['biomarkers'],
    queryFn: () => getBiomarkers({ dateOfBirth, gender }),
  });
};

type UseBiomarkersOptions = {
  queryConfig?: QueryConfig<typeof getBiomarkersQueryOptions>;
};

export const useBiomarkers = ({ queryConfig }: UseBiomarkersOptions = {}) => {
  const { data: user } = useUser();

  return useQuery({
    ...getBiomarkersQueryOptions(user?.dateOfBirth, user?.gender),
    ...queryConfig,
  });
};
