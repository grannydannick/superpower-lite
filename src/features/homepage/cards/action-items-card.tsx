import { useNavigate } from '@tanstack/react-router';
import { Check, ChevronRight } from 'lucide-react';
import { type ReactElement } from 'react';

import { ActionableAccordion } from '@/components/shared/actionable-accordion';
import { Body1, Body2 } from '@/components/ui/typography';
import { useOnboardingCircleStore } from '@/features/onboarding-circle/stores/onboarding-circle-store';
import { useWearables } from '@/features/settings/api/get-wearables';
import { useUser } from '@/lib/auth';
import { shouldShowImportMemory } from '@/utils/show-action-conditions';

interface ActionItem {
  id: string;
  sourceId: 'wearables' | 'labs' | 'ai-context';
  title: string;
  completedTitle: string;
  description: string;
  reportPreview: string;
  imageSrc: string;
  onClick: () => void;
}

const COMBINED_REPORT = {
  title: 'See your early health picture',
  preview:
    'Your data shows a declining HRV over the last 30 days, lining up with your fatigue. Your cortisol is elevated and sleep efficiency is below average — a post-dinner walk routine could help on multiple fronts.',
};

const MOCK_REPORTS: Record<string, string> = {
  wearables:
    'Your data shows a declining HRV over the last 30 days, lining up with your fatigue. Sleep efficiency averaged 78% — below optimal.',
  labs: 'Your cortisol is elevated at 22.4 mcg/dL and fasting glucose trending up over 3 tests. Both connect to the sleep patterns from your wearables.',
  'ai-context':
    "You've mentioned stress and low energy repeatedly. Combined with your cortisol and HRV data, we see a clear stress-recovery pattern to address.",
};

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

export const ActionItemsCard = () => {
  const navigate = useNavigate();
  const { data: wearablesData } = useWearables();
  const hasNoWearables =
    (wearablesData?.wearables?.filter((w) => w.status === 'connected') ?? [])
      .length === 0;
  const { data: user } = useUser();
  const showImportMemory = shouldShowImportMemory(user?.createdAt);
  const completedSources = useOnboardingCircleStore((s) => s.completedSources);
  const resetOnboarding = useOnboardingCircleStore((s) => s.reset);

  const actions: ActionItem[] = [];

  // Wearables — show if not connected or if completed (to show report)
  if (hasNoWearables || completedSources.has('wearables')) {
    actions.push({
      id: 'connect-wearables',
      sourceId: 'wearables',
      title: 'Connect your wearables',
      completedTitle: 'Wearables connected, see report →',
      description:
        'Link Oura, Whoop, or Apple Health to get daily insights that connect your sleep, HRV, and activity to your lab results.',
      reportPreview: MOCK_REPORTS['wearables'],
      imageSrc: '/data/wearables.webp',
      onClick: () => {
        if (completedSources.has('wearables')) {
          void navigate({
            to: '/concierge',
            search: { defaultMessage: 'Show me my wearables insight report' },
          });
        } else {
          void navigate({ to: '/settings', search: { tab: 'integrations' } });
        }
      },
    });
  }

  // Labs — always show
  actions.push({
    id: 'upload-labs',
    sourceId: 'labs',
    title: 'Unlock your health trends',
    completedTitle: 'Labs are synced, see report →',
    description:
      "Upload past lab results and we'll show you how your biomarkers have changed over time.",
    reportPreview: MOCK_REPORTS['labs'],
    imageSrc: '/data/file-stack.webp',
    onClick: () => {
      if (completedSources.has('labs')) {
        void navigate({
          to: '/concierge',
          search: { defaultMessage: 'Show me my lab results insight report' },
        });
      } else {
        void navigate({ to: '/concierge', search: { preset: 'upload-labs' } });
      }
    },
  });

  // Import AI context
  if (showImportMemory || completedSources.has('ai-context')) {
    actions.push({
      id: 'import-memory-superpower-ai',
      sourceId: 'ai-context',
      title: 'Bring your health context',
      completedTitle: 'Health context imported, see report →',
      description:
        'Already use ChatGPT or Claude for health? Import those conversations so your AI coach knows your full story.',
      reportPreview: MOCK_REPORTS['ai-context'],
      imageSrc: '/concierge/other_llms.webp',
      onClick: () => {
        if (completedSources.has('ai-context')) {
          void navigate({
            to: '/concierge',
            search: {
              defaultMessage: 'Show me my imported health context report',
            },
          });
        } else {
          void navigate({
            to: '/concierge',
            search: { preset: 'import-memory' },
          });
        }
      },
    });
  }

  // Check if all action source IDs are completed
  const allComplete = actions.every((a) => completedSources.has(a.sourceId));

  // If all complete, show combined report instead
  if (allComplete && actions.length > 0) {
    return (
      <div className="space-y-4">
        <CombinedReportCard
          onClick={() => {
            void navigate({
              to: '/concierge',
              search: {
                defaultMessage:
                  'Give me a comprehensive report connecting all my data — wearables, labs, and health context. What patterns do you see and what should I focus on?',
              },
            });
          }}
        />
        <ResetButton onClick={resetOnboarding} />
      </div>
    );
  }

  const items: ReactElement[] = [];
  for (const action of actions) {
    const isComplete = completedSources.has(action.sourceId);

    if (isComplete) {
      items.push(
        <CompletedActionItem
          key={action.id}
          title={action.completedTitle}
          reportPreview={action.reportPreview}
          onClick={action.onClick}
        />,
      );
    } else {
      items.push(
        <PendingActionItem
          key={action.id}
          title={action.title}
          description={action.description}
          imageSrc={action.imageSrc}
          onClick={action.onClick}
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
      {completedSources.size > 1 && <ResetButton onClick={resetOnboarding} />}
    </>
  );
};

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
}: {
  title: string;
  description: string;
  imageSrc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full items-center gap-3 px-4 py-4 text-left outline-none transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex shrink-0 items-center">
        <div className="relative flex size-4 items-center justify-center rounded-full bg-vermillion-100">
          <div className="size-1.5 rounded-full bg-vermillion-900" />
        </div>
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
