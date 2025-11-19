import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useServices } from '@/features/services/api';
import { ServiceActionCard } from '@/features/services/components/service-action-card';
import { BiomarkerRecommendedTests } from '@/types/api';

import { getServiceActionUrl } from '../../utils/get-service-action-url';

export const BiomarkerServiceSuggestions = ({
  recommendedTests,
}: {
  recommendedTests: BiomarkerRecommendedTests;
}) => {
  const recommendedServiceIds = new Set(
    recommendedTests.services.map((s) => s.id),
  );

  return (
    <div className="space-y-2">
      <SuggestedServices serviceIds={recommendedServiceIds} />
    </div>
  );
};

const SuggestedServices = ({ serviceIds }: { serviceIds: Set<string> }) => {
  const navigate = useNavigate();
  const getServicesQuery = useServices({ group: 'blood-panel-addon' });

  if (getServicesQuery.isLoading) {
    return <Skeleton className="h-[106px] w-full rounded-[20px]" />;
  }

  const services = getServicesQuery.data?.services;

  if (!services) {
    return null;
  }

  const filteredServices = services.filter((s) => serviceIds.has(s.id));

  if (filteredServices.length === 0) return null;

  return filteredServices.map((s) => (
    <ServiceActionCard
      key={s.id}
      service={s}
      displayPrice={false}
      toggle={() => {
        navigate(getServiceActionUrl(s.id));
      }}
      trigger={<Button size="small">Test now</Button>}
    />
  ));
};
