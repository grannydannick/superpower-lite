import { Spinner } from '@/components/ui/spinner';
import { HealthcareService } from '@/types/api';

import { useServices } from '../api/get-services';

import { ServiceCard } from './service-card';

export const ServicesList = () => {
  const servicesQuery = useServices();

  if (servicesQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!servicesQuery.data) return null;

  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-9 lg:grid-cols-3 xl:grid-cols-4">
      {servicesQuery.data.map((service: HealthcareService, i: number) => (
        <ServiceCard key={i} serviceId={service.id} />
      ))}
    </div>
  );
};
