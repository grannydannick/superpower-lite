import { useParams } from 'react-router';

import { NotFoundRoute } from '@/app/routes/not-found';
import { ContentLayout } from '@/components/layouts';
import { Spinner } from '@/components/ui/spinner';
import { useMarketplace } from '@/features/marketplace/api/get-marketplace';
import { PrescriptionDetails } from '@/features/prescriptions/pdp/prescription-details';
import { getRecommendedPrescriptions } from '@/features/prescriptions/utils/get-recommended-prescriptions';

export const PrescriptionRoute = () => {
  const { id } = useParams();

  const { data, isError, isLoading } = useMarketplace();
  const prescription = data?.prescriptions?.find((item) => item.id === id);

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (isError || !prescription) {
    return <NotFoundRoute />;
  }

  const otherPopularPrescriptions = getRecommendedPrescriptions(
    data?.prescriptions ?? [],
  ).filter((item) => item.id !== prescription.id);

  return (
    <ContentLayout className="max-w-[1453px]">
      <PrescriptionDetails
        prescription={prescription}
        otherPopularPrescriptions={otherPopularPrescriptions}
      />
    </ContentLayout>
  );
};
