import { useNavigate } from '@tanstack/react-router';
import { Check, ChevronRight } from 'lucide-react';

import { Body1, Body2 } from '@/components/ui/typography';
import type { SourceId } from '@/features/onboarding-circle/const/sources';
import { useOnboardingCircleStore } from '@/features/onboarding-circle/stores/onboarding-circle-store';
import { useReportStore } from '@/features/onboarding-circle/stores/report-store';
import { cn } from '@/lib/utils';

import { useReportPolling } from '../hooks/use-report-polling';
import { useSourceCompletion } from '../hooks/use-source-completion';

interface ChecklistItem {
  id: SourceId;
  title: string;
  subtitle: string;
  route: { to: string; search?: Record<string, string> };
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'intake',
    title: 'Health intake',
    subtitle: 'Completed during onboarding',
    route: { to: '/' },
  },
  {
    id: 'wearables',
    title: 'Connect wearables',
    subtitle: 'Oura, Whoop, Apple Health',
    route: { to: '/settings', search: { tab: 'integrations' } },
  },
  {
    id: 'ai-context',
    title: 'Sync LLM',
    subtitle: 'Import health conversations',
    route: {
      to: '/concierge',
      search: { preset: 'import-memory', sourceId: 'ai-context' },
    },
  },
  {
    id: 'labs',
    title: 'Upload labs',
    subtitle: 'Past blood work from any provider',
    route: {
      to: '/concierge',
      search: { preset: 'upload-labs', sourceId: 'labs' },
    },
  },
];

export const ActionItemsCard = () => {
  const navigate = useNavigate();
  const completedSources = useOnboardingCircleStore((s) => s.completedSources);
  const inProgressSources = useOnboardingCircleStore(
    (s) => s.inProgressSources,
  );
  const startSource = useOnboardingCircleStore((s) => s.startSource);
  const reports = useReportStore((s) => s.reports);

  useSourceCompletion();
  useReportPolling();

  const completedCount = completedSources.size;
  const totalCount = CHECKLIST_ITEMS.length;

  // Hide when all steps complete AND all reports ready
  const allComplete = completedCount >= totalCount;
  const allReportsReady =
    allComplete &&
    reports['wearables']?.status === 'ready' &&
    reports['ai-context']?.status === 'ready' &&
    reports['labs']?.status === 'ready';

  if (allComplete && allReportsReady) {
    return null;
  }

  const handleClick = (item: ChecklistItem) => {
    if (completedSources.has(item.id)) return;
    if (item.id === 'intake') return;
    startSource(item.id);
    void navigate({
      to: item.route.to as any,
      search: item.route.search as any,
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Header */}
      <div className="px-4 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <Body1 className="font-semibold text-zinc-900">Get started</Body1>
          <Body2 className="text-zinc-400">
            {completedCount}/{totalCount}
          </Body2>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-vermillion-900 transition-all duration-500"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Checklist rows */}
      <div className="px-2 pb-2 pt-1">
        {CHECKLIST_ITEMS.map((item) => {
          const isComplete = completedSources.has(item.id);
          const isInProgress = inProgressSources.has(item.id);
          const isClickable = !isComplete && item.id !== 'intake';

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item)}
              disabled={!isClickable}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors',
                isClickable && 'hover:bg-zinc-50',
                !isComplete &&
                  !isInProgress &&
                  item.id !== 'intake' &&
                  'opacity-50',
              )}
            >
              {/* Circle indicator */}
              <div className="flex size-6 shrink-0 items-center justify-center">
                {isComplete ? (
                  <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500">
                    <Check className="size-3.5 text-white" strokeWidth={3} />
                  </div>
                ) : isInProgress ? (
                  <div className="flex size-6 items-center justify-center rounded-full border-2 border-vermillion-900">
                    <div className="size-2 animate-pulse rounded-full bg-vermillion-900" />
                  </div>
                ) : (
                  <div className="size-6 rounded-full border-2 border-zinc-200" />
                )}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <Body1
                  className={cn(
                    'text-zinc-900',
                    isComplete && 'text-zinc-400 line-through',
                  )}
                >
                  {item.title}
                </Body1>
                {!isComplete && (
                  <Body2 className="text-zinc-400">{item.subtitle}</Body2>
                )}
              </div>

              {/* Chevron for clickable items */}
              {isClickable && (
                <ChevronRight className="size-4 shrink-0 text-zinc-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
