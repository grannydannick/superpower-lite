import { Spinner } from '@/components/ui/spinner';
import { ENVIRONMENTAL_TOXIN_PANEL } from '@/const/toxin-panel';

import { useServices } from '../api/get-services';
import { customSort } from '../utils/sort';

import { ServiceCard } from './service-card';

export const ServicesList = () => {
  const servicesQuery = useServices();

  if (servicesQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  if (!servicesQuery.data) return null;

  const filteredServices = servicesQuery.data.services
    .filter(
      (healthcareService) =>
        !ENVIRONMENTAL_TOXIN_PANEL.find(
          (panel) => panel.name === healthcareService.name,
        ),
    )
    .sort(customSort);

  return (
    <div className="grid grid-cols-1 gap-1 sm:gap-x-3 sm:gap-y-9 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredServices.map((service, i: number) => (
        <ServiceCard key={i} service={service} />
      ))}
    </div>
  );
};
