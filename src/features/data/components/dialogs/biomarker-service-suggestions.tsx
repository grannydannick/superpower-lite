import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CUSTOM_BLOOD_PANEL_ID } from '@/const';
import { BookingStepID } from '@/features/orders/utils/get-steps-for-service';
import { useService } from '@/features/services/api';
import { ServiceSelectCard } from '@/features/services/components/service-select-card';

export const BiomarkerServiceSuggestions = ({
  recommendedTest,
}: {
  recommendedTest: string;
}) => {
  const navigate = useNavigate();

  const getServiceQuery = useService({
    serviceId: recommendedTest,
    method: 'IN_LAB',
  });

  if (getServiceQuery.isLoading) {
    return <Skeleton className="h-[106px] w-full rounded-[20px]" />;
  }

  const service = getServiceQuery.data?.service;

  if (!service) {
    return null;
  }

  return (
    <ServiceSelectCard
      service={service}
      displayPrice={false}
      toggle={() => {
        const params = new URLSearchParams({
          initialAddOnIds: `${service.id}`,
          excludeSteps: `${BookingStepID.INFO}, ${BookingStepID.RECOMMENDATIONS}`,
        });

        navigate(`/services/${CUSTOM_BLOOD_PANEL_ID}?${params.toString()}`);
      }}
      trigger={<Button size="small">Test now</Button>}
    />
  );
};
