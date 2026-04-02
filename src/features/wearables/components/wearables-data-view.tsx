import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/components/ui/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Body2, H4 } from '@/components/ui/typography';
import { AnimatedIcon } from '@/features/messages/components/ai/animated-icon';
import { useAssistantStore } from '@/features/messages/stores/assistant-store';
import { useWearablesSummary } from '@/features/wearables/api/get-wearables-summary';
import { useUser } from '@/lib/auth';

import { useWearablesData } from '../hooks/use-wearables-data';

import { WearablesDataTable } from './table/wearables-data-table';
import { WearablesPersonalizedExplanation } from './wearables-personalized-explanation';

export const WearablesDataView = () => {
  const { overview, isLoading, showEmptyState } = useWearablesData();
  const { data: user } = useUser();
  const { openWithMessages } = useAssistantStore();
  const { data: summaryData, isLoading: isSummaryLoading } =
    useWearablesSummary();
  const summaryAvailable = !isSummaryLoading && !!summaryData;

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="rounded-[24px] bg-white p-6">
          <Skeleton variant="shimmer" className="mb-3 h-6 w-32 rounded-lg" />
          <Skeleton variant="shimmer" className="h-4 w-3/4 rounded-lg" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="shimmer"
              className="h-24 w-full rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  // Gated state: provider connected but no data received yet
  if (showEmptyState) {
    return (
      <div className="flex w-full flex-col gap-2">
        <div className="rounded-[24px] bg-white p-6 shadow-sm">
          <H4 className="mb-2">Your wearables data is on its way</H4>
          <Body2 className="text-zinc-400">
            It usually takes a few minutes for your data to sync. Check back
            shortly — your wearables data will appear here automatically.
          </Body2>
        </div>
        <Link to="/settings" search={{ tab: 'integrations' }}>
          <Card className="group flex cursor-pointer items-center gap-4 px-4 py-2">
            <img
              src="/data/wearables.webp"
              alt="Wearables"
              className="size-12 object-cover pt-1 rounded-mask"
            />
            <span className="flex flex-1 flex-col items-start p-4 pl-2">
              <span className="text-xs text-vermillion-900">Integrations</span>
              <span className="flex-1 text-balance text-left text-sm font-medium text-primary">
                Manage your connected wearables instead
              </span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-zinc-400 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-700" />
          </Card>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative mx-auto w-full flex-1 overflow-visible rounded-[24px] border-none bg-white p-6 pb-4 hover:bg-white/80">
        <H4>Wearables</H4>

        <div className="mt-4 space-y-4">
          <WearablesPersonalizedExplanation />
          {summaryAvailable && (
            <Button
              variant="ghost"
              size="small"
              className="group h-auto gap-1 p-0"
              onClick={() => {
                const presetMessage = `Hi ${user?.firstName ?? 'there'}, what would you like to update about your medical history? This could be things like a new therapy, updated diet, new habits or anything else you would like us to remember about you.`;

                openWithMessages([
                  {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    parts: [{ type: 'text', text: presetMessage }],
                  },
                ]);
              }}
            >
              <AnimatedIcon state="idle" size={20} className="-mt-0.5" />
              Update my health{' '}
              <ArrowUpRight className="-mt-0.5 size-3.5 transition-all duration-200 ease-out group-hover:-translate-y-px group-hover:translate-x-px" />
            </Button>
          )}
        </div>

        {overview && (
          <Body2 className="mt-2 text-zinc-400">
            Data from {overview.providers.length} connected{' '}
            {overview.providers.length === 1 ? 'provider' : 'providers'}.
            Updated {formatDistanceToNow(new Date(overview.generatedAt))} ago.
          </Body2>
        )}
      </div>

      <WearablesDataTable latest={overview?.latest ?? {}} isLoading={false} />
    </div>
  );
};
