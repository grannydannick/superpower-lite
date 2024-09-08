import { Skeleton } from '@/components/ui/skeleton';
import { ENVIRONMENTAL_TOXIN_PANEL } from '@/const/toxin-panel';

import { useServices } from '../api/get-services';
import { customSort } from '../utils/sort';

import { ServiceCard } from './service-card';

export const ServicesList = () => {
  const servicesQuery = useServices();

  if (servicesQuery.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-1 sm:gap-x-3 sm:gap-y-9 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array(9)
          .fill(0)
          .map((_, i) => (
            <Skeleton
              className="h-[76px] w-full rounded-[20px] md:h-[386px] md:rounded-3xl"
              key={i}
            />
          ))}
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
