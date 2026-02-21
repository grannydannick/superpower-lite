import { m, useAnimationControls } from 'framer-motion';
import { Check } from 'lucide-react';
import React from 'react';

import { Body2, Body3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

export type AnimatedTimelineType = {
  title: string;
  time?: string;
  complete: boolean;
};

export const AnimatedTimeline = ({
  timeline,
}: {
  timeline: AnimatedTimelineType[];
}) => {
  const controls = useAnimationControls();

  if (timeline.length === 0) {
    return <></>;
  }

  let completeCount = 0;
  for (const step of timeline) {
    if (step.complete) {
      completeCount += 1;
    }
  }
  const gradientIndex = completeCount - 1;

  const nodes: React.ReactNode[] = [];
  const seenKeys = new Map<string, number>();
  let timelineIndex = 0;
  for (const step of timeline) {
    const baseKey = `${step.title}:${step.time ?? ''}`;
    const seenCount = seenKeys.get(baseKey) ?? 0;
    seenKeys.set(baseKey, seenCount + 1);

    const key = seenCount === 0 ? baseKey : `${baseKey}:${seenCount}`;
    const lastStep = timelineIndex === timeline.length - 1;
    const isComplete = step.complete;

    nodes.push(
      <m.div
        key={key}
        initial={{ opacity: 0, y: 20 }}
        animate={controls}
        onViewportEnter={() => controls.start({ opacity: 1, y: 0 })}
        transition={{ delay: timelineIndex * 0.3, duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
              isComplete
                ? 'border-vermillion-900 bg-vermillion-900'
                : 'border-zinc-300',
            )}
          >
            {isComplete && (
              <Check
                size={12}
                color="currentColor"
                className="z-10 text-white"
                strokeWidth={3}
              />
            )}
          </div>
          <div>
            {step.time ? (
              <Body3
                className={cn(
                  isComplete ? 'text-vermillion-900' : 'text-secondary',
                )}
              >
                {step.time}
              </Body3>
            ) : null}
            <Body2
              className={cn(
                isComplete ? 'text-vermillion-900' : 'text-secondary',
              )}
            >
              {step.title}
            </Body2>
          </div>
        </div>
        {!lastStep && (
          <m.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: timelineIndex * 0.3 + 0.3, duration: 0.6 }}
            className={cn(
              'my-2 ml-[10px] h-5 w-px rounded-full',
              isComplete ? 'bg-vermillion-900' : 'bg-zinc-300',
              gradientIndex === timelineIndex &&
                'bg-gradient-to-b from-vermillion-900 to-zinc-300',
            )}
          />
        )}
      </m.div>,
    );

    timelineIndex += 1;
  }

  return <div>{nodes}</div>;
};
