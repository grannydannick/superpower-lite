import { motion, useAnimationControls } from 'framer-motion';
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

  return (
    <div>
      {timeline.map((step, i) => {
        const lastStep = i === timeline.length - 1;
        const isComplete = step.complete;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            onViewportEnter={() => controls.start({ opacity: 1, y: 0 })}
            transition={{ delay: i * 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex size-5 items-center justify-center rounded-full border-2 shrink-0',
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
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.3 + 0.3, duration: 0.6 }}
                className={cn(
                  'ml-[10px] h-5 my-2 w-px rounded-full',
                  isComplete ? 'bg-vermillion-900' : 'bg-zinc-300',
                  timeline.filter((step) => step.complete).length - 1 === i &&
                    'bg-gradient-to-b from-vermillion-900 to-zinc-300',
                )}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
