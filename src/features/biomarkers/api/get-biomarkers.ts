import { queryOptions, useQuery } from '@tanstack/react-query';

import { biologicalAgeBiomarker } from '@/features/biomarkers/utils/biological-aging-biomarker';
import { filterBiomarkersByGender } from '@/features/biomarkers/utils/filter-biomarkers-by-gender';
import { orderBiomarkerCards } from '@/features/biomarkers/utils/order-biomarker-cards';
import { paceOfAgingBiomarker } from '@/features/biomarkers/utils/pace-of-aging-biomarker';
import { useCurrentPatient } from '@/features/rdns/hooks/use-current-patient';
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
    response.biomarkers = orderBiomarkerCards(response.biomarkers);

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
  const { selectedPatient } = useCurrentPatient();

  /**
   * If RDN selected patient, we should use patient's data to calculate pace of aging and bio age
   */
  const dateOfBirth = selectedPatient
    ? selectedPatient.dateOfBirth
    : user?.dateOfBirth;

  const gender = selectedPatient ? selectedPatient.gender : user?.gender;

  return useQuery({
    ...getBiomarkersQueryOptions(dateOfBirth, gender),
    ...queryConfig,
  });
};
