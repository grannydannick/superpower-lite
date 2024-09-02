import { QueryClient } from '@tanstack/react-query';

import { ContentLayout } from '@/components/layouts';
import { getServicesQueryOptions } from '@/features/services/api/get-services';
import { ServicesList } from '@/features/services/components/services-list';

export const servicesLoader = (queryClient: QueryClient) => async () => {
  const query = getServicesQueryOptions();

  return (
    queryClient.getQueryData(query.queryKey) ??
    (await queryClient.fetchQuery(query))
  );
};

export const ServicesRoute = () => {
  return (
    <ContentLayout title="Services">
      <ServicesList />
    </ContentLayout>
  );
};
