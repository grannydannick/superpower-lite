import { useDebouncedCallback } from 'use-debounce';
import { useShallow } from 'zustand/react/shallow';

import { Input } from '@/components/ui/input';
import { Disclaimer } from '@/features/action-plan/components/disclaimer';
import { BlockEditor } from '@/features/action-plan/components/editor/editor';
import { GoalsWrapper } from '@/features/action-plan/components/goals-wrapper';
import { HealthScore } from '@/features/action-plan/components/health-score';
import { PhilosophyBlocks } from '@/features/action-plan/components/philosophy-blocks';
import { RecommendedItems } from '@/features/action-plan/components/recommended-items';
import { ConsultationCard } from '@/features/action-plan/components/schedule-consultant-card';
import { ACTION_PLAN_INPUT_STYLE } from '@/features/action-plan/const/action-plan-input';
import { ACTION_PLAN_SAVE_DELAY } from '@/features/action-plan/const/delay';
import { usePlan } from '@/features/action-plan/stores/plan-store';

import { Header } from './header';

const REPORT_STYLE = 'space-y-8 rounded-3xl bg-white p-8 shadow-md md:p-12';

export const AnnualReportComponent = () => {
  const {
    annualReport,
    type,
    isAdmin,
    changeAnnualReportTitle,
    changeAnnualReportDescription,
    updateActionPlan,
  } = usePlan(useShallow((s) => s));

  const isAnnualReportType = type === 'ANNUAL_REPORT';

  const debouncedTitle = useDebouncedCallback(async (value) => {
    changeAnnualReportTitle(value);
    await updateActionPlan();
  }, ACTION_PLAN_SAVE_DELAY);

  if (!isAnnualReportType) {
    return null;
  }

  return (
    <div className="mb-10 w-full max-w-screen-md space-y-2.5">
      <Header />
      <div className={REPORT_STYLE}>
        <Input
          type="text"
          placeholder="Title"
          className={ACTION_PLAN_INPUT_STYLE}
          defaultValue={annualReport?.title}
          onChange={(e) => debouncedTitle(e.target.value)}
          disabled={!isAdmin}
        />

        <BlockEditor
          initialContent={annualReport?.description || ''}
          onUpdate={(content) => changeAnnualReportDescription(content)}
          className="py-0"
        />

        <PhilosophyBlocks philosophyBlocks={annualReport?.block || []} />

        <Disclaimer>
          <p className="text-zinc-500">
            The scores generated under Health Optimization, Environmental,
            Nutrition, Look and Feel are system-generated using unique data
            shared about your medical history and health background. This report
            is exclusively intended to be used for health optimization and
            wellness purposes. These scores are not intended to diagnose or
            treat disease, or to substitute a physicianʼs consultation. These
            insights are determined by evaluating current research and may
            change over time to reflect the most up to date research available.
          </p>
        </Disclaimer>
      </div>
      <HealthScore className={REPORT_STYLE} />
      <GoalsWrapper title="Monitored issues" goalType="ANNUAL_REPORT_PRIMARY" />
      <GoalsWrapper title="Your protocol" goalType="ANNUAL_REPORT_PROTOCOLS" />
      <ConsultationCard className={REPORT_STYLE} />
      <RecommendedItems className={REPORT_STYLE} />
    </div>
  );
};
