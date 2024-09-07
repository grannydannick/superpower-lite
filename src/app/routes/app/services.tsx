import { QueryClient } from '@tanstack/react-query';

import { ContentLayout } from '@/components/layouts';
import { H3 } from '@/components/ui/typography';
import { getServicesQueryOptions } from '@/features/services/api/get-services';
import { OrdersList } from '@/features/services/components/orders-list';
import { ServicesList } from '@/features/services/components/services-list';

export const servicesLoader = (queryClient: QueryClient) => async () => {
  /**
   * Loads the services data only when the current URL does not include '/services'.
   * Services page is quite heavy and thus we want loading animations to happen directly in component rather then prefetch
   *
   * A bit hacky, any other solutions are welcome via PR =)
   */
  if (window.location.pathname.includes('/services')) {
    return null;
  }

  const query = getServicesQueryOptions();

  return (
    queryClient.getQueryData(query.queryKey) ??
    (await queryClient.fetchQuery(query))
  );
};

export const ServicesRoute = () => {
  return (
    <ContentLayout title="Services">
      {/* ORDERS */}
      <section id="orders" className="space-y-6">
        <H3>Your orders</H3>
        <OrdersList />
      </section>
      <section id="orders" className="space-y-6">
        <H3>Book a service</H3>
        <ServicesList />
      </section>
    </ContentLayout>
  );
};
