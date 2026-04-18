import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { type ReactNode } from 'react';

import { Body1 } from '@/components/ui/typography';
import { protocolQuery } from '@/features/homepage/api/queries';
import { CardSkeleton } from '@/features/homepage/components/card-skeleton';
import { HomepageCard } from '@/features/homepage/components/homepage-card';
import { ProtocolIndexNumber } from '@/features/protocol/components/protocol-index-number';
import { CARD_GRADIENTS } from '@/features/protocol/const/color-gradients';
import { cn } from '@/lib/utils';

export const ProtocolGoalsCard = ({
  headerRight,
}: {
  headerRight?: ReactNode;
}) => {
  const protocolQueryResult = useQuery(protocolQuery());
  const protocolData = protocolQueryResult.data;
  const protocol = protocolData?.protocol;
  const goals = protocol?.goals?.slice(0, 3);

  if (protocolQueryResult.isPending) return <CardSkeleton />;
  if (protocolQueryResult.isError) return null;

  if (!protocol || !goals || goals.length === 0) return null;

  const hasThreeGoals = goals.length === 3;

  return (
    <HomepageCard title="Your protocol items" headerRight={headerRight}>
      <div
        className={cn(
          'grid gap-3',
          goals.length === 1 ? 'grid-cols-1' : 'sm:grid-cols-2',
          hasThreeGoals ? 'lg:grid-cols-3' : null,
        )}
      >
        {goals.map((goal, index) => (
          <Link
            key={goal.id}
            to="/protocol/plans/$planId/goals/$goalId"
            params={{ planId: protocol.id, goalId: goal.id }}
            className={cn(
              'group relative min-h-[168px] overflow-hidden rounded-2xl border border-zinc-200/50 bg-gradient-to-r p-5 text-left shadow shadow-black/[.03] outline-none transition-colors hover:border-zinc-300/50',
              CARD_GRADIENTS[index % CARD_GRADIENTS.length],
            )}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-28 overflow-hidden"
              style={{
                WebkitMaskImage:
                  'linear-gradient(to bottom, rgba(0, 0, 0, 0.99) 0%, rgba(0, 0, 0, 0.99) 32%, rgba(0, 0, 0, 0.48) 50%, rgba(0, 0, 0, 0.28) 68%, transparent 84%)',
                maskImage:
                  'linear-gradient(to bottom, rgba(0, 0, 0, 0.99) 0%, rgba(0, 0, 0, 0.99) 32%, rgba(0, 0, 0, 0.48) 50%, rgba(0, 0, 0, 0.28) 68%, transparent 84%)',
              }}
            >
              <ProtocolIndexNumber
                index={index}
                className="absolute left-5 top-3 text-left text-[88px] leading-none opacity-25 md:text-[104px]"
              />
            </div>
            <div className="relative z-10 flex min-h-[128px] items-end justify-between gap-4 pt-10">
              <div className="min-w-0 flex-1">
                <Body1 className="font-medium leading-tight">
                  {goal.title}
                </Body1>
              </div>
              <ChevronRight className="size-5 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-500" />
            </div>
          </Link>
        ))}
      </div>
    </HomepageCard>
  );
};
