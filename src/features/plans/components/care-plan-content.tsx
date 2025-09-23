import moment from 'moment';
import { useEffect } from 'react';

import { Body1, H1 } from '@/components/ui/typography';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';

import { useCarePlan } from '../context/care-plan-context';
import { useProductAvailability } from '../hooks/use-product-availability';

import { HealthReportSection } from './sections/health-report-section';
import { MonitoredIssues } from './sections/monitored-issues';
import { NextStepsSection } from './sections/next-steps';
import { Overview } from './sections/overview';
import { ProtocolSection } from './sections/protocol';

export const CarePlanContent = () => {
  const { data } = useUser();
  const { plan, isAnnualReport } = useCarePlan();
  const { track } = useAnalytics();
  const { availableProducts } = useProductAvailability();

  // Track when user views action plan
  useEffect(() => {
    if (plan.id && availableProducts) {
      track('viewed_aiap', {
        action_plan_id: plan.id,
        recommended_products: availableProducts.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          discount: product.discount,
        })),
      });
    }
  }, [plan.id, availableProducts, track]);

  return (
    <div className="flex w-full flex-col gap-10 pb-24">
      <div>
        <H1 className="m-0 mb-4 !text-[40px] leading-none md:mb-0">
          {data?.firstName}&apos;s Action Plan
        </H1>
        <Body1 className="m-0 leading-none text-secondary">
          {moment(plan.period?.start).format('MMM Do, YYYY')}
        </Body1>
      </div>
      <Overview />
      {isAnnualReport && <HealthReportSection />}
      <MonitoredIssues />
      <ProtocolSection />
      <NextStepsSection />
    </div>
  );
};
