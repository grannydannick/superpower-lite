import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { useReportStore } from '@/features/onboarding-circle/stores/report-store';
import { ReportWrappedFlow } from '@/features/reports/components/report-wrapped-flow';

export const Route = createFileRoute('/_app/reports/$sourceId')({
  component: ReportRouteComponent,
});

function ReportRouteComponent() {
  const { sourceId } = Route.useParams();
  const navigate = useNavigate();
  const report = useReportStore((s) => s.reports[sourceId]);

  if (report == null || report.parsedReport == null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-950 text-white/50">
        Report not found
      </div>
    );
  }

  return (
    <ReportWrappedFlow
      report={report.parsedReport}
      sourceId={sourceId}
      onComplete={() => {
        void navigate({ to: '/' });
      }}
    />
  );
}
