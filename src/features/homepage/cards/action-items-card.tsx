import { useNavigate } from '@tanstack/react-router';
import { Check, ChevronRight, Lock } from 'lucide-react';
import { type ReactElement } from 'react';

import { ActionableAccordion } from '@/components/shared/actionable-accordion';
import { Body1, Body2 } from '@/components/ui/typography';
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

const REPORT_PROMPTS: Record<string, string> = {
  wearables:
    'Generate a wearable data insight report. Analyze my sleep, HRV, heart rate, steps, and activity data from my connected wearable. Cross-reference with any other data you have about me — my intake, health goals, symptoms, and any prior labs. Highlight: 1) Key patterns in my wearable data, 2) What these patterns might mean for my upcoming bloodwork, 3) One specific thing I should focus on this week based on the data. Be specific with numbers.',
  labs: 'Generate a lab results insight report. Analyze my uploaded lab results and identify trends across my biomarkers. Cross-reference with everything else you know about me — my wearable data, intake, health goals, and any imported health conversations. Highlight: 1) Biomarkers that are trending in a concerning direction, 2) Connections between my lab results and my daily data (sleep, HRV, activity), 3) What to watch for in my next test. Be specific with numbers and timeframes.',
  'ai-context':
    "Generate a health context insight report based on my imported AI conversations. Map the themes, symptoms, and health concerns I've discussed against all the other data you have — my intake, wearable metrics, and any lab results. Highlight: 1) Recurring health themes and how they connect to my actual data, 2) Concerns I've raised that are supported (or contradicted) by my numbers, 3) Blind spots — things my data suggests I should pay attention to that I haven't mentioned. Be specific.",
  combined:
    'Generate my Pre-Protocol Primer — a comprehensive report synthesizing ALL my data before my protocol begins. Connect the dots across my wearable data (sleep, HRV, activity), my lab results and biomarker trends, my health intake (symptoms, goals, medical history), and my imported health conversations. Structure it as: 1) Your health snapshot — key findings across all data sources, 2) Patterns — connections between your daily data and your bloodwork, 3) What your protocol will likely target based on this picture, 4) Three things to focus on right now while you wait for your protocol. Be specific with numbers, timeframes, and data points.',
};

interface ActionDef {
  id: string;
  sourceId: SourceId;
  title: string;
  completedTitle: string;
  description: string;
  imageSrc: string;
  pendingRoute: { to: string; search?: Record<string, string> };
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
  },
];

/**
 * "done" means the user completed the action AND marked it done.
 * We track this separately from completion because the user may still
 * be in the middle of the flow (e.g., chatting in concierge).
 */
function hasActiveAction(
  completedSources: Set<SourceId>,
  doneIds: Record<string, string>,
): boolean {
  for (const def of ACTION_DEFS) {
    if (!completedSources.has(def.sourceId)) continue;
    if (doneIds[def.sourceId] == null) return true;
  }
  return false;
}

export const ActionItemsCard = () => {
  const navigate = useNavigate();
  const completedSources = useOnboardingCircleStore((s) => s.completedSources);
  const completeSource = useOnboardingCircleStore((s) => s.complete);
  const resetOnboarding = useOnboardingCircleStore((s) => s.reset);
  const doneIds = useReportStore((s) => s.threadIds);
  const markDone = useReportStore((s) => s.setThreadId);
  const resetReports = useReportStore((s) => s.reset);

  const allComplete = ACTION_DEFS.every((a) =>
    completedSources.has(a.sourceId),
  );
  const allDone = ACTION_DEFS.every((a) => doneIds[a.sourceId] != null);
  const isBusy = hasActiveAction(completedSources, doneIds);

  const handleReset = () => {
    resetOnboarding();
    resetReports();
  };

  // All steps completed and marked done → show combined report
  if (allComplete && allDone) {
    return (
      <div className="space-y-3">
        <CombinedReportCard
          onClick={() => {
            void navigate({
              to: '/concierge',
              search: { defaultMessage: REPORT_PROMPTS['combined'] },
            });
          }}
        />
        <ResetButton onClick={handleReset} />
      </div>
    );
  }

  // Build items
  const items: ReactElement[] = [];
  for (const def of ACTION_DEFS) {
    const isComplete = completedSources.has(def.sourceId);
    const isDone = doneIds[def.sourceId] != null;

    if (isComplete && isDone) {
      // Fully done — show report CTA
      items.push(
        <CompletedActionItem
          key={def.id}
          title={def.completedTitle}
          reportPreview={MOCK_PREVIEWS[def.sourceId]}
          onClick={() => {
            void navigate({
              to: '/concierge',
              search: { defaultMessage: REPORT_PROMPTS[def.sourceId] },
            });
          }}
        />,
      );
    } else if (isComplete && !isDone) {
      // Action done, waiting for user to come back and mark done
      items.push(
        <InProgressActionItem
          key={def.id}
          title={def.title}
          onMarkDone={() => markDone(def.sourceId, 'done')}
        />,
      );
    } else {
      // Pending
      items.push(
        <PendingActionItem
          key={def.id}
          title={def.title}
          description={def.description}
          imageSrc={def.imageSrc}
          disabled={isBusy}
          onClick={() => {
            completeSource(def.sourceId);
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

function InProgressActionItem({
  title,
  onMarkDone,
}: {
  title: string;
  onMarkDone: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <div className="relative flex size-4 items-center justify-center rounded-full bg-vermillion-100">
        <div className="size-1.5 animate-pulse rounded-full bg-vermillion-900" />
      </div>
      <div className="flex-1">
        <Body1 className="text-zinc-600">{title}</Body1>
        <Body2 className="text-zinc-400">
          Complete this step, then come back
        </Body2>
      </div>
      <button
        type="button"
        onClick={onMarkDone}
        className="shrink-0 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200"
      >
        Done
      </button>
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
