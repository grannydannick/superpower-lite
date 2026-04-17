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

  return (
    <HomepageCard title="Your improvement areas" headerRight={headerRight}>
      <div className="flex flex-wrap gap-3">
        {goals.map((goal, index) => (
          <Link
            key={goal.id}
            to="/protocol/plans/$planId/goals/$goalId"
            params={{ planId: protocol.id, goalId: goal.id }}
            className={cn(
              'group relative flex min-w-[220px] flex-1 items-center gap-4 overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-r p-5 text-left shadow shadow-black/[.03] outline-none transition-colors',
              CARD_GRADIENTS[index % CARD_GRADIENTS.length],
            )}
          >
            <ProtocolIndexNumber
              index={index}
              className="shrink-0 text-left text-5xl"
            />
            <div className="min-w-0 flex-1">
              <Body1 className="font-medium leading-tight">{goal.title}</Body1>
            </div>
            <ChevronRight className="size-5 shrink-0 text-zinc-400 transition-all group-hover:-mr-1 group-hover:text-zinc-500" />
          </Link>
        ))}
      </div>
    </HomepageCard>
  );
};
