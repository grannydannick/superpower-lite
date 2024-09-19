import { QueryClient } from '@tanstack/react-query';

import { ContentLayout } from '@/components/layouts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getServicesQueryOptions } from '@/features/services/api/get-services';
import { FinishScheduleList } from '@/features/services/components/finish-schedule-list';
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
      <section id="orders" className="space-y-6">
        <Tabs defaultValue="all" className="overflow-auto">
          <TabsList className="flex w-fit items-center justify-start overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="schedule">To be scheduled</TabsTrigger>
            <TabsTrigger value="orders">Your orders</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="py-6 md:py-[72px]">
            <ServicesList />
          </TabsContent>
          <TabsContent value="schedule" className="py-6 md:py-[72px]">
            <FinishScheduleList />
          </TabsContent>
          <TabsContent value="orders" className="py-6 md:py-[72px]">
            <OrdersList />
          </TabsContent>
        </Tabs>
      </section>
    </ContentLayout>
  );
};
