import { useParams } from '@tanstack/react-router';

import { Body2, Body3, H2, H4, Mono } from '@/components/ui/typography';
import { AiSuggestions } from '@/features/messages/components/ai-suggestions';

import type {
  ProtocolAction,
  ProtocolGoal as ProtocolGoalType,
} from '../../api';
import { getGoalIndex } from '../../utils/get-goal-index';
import { getGoalImage } from '../../utils/legacy/get-goal-image';
import { ProtocolHeader } from '../protocol-header';
import { ProtocolMarkdown } from '../protocol-markdown';

type ProtocolGoalProps = {
  goal: ProtocolGoalType;
  actions: ProtocolAction[];
  allGoals?: ProtocolGoalType[];
};

export function ProtocolGoal({ goal, actions, allGoals }: ProtocolGoalProps) {
  const { goalId } = useParams({ strict: false });
  const goalIndex = allGoals ? getGoalIndex(allGoals, goal.id) : -1;

  return (
    <div className="space-y-8">
      <ProtocolHeader src={getGoalImage(goalIndex)}>
        <Mono className="text-white">
          Goal
          {allGoals && goalIndex >= 0 && ` ${goalIndex + 1}/${allGoals.length}`}
        </Mono>
        <H2 className="text-balance text-white">{goal.title}</H2>
        {goal.description && (
          <ProtocolMarkdown
            className="text-white/80 [&>div]:text-sm"
            content={goal.description}
          />
        )}
      </ProtocolHeader>
      <div className="space-y-8 px-6 lg:px-0">
        <div className="flex h-16 w-full items-center rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm">
          <div className="flex-1 space-y-0.5">
            <Body3 className="text-secondary">Goal</Body3>
            <Body2>#{goal.number}</Body2>
          </div>
          <div className="mx-4 h-10 w-px bg-zinc-200" />
          <div className="flex-1 space-y-0.5">
            <Body3 className="text-secondary">Biomarkers</Body3>
            <Body2>{goal.biomarkers?.length || 0}</Body2>
          </div>
          <div className="mx-4 h-10 w-px bg-zinc-200" />
          <div className="flex-1 space-y-0.5">
            <Body3 className="text-secondary">Actions</Body3>
            <Body2>{actions.length}</Body2>
          </div>
        </div>

        {goal.impactContent && (
          <div className="space-y-4">
            <H4>Health Impact</H4>
            <ProtocolMarkdown content={goal.impactContent} />
          </div>
        )}

        {goal.biomarkers && goal.biomarkers.length > 0 && (
          <div className="space-y-2">
            <H4>Biomarkers to improve:</H4>
            <div className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              {goal.biomarkers.map((biomarkerId) => (
                <div key={biomarkerId} className="p-4">
                  <Body2 className="font-medium">{biomarkerId}</Body2>
                </div>
              ))}
            </div>
          </div>
        )}

        {actions.length > 0 && (
          <div className="space-y-4">
            <H4>Recommended Actions</H4>
            <div className="space-y-4">
              {actions.map((action, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <Body2 className="font-medium">{action.title}</Body2>
                  {action.description && (
                    <Body3 className="mt-1 text-secondary">
                      {action.description}
                    </Body3>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {goalId && (
          <div className="space-y-4">
            <H4>Ask Superpower AI</H4>
            <AiSuggestions
              context={`I'm currently looking at my Protocol, particularly this goal: ${JSON.stringify(goal)}. Please give me some suggestions for questions I can ask regarding this.`}
              showAskOwn
            />
          </div>
        )}
      </div>
    </div>
  );
}
