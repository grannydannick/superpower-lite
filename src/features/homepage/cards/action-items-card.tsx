import { useNavigate } from '@tanstack/react-router';
import { Check, ChevronRight, Loader2, Lock } from 'lucide-react';
import { type ReactElement } from 'react';

import { ActionableAccordion } from '@/components/shared/actionable-accordion';
import { Body1, Body2 } from '@/components/ui/typography';
import { ReportRunner } from '@/features/onboarding-circle/components/report-runner';
import type { SourceId } from '@/features/onboarding-circle/const/sources';
import { useOnboardingCircleStore } from '@/features/onboarding-circle/stores/onboarding-circle-store';
import { useReportStore } from '@/features/onboarding-circle/stores/report-store';

const COMBINED_REPORT = {
  title: 'Your Pre-Protocol Primer is ready',
  preview:
    "We've connected the dots across your wearables, labs, health history, and goals. Here's what we see before your protocol begins — and what to watch for.",
};

const MOCK_PREVIEWS: Record<string, string> = {
  wearables:
    "Sleep efficiency averaged 78% with a declining HRV trend. We'll cross-reference this with your upcoming bloodwork to check for cortisol or thyroid links.",
  labs: 'Fasting glucose trending up across 3 draws. Combined with your wearable sleep data, this points to a recovery pattern worth addressing in your protocol.',
  'ai-context':
    "You've flagged stress, low energy, and focus issues across conversations. Mapped against your intake and wearable data, these cluster around a stress-recovery axis.",
};

// Only wearables gets a background report — labs and import happen inline in the chat thread
const WEARABLES_REPORT_PROMPT =
  'Generate a wearable data insight report. Analyze my sleep, HRV, heart rate, steps, and activity data from my connected wearable. Cross-reference with any other data you have about me — my intake, health goals, symptoms, and any prior labs. Highlight: 1) Key patterns in my wearable data, 2) What these patterns might mean for my upcoming bloodwork, 3) One specific thing I should focus on this week based on the data. Be specific with numbers.';

const COMBINED_PROMPT =
  'Generate my Pre-Protocol Primer — a comprehensive report synthesizing ALL my data before my protocol begins. Connect the dots across my wearable data (sleep, HRV, activity), my lab results and biomarker trends, my health intake (symptoms, goals, medical history), and my imported health conversations. Structure it as: 1) Your health snapshot — key findings across all data sources, 2) Patterns — connections between your daily data and your bloodwork, 3) What your protocol will likely target based on this picture, 4) Three things to focus on right now while you wait for your protocol. Be specific with numbers, timeframes, and data points. This is the most important report — it ties everything together.';

interface ActionDef {
  id: string;
  sourceId: SourceId;
  title: string;
  completedTitle: string;
  description: string;
  imageSrc: string;
  pendingRoute: { to: string; search?: Record<string, string> };
  /** If true, report is generated via background chat. If false, report is inline in the concierge thread. */
  backgroundReport: boolean;
}

const ACTION_DEFS: ActionDef[] = [
  {
    id: 'connect-wearables',
    sourceId: 'wearables',
    title: 'Connect your wearables',
    completedTitle: 'Wearables connected, see report →',
    description:
      'Link Oura, Whoop, or Apple Health to get daily insights that connect your sleep, HRV, and activity to your lab results.',
    imageSrc: '/data/wearables.webp',
    pendingRoute: { to: '/settings', search: { tab: 'integrations' } },
    backgroundReport: true,
  },
  {
    id: 'upload-labs',
    sourceId: 'labs',
    title: 'Unlock your health trends',
    completedTitle: 'Labs are synced, see report →',
    description:
      "Upload past lab results and we'll show you how your biomarkers have changed over time.",
    imageSrc: '/data/file-stack.webp',
    pendingRoute: { to: '/concierge', search: { preset: 'upload-labs' } },
    backgroundReport: false,
  },
  {
    id: 'import-memory',
    sourceId: 'ai-context',
    title: 'Bring your health context',
    completedTitle: 'Health context imported, see report →',
    description:
      'Already use ChatGPT or Claude for health? Import those conversations so your AI coach knows your full story.',
    imageSrc: '/concierge/other_llms.webp',
    pendingRoute: { to: '/concierge', search: { preset: 'import-memory' } },
    backgroundReport: false,
  },
];

/**
 * Determine if any action is currently "busy" — either generating a background
 * report or the user is in the middle of a chat-based action (marked complete
 * but no report yet for non-background actions).
 */
function hasActiveAction(
  completedSources: Set<SourceId>,
  reports: Record<string, { threadId: string; status: string }>,
): boolean {
  for (const def of ACTION_DEFS) {
    const isComplete = completedSources.has(def.sourceId);
    const report = reports[def.sourceId];

    if (!isComplete) continue;

    // Background report still generating
    if (
      def.backgroundReport &&
      (report == null || report.status === 'generating')
    ) {
      return true;
    }

    // Chat-based action: completed but report not marked ready yet
    if (
      !def.backgroundReport &&
      (report == null || report.status !== 'ready')
    ) {
      return true;
    }
  }
  return false;
}

export const ActionItemsCard = () => {
  const navigate = useNavigate();
  const completedSources = useOnboardingCircleStore((s) => s.completedSources);
  const completeSource = useOnboardingCircleStore((s) => s.complete);
  const resetOnboarding = useOnboardingCircleStore((s) => s.reset);
  const reports = useReportStore((s) => s.reports);
  const startReport = useReportStore((s) => s.startReport);
  const completeReport = useReportStore((s) => s.completeReport);
  const resetReports = useReportStore((s) => s.reset);

  const allComplete = ACTION_DEFS.every((a) =>
    completedSources.has(a.sourceId),
  );
  const isBusy = hasActiveAction(completedSources, reports);

  const handleReset = () => {
    resetOnboarding();
    resetReports();
  };

  // Background report runner for wearables
  const runners: ReactElement[] = [];
  const wearablesReport = reports['wearables'];
  if (wearablesReport != null && wearablesReport.status === 'generating') {
    runners.push(
      <ReportRunner
        key="runner-wearables"
        sourceId="wearables"
        threadId={wearablesReport.threadId}
        prompt={WEARABLES_REPORT_PROMPT}
      />,
    );
  }

  // Combined report runner
  const combinedReport = reports['combined' as SourceId];
  if (combinedReport != null && combinedReport.status === 'generating') {
    runners.push(
      <ReportRunner
        key="runner-combined"
        sourceId={'combined' as SourceId}
        threadId={combinedReport.threadId}
        prompt={COMBINED_PROMPT}
      />,
    );
  }

  // All complete → combined report
  if (allComplete) {
    if (combinedReport == null) {
      const threadId = `pre-protocol-primer-${Date.now()}`;
      setTimeout(() => startReport('combined' as SourceId, threadId), 0);
    }

    const isGenerating =
      combinedReport == null || combinedReport.status === 'generating';

    return (
      <div className="space-y-3">
        {runners}
        {isGenerating ? (
          <GeneratingReportCard title="Generating your Pre-Protocol Primer..." />
        ) : (
          <CombinedReportCard
            onClick={() => {
              void navigate({
                to: `/concierge/${combinedReport.threadId}`,
              });
            }}
          />
        )}
        <ResetButton onClick={handleReset} />
      </div>
    );
  }

  // Build items
  const items: ReactElement[] = [];
  for (const def of ACTION_DEFS) {
    const isComplete = completedSources.has(def.sourceId);
    const report = reports[def.sourceId];
    const isReportReady = report != null && report.status === 'ready';

    if (isComplete && isReportReady) {
      // Done — report ready, link to thread
      items.push(
        <CompletedActionItem
          key={def.id}
          title={def.completedTitle}
          reportPreview={MOCK_PREVIEWS[def.sourceId]}
          onClick={() => {
            void navigate({ to: `/concierge/${report.threadId}` });
          }}
        />,
      );
    } else if (isComplete && def.backgroundReport) {
      // Wearables: completed, background report generating
      items.push(<GeneratingActionItem key={def.id} title={def.title} />);
    } else if (isComplete && !def.backgroundReport) {
      // Labs/Import: completed via chat, user needs to mark done when back
      // Show as "in progress in concierge" with a "mark complete" button
      items.push(
        <InProgressActionItem
          key={def.id}
          title={def.title}
          onMarkComplete={() => {
            // For chat-based actions, we use the concierge thread as the report
            // The thread ID is the preset chat — mark as ready with a placeholder
            const threadId = `chat-${def.sourceId}-${Date.now()}`;
            startReport(def.sourceId, threadId);
            completeReport(def.sourceId);
          }}
        />,
      );
    } else {
      // Pending — check if gated
      const isGated = isBusy;
      items.push(
        <PendingActionItem
          key={def.id}
          title={def.title}
          description={def.description}
          imageSrc={def.imageSrc}
          disabled={isGated}
          onClick={() => {
            completeSource(def.sourceId);
            if (def.backgroundReport) {
              const threadId = `report-${def.sourceId}-${Date.now()}`;
              startReport(def.sourceId, threadId);
            }
            void navigate({
              to: def.pendingRoute.to as any,
              search: def.pendingRoute.search as any,
            });
          }}
        />,
      );
    }
  }

  return (
    <>
      {runners}
      <ActionableAccordion
        title="Get started"
        defaultOpen
        allowCollapse
        highlighted={false}
        showHeaderIndicator={false}
        showTopSeparator={false}
      >
        {items}
      </ActionableAccordion>
      <ResetButton onClick={handleReset} />
    </>
  );
};

function GeneratingActionItem({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <Loader2 className="size-5 shrink-0 animate-spin text-vermillion-500" />
      <div className="flex-1">
        <Body1 className="text-zinc-600">{title}</Body1>
        <Body2 className="text-zinc-400">Generating your report...</Body2>
      </div>
    </div>
  );
}

function InProgressActionItem({
  title,
  onMarkComplete,
}: {
  title: string;
  onMarkComplete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <Loader2 className="size-5 shrink-0 animate-spin text-vermillion-500" />
      <div className="flex-1">
        <Body1 className="text-zinc-600">{title}</Body1>
        <Body2 className="text-zinc-400">Complete this in the concierge</Body2>
      </div>
      <button
        type="button"
        onClick={onMarkComplete}
        className="shrink-0 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200"
      >
        Done
      </button>
    </div>
  );
}

function GeneratingReportCard({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
      <Loader2 className="size-6 shrink-0 animate-spin text-vermillion-500" />
      <div>
        <Body1 className="text-zinc-700">{title}</Body1>
        <Body2 className="text-zinc-400">
          We're connecting the dots across all your data...
        </Body2>
      </div>
    </div>
  );
}

function CompletedActionItem({
  title,
  reportPreview,
  onClick,
}: {
  title: string;
  reportPreview: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full flex-col gap-1.5 px-4 py-4 text-left outline-none transition-colors hover:bg-emerald-50/50 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center gap-2">
        <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500">
          <Check className="size-3 text-white" strokeWidth={3} />
        </div>
        <Body1 className="text-emerald-700">{title}</Body1>
        <ChevronRight
          aria-hidden="true"
          className="ml-auto size-4 text-emerald-400 transition-transform group-hover:translate-x-0.5"
        />
      </div>
      <Body2 className="pl-7 text-zinc-500">{reportPreview}</Body2>
    </button>
  );
}

function CombinedReportCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
    >
      <Body1 className="mb-2 font-semibold text-zinc-900">
        {COMBINED_REPORT.title}
      </Body1>
      <Body2 className="leading-relaxed text-zinc-500">
        {COMBINED_REPORT.preview}
      </Body2>
    </button>
  );
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 w-full text-center text-xs text-zinc-400 underline transition-colors hover:text-zinc-600"
    >
      Reset onboarding (prototype only)
    </button>
  );
}

function PendingActionItem({
  title,
  description,
  imageSrc,
  onClick,
  disabled,
}: {
  title: string;
  description: string;
  imageSrc: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="group relative flex w-full items-center gap-3 px-4 py-4 text-left outline-none transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      <div className="flex shrink-0 items-center">
        {disabled ? (
          <Lock className="size-4 text-zinc-300" />
        ) : (
          <div className="relative flex size-4 items-center justify-center rounded-full bg-vermillion-100">
            <div className="size-1.5 rounded-full bg-vermillion-900" />
          </div>
        )}
        <img
          src={imageSrc}
          alt=""
          className="ml-1.5 size-12 shrink-0 object-contain pt-1 rounded-mask"
        />
      </div>

      <div className="flex flex-1 items-center gap-3">
        <div className="flex-1">
          <Body1 className="text-zinc-900">{title}</Body1>
          <Body2 className="text-zinc-600">{description}</Body2>
        </div>
        <ChevronRight
          aria-hidden="true"
          className="size-5 text-zinc-400 transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </button>
  );
}
