import { ChevronRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Body2, H4 } from '@/components/ui/typography';
import { PlanHealthScore } from '@/features/plans/components/annual-report/plan-health-score';
import { useLatestCompletedPlan } from '@/features/plans/hooks/use-latest-completed-plan';
import { useUser } from '@/lib/auth';

import { DigitalTwinPreviewMobile } from '../components/digital-twin-preview-mobile';
import { HomepageCard } from '../components/homepage-card';

export const AiapSummaryCardWeb = () => {
  const { data: user } = useUser();
  const { data: latestPlan } = useLatestCompletedPlan();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <HomepageCard
      titleClassName="mb-4 hidden md:block"
      title={`Welcome back, ${user?.firstName ?? ''}`}
      className="relative overflow-hidden"
    >
      {/* Mobile digital twin preview */}
      <div className="lg:hidden">
        <DigitalTwinPreviewMobile />
      </div>

      <PlanHealthScore showOverview={false} />
      {latestPlan && (
        <Link
          to={`/plans/${latestPlan.id}`}
          className="relative mt-2 flex flex-col overflow-hidden rounded-2xl border border-zinc-200 p-4"
        >
          <div className="absolute -bottom-12 -right-40 h-[113.593px] w-[271.631px] shrink-0 rotate-[340.629deg] rounded-[271.631px] bg-[#FFA702] blur-[20.624px]" />
          <H4 className="relative z-10">
            Review your action plan{' '}
            <ChevronRightIcon className="inline size-4" />
          </H4>
          <Body2 className="relative z-10 text-zinc-400">
            Updated {formatDate(latestPlan.period?.start)}
          </Body2>
          <div className="absolute -right-1 top-0 h-full w-32 shrink-0">
            <img
              src="/home/action-plan.png"
              alt="Action plan illustration"
              className="size-full object-contain object-right"
            />
          </div>
        </Link>
      )}
    </HomepageCard>
  );
};
