import { ContentLayout } from '@/components/layouts';
import { H1, H3 } from '@/components/ui/typography';
import { PlanCard } from '@/features/action-plan/components/plan-card';
import { CompletedOrdersList } from '@/features/home/components/orders-list';
import { UpcomingOrdersList } from '@/features/home/components/upcoming-orders';
import { useCurrentPatient } from '@/features/rdns/hooks/use-current-patient';
import useScrollToSection from '@/hooks/use-scroll-to-section';
import { useUser } from '@/lib/auth';

export const HomeRoute = () => {
  const { data: user } = useUser();
  const { selectedPatient } = useCurrentPatient();
  useScrollToSection();

  return (
    <ContentLayout title="Home" className="space-y-[64px] md:space-y-[130px]">
      <H1>
        Welcome back,
        <br />
        {selectedPatient ? selectedPatient.firstName : user?.firstName}
      </H1>
      <section id="results" className="space-y-4 md:space-y-8">
        <H3>Your results</H3>
        <CompletedOrdersList />
      </section>
      <section id="results" className="space-y-4 md:space-y-8">
        <H3>Upcoming</H3>
        <UpcomingOrdersList />
      </section>
      <section id="actions">
        <PlanCard />
      </section>
    </ContentLayout>
  );
};
