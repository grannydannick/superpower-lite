import { NavLink } from 'react-router-dom';

import { ContentLayout } from '@/components/layouts';
import { H1, H3 } from '@/components/ui/typography';
import { CompletedOrdersList } from '@/features/home/components/orders-list';
import { UpcomingOrdersList } from '@/features/home/components/upcoming-orders';
import { useUser } from '@/lib/auth';

export const HomeRoute = () => {
  const { data: user } = useUser();
  return (
    <ContentLayout title="" bgColor="zinc">
      <H1>
        Welcome back,
        <br />
        {user?.firstName}
      </H1>
      <NavLink to={'plans/68010af7-b2f7-437d-a4dc-4057053376da'}>test</NavLink>
      <section id="results" className="space-y-4 md:space-y-8">
        <H3>Your results</H3>
        <CompletedOrdersList />
      </section>
      <section id="results" className="space-y-4 md:space-y-8">
        <H3>Upcoming</H3>
        <UpcomingOrdersList />
      </section>
    </ContentLayout>
  );
};
