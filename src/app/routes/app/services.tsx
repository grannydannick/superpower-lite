import { ContentLayout } from '@/components/layouts';
import { Header } from '@/components/shared/header';
import {
  TabsContent,
  TabsList,
  TabsTrigger,
  URLTabs,
} from '@/components/ui/tabs';
import { FinishScheduleList } from '@/features/services/components/finish-schedule-list';
import { MarketplaceList } from '@/features/services/components/marketplace-list';
import { OrdersList } from '@/features/services/components/orders-list';
import { ServicesList } from '@/features/services/components/services-list';

export const ServicesRoute = () => {
  return (
    <ContentLayout title="Services">
      <Header title="Services" />
      <section id="orders" className="space-y-6">
        <URLTabs>
          <TabsList className="flex w-fit items-center justify-start overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="schedule">To be scheduled</TabsTrigger>
            <TabsTrigger value="orders">Your orders</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="py-6 md:py-[72px]">
            <MarketplaceList />
            <ServicesList />
          </TabsContent>
          <TabsContent value="schedule" className="py-6 md:py-[72px]">
            <FinishScheduleList />
          </TabsContent>
          <TabsContent value="orders" className="py-6 md:py-[72px]">
            <OrdersList />
          </TabsContent>
        </URLTabs>
      </section>
    </ContentLayout>
  );
};
