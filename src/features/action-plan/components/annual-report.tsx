import { useDebouncedCallback } from 'use-debounce';

import { Input } from '@/components/ui/input';
import { CoreMonitoredIssues } from '@/features/action-plan/components/core-monitored-issues';
import { Disclaimer } from '@/features/action-plan/components/disclaimer';
import { BlockEditor } from '@/features/action-plan/components/editor/editor';
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
  const annualReport = usePlan((s) => s.annualReport);
  const isAnnualReportType = usePlan((s) => s.type === 'ANNUAL_REPORT');
  const annualReportBlocks = usePlan((s) => s.annualReport?.block || []);
  const isAdmin = usePlan((s) => s.isAdmin);
  const changeAnnualReportTitle = usePlan((s) => s.changeAnnualReportTitle);
  const changeAnnualReportDescription = usePlan(
    (s) => s.changeAnnualReportDescription,
  );
  const updateActionPlan = usePlan((s) => s.updateActionPlan);

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

        <PhilosophyBlocks philosophyBlocks={annualReportBlocks} />

        <Disclaimer />
      </div>
      <HealthScore className={REPORT_STYLE} />
      <CoreMonitoredIssues
        title={'Monitored issues'}
        goalType={'ANNUAL_REPORT_PRIMARY'}
      />
      <CoreMonitoredIssues
        title={'Your protocol'}
        goalType={'ANNUAL_REPORT_PROTOCOLS'}
      />
      <ConsultationCard className={REPORT_STYLE} />
      <RecommendedItems className={REPORT_STYLE} />
    </div>
  );
};
