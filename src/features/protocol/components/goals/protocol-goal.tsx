import React from 'react';
import { useParams } from 'react-router-dom';

import { Body2, Body3, H2, H4, Mono } from '@/components/ui/typography';
import { AiSuggestions } from '@/features/messages/components/ai-suggestions';

import type { Activity, Goal } from '../../api';
import { getGoalImage } from '../../utils/get-goal-image';
import { getGoalIndex } from '../../utils/get-goal-index';
import { ProtocolActivitiesList } from '../protocol-activities-list';
import { ProtocolHeader } from '../protocol-header';
import { ProtocolMarkdown } from '../protocol-markdown';

import { ProtocolGoalObservation } from './protocol-goal-observation';
import { ProtocolGoalPriority } from './protocol-goal-priority';

type ProtocolGoalProps = {
  goal: Goal;
  activities: Activity[];
  allGoals?: Goal[];
  tempSelections?: Set<string>;
  onSelectionChange?: (activityKey: string, selected: boolean) => void;
  getActivityKey?: (activity: Activity, index: number) => string;
};

export function ProtocolGoal({
  goal,
  activities,
  allGoals,
  tempSelections,
  onSelectionChange,
  getActivityKey,
}: ProtocolGoalProps) {
  const { goalId } = useParams();
  const goalIndex = allGoals ? getGoalIndex(allGoals, goal.id) : -1;

  return (
    <div className="space-y-8">
      <ProtocolHeader src={getGoalImage(goalIndex)}>
        <Mono className="text-white">
          Goal
          {allGoals && goalIndex >= 0 && ` ${goalIndex + 1}/${allGoals.length}`}
        </Mono>
        <H2 className="text-balance text-white">{goal.title}</H2>
        <ProtocolMarkdown
          className="text-white/80 [&>div]:text-sm"
          content={goal.introduction}
        />
      </ProtocolHeader>
      <div className="space-y-8 px-6 lg:px-0">
        <div className="flex h-16 w-full items-center rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm">
          <div className="flex-1 space-y-0.5">
            <Body3 className="text-secondary">Priority</Body3>
            {goal.priority && <ProtocolGoalPriority code={goal.priority} />}
          </div>
          <div className="mx-4 h-10 w-px bg-zinc-200" />
          <div className="flex-1 space-y-0.5">
            {goal.metadata?.healthImpact ? (
              <>
                <Body3 className="text-secondary">Health Impact</Body3>
                <Body2>{goal.metadata.healthImpact}</Body2>
              </>
            ) : (
              <>
                <Body3 className="text-secondary">Biomarkers</Body3>
                <Body2>{goal.targetBiomarkerIds.length}</Body2>
              </>
            )}
          </div>
          <div className="mx-4 h-10 w-px bg-zinc-200" />
          <div className="flex-1 space-y-0.5">
            {goal.metadata?.recoveryTime ? (
              <>
                <Body3 className="text-secondary">Recovery Time</Body3>
                <Body2>{goal.metadata.recoveryTime}</Body2>
              </>
            ) : (
              <>
                <Body3 className="text-secondary">Products</Body3>
                <Body2>{goal.activityIds.length}</Body2>
              </>
            )}
          </div>
        </div>
        {goal.body.length > 0 && (
          <div className="space-y-4">
            {goal.body.map((paragraph, index) => (
              <ProtocolMarkdown
                key={index}
                content={paragraph}
                citations={goal.citations}
              />
            ))}
          </div>
        )}

        {goal.targetBiomarkerIds.length > 0 && (
          <div className="space-y-2">
            <H4>Biomarkers to improve:</H4>
            <div className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              {goal.targetBiomarkerIds.map((id) => (
                <>
                  <div className="relative z-10 mx-auto -mt-px h-px w-[calc(100%-2rem)] bg-zinc-200" />
                  <ProtocolGoalObservation
                    key={id}
                    id={id}
                    className="rounded-none border-none shadow-none first:rounded-t-2xl last:rounded-b-2xl"
                  />
                </>
              ))}
            </div>
          </div>
        )}
        {goal.actions.length > 0 && (
          <div className="space-y-4">
            {goal.actions.map((action, index) => (
              <ProtocolMarkdown
                key={index}
                content={action}
                citations={goal.citations}
              />
            ))}
          </div>
        )}
        {activities.length > 0 && (
          <div className="space-y-4">
            <H4>Select your protocol items:</H4>
            <ProtocolActivitiesList
              activities={activities}
              tempSelections={tempSelections}
              onSelectionChange={onSelectionChange}
              getActivityKey={getActivityKey}
            />
          </div>
        )}
        {goalId && (
          <div className="space-y-4">
            <H4>Ask Superpower AI</H4>
            <AiSuggestions
              context={`I'm currently looking at my Protocol, particularly this goal: ${JSON.stringify(goal)}. Please give me some suggestions for questions I can ask regarding this.`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
