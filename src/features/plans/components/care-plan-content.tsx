import moment from 'moment';
import { useEffect } from 'react';

import { AIIcon } from '@/components/icons/ai-icon';
import { Body1, H1 } from '@/components/ui/typography';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';

import { useCarePlan } from '../context/care-plan-context';
import { useProductAvailability } from '../hooks/use-product-availability';

import { MonitoredIssues } from './sections/monitored-issues';
import { NextStepsSection } from './sections/next-steps';
import { ProtocolSection } from './sections/protocol';

export const CarePlanContent = () => {
  const { data } = useUser();
  const { plan } = useCarePlan();
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
        <div className="flex flex-wrap items-center gap-2">
          {/* Server renders in UTC, we should be consistent with this */}
          <Body1 className="m-0 leading-none text-secondary">
            {moment.utc(plan.period?.start).format('MMM Do, YYYY')}
          </Body1>
          <div className="-mt-px size-[3px] rounded-full bg-secondary" />
          <div className="flex items-center gap-1">
            <AIIcon className="-mt-px size-5 shrink-0" />
            <Body1 className="text-secondary">
              Written by Superpower’s proprietary AI
            </Body1>
          </div>
        </div>
      </div>
      <MonitoredIssues />
      <ProtocolSection />
      <NextStepsSection />
    </div>
  );
};
