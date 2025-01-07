import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Body1 } from '@/components/ui/typography';
import { ADVISORY_CALL } from '@/const';
import { usePlans } from '@/features/action-plan/api';
import { LatestPlanRecommended } from '@/features/home/components/latest-plan-recommended';
import { useOrders } from '@/features/orders/api';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { useServices } from '@/features/services/api';
import { OrderStatus } from '@/types/api';

export const ForYouList = () => {
  const servicesQuery = useServices();
  const ordersQuery = useOrders();
  const plansQuery = usePlans();

  const consult = servicesQuery.data?.services.find(
    (s) => s.name === ADVISORY_CALL,
  );

  if (!consult) return null;

  const consultOrder = ordersQuery.data?.orders.find(
    (o) => o.name === ADVISORY_CALL && o.status !== OrderStatus.draft,
  );

  const plans = plansQuery.data?.actionPlans ?? [];
  const mostRecentPlan = plans.length > 0 ? plans[0] : undefined;

  const noConsultFound = (
    <div className="space-y-3 rounded-3xl border border-zinc-200 p-5">
      <img
        className="size-12 rounded-lg object-cover"
        src={consult.image}
        alt={consult.name}
      />
      <Body1 className="text-zinc-500">
        Schedule your consult to get recommendations by your longevity advisor
      </Body1>
      <HealthcareServiceDialog healthcareService={consult}>
        <Button
          variant="ghost"
          className="gap-1 p-0 text-base text-zinc-400 hover:text-zinc-900"
        >
          Get started
          <ChevronRight className="size-4" />
        </Button>
      </HealthcareServiceDialog>
    </div>
  );

  const consultFound = (
    <div className="flex h-[188px] flex-col justify-center space-y-3 rounded-3xl border border-zinc-200 p-5">
      <Body1 className="text-center text-zinc-400">
        We will update this section with any next steps recommended by your
        longevity advisor
      </Body1>
    </div>
  );

  if (consultOrder) {
    if (mostRecentPlan && mostRecentPlan.published) {
      return <LatestPlanRecommended plan={mostRecentPlan} />;
    }

    return consultFound;
  }

  return noConsultFound;
};
