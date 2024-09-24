import { Input } from '@/components/ui/input';
import { CoreMonitoredIssues } from '@/features/action-plan/components/core-monitored-issues';
import { BlockEditor } from '@/features/action-plan/components/editor/editor';
import { PhilosophyBlocks } from '@/features/action-plan/components/philosophy-blocks';
import { Protocol } from '@/features/action-plan/components/protocol';
import { SecondaryIssues } from '@/features/action-plan/components/secondary-issues';
import { ACTION_PLAN_INPUT_STYLE } from '@/features/action-plan/const/action-plan-input';
import { usePlan } from '@/features/action-plan/stores/plan-store';

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

  if (!isAnnualReportType) {
    return null;
  }

  return (
    <div className="mb-10 w-full max-w-[728px] space-y-2.5">
      <div className={REPORT_STYLE}>
        <Input
          type="text"
          placeholder="Title"
          className={ACTION_PLAN_INPUT_STYLE}
          value={annualReport?.title}
          onChange={(e) => changeAnnualReportTitle(e.target.value)}
          disabled={!isAdmin}
        />

        <BlockEditor
          initialContent={annualReport?.description || ''}
          onUpdate={(content) => changeAnnualReportDescription(content)}
          className="py-0"
        />

        <PhilosophyBlocks philosophyBlocks={annualReportBlocks} />
      </div>
      <CoreMonitoredIssues className={REPORT_STYLE} />
      <SecondaryIssues className={REPORT_STYLE} />
      <Protocol className={REPORT_STYLE} />
    </div>
  );
};
