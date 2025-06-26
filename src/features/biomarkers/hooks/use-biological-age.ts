import { useUser } from '@/lib/auth';
import { yearsSinceDate } from '@/utils/format';

import { useBiomarkers } from '../api';
import { mostRecent } from '../utils/most-recent-biomarker';

export const useBiologicalAge = () => {
  const biomarkersQuery = useBiomarkers();
  const { data: user } = useUser();

  const biologicalAgeMarker = biomarkersQuery.data?.biomarkers.find(
    (b) => b.name == 'Biological Age',
  );
  const biologicalAge =
    mostRecent(biologicalAgeMarker?.value ?? [])?.quantity.value ?? null;

  const ageDifference = biologicalAge
    ? Math.round(
        (yearsSinceDate(user?.dateOfBirth ?? '') - biologicalAge) * 10,
      ) / 10.0
    : null;

  const isYounger =
    biologicalAge && biologicalAge < yearsSinceDate(user?.dateOfBirth ?? '');

  return {
    biologicalAge,
    ageDifference,
    isYounger,
    isLoading: biomarkersQuery.isLoading,
  };
};
