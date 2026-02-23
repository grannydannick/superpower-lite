import { ChevronRight } from 'lucide-react';

import { Link } from '@/components/ui/link';
import { Body2, H4 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import type { Goal, Protocol } from '../../api';

import { ProtocolGoalPriority } from './protocol-goal-priority';

type ProtocolGoalCardProps = {
  goal: Goal;
  protocol: Protocol;
  className?: string;
  src?: string;
};

export function ProtocolGoalCard({
  goal,
  protocol,
  className,
  src = '/action-plan/flora.webp',
}: ProtocolGoalCardProps) {
  return (
    <Link
      to="/protocol/plans/$planId/goals/$goalId"
      params={{ planId: protocol.id, goalId: goal.id }}
      className="group relative"
    >
      <img
        src={src}
        alt={goal.title}
        className="pointer-events-none absolute inset-0 -bottom-16 max-h-40 opacity-20 blur-2xl"
      />
      <div
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3)), url(${src})`,
        }}
        className={cn(
          'relative z-10 w-full overflow-hidden rounded-2xl border-white/10 bg-cover bg-center p-6 lg:border',
          className,
        )}
      >
        {goal.priority && (
          <div className="mb-8 flex w-full items-start justify-end">
            <ProtocolGoalPriority
              className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-white backdrop-blur-md"
              code={goal.priority}
            />
          </div>
        )}
        <H4 className="mb-2 text-white">{goal.title}</H4>
        <div className="flex items-center gap-0.5 transition-all duration-200 ease-out group-hover:gap-1">
          <Body2 className="text-white">How to solve this</Body2>
          <ChevronRight className="size-3.5 text-white" />
        </div>
      </div>
    </Link>
  );
}
