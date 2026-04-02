import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';

import { Body1, H4 } from '@/components/ui/typography';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';

import type { ProtocolGoal } from '../../api';
import { ProtocolIndexNumber } from '../protocol-index-number';

const CARD_GRADIENTS = [
  'from-[#FF5D4D]/[.06] via-[#FFB088]/[.08] to-[#FFF0E8]/[.12]',
  'from-[#FC5F2B]/[.06] via-[#FFD4A8]/[.08] to-[#FFF5E8]/[.12]',
  'from-[#74B0FF]/[.06] via-[#B8D8FF]/[.08] to-[#EDF5FF]/[.12]',
] as const;

interface GoalsProps {
  goals: ProtocolGoal[];
  protocolId: string;
}

export const Goals = ({ goals, protocolId }: GoalsProps) => {
  const { track } = useAnalytics();
  const displayedGoals = goals.slice(0, 3);

  return (
    <div className="space-y-4">
      <H4>What we are working on</H4>

      <div className="grid grid-cols-1 gap-4">
        {displayedGoals.map((goal, index) => (
          <Link
            key={goal.id}
            to="/protocol/plans/$planId/goals/$goalId"
            params={{ planId: protocolId, goalId: goal.id }}
            className={cn(
              'group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-r p-5 text-left shadow shadow-black/[.03] outline-none transition-all hover:border-zinc-300 hover:shadow-md',
              CARD_GRADIENTS[index % CARD_GRADIENTS.length],
            )}
            onClick={() =>
              track('protocol_dashboard_goal_clicked', {
                goal_id: goal.id,
                goal_title: goal.title,
                goal_index: index,
              })
            }
          >
            <ProtocolIndexNumber
              index={index}
              className="shrink-0 text-left text-5xl"
            />

            <div className="min-w-0 flex-1">
              <Body1 className="font-medium leading-tight">{goal.title}</Body1>
              {goal.subtitle && (
                <span className="mt-1 block text-sm text-secondary">
                  {goal.subtitle}
                </span>
              )}
            </div>

            <ChevronRight className="size-5 shrink-0 text-zinc-400 transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-zinc-500" />
          </Link>
        ))}
      </div>
    </div>
  );
};
