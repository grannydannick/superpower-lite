import { motion, useAnimationControls } from 'framer-motion';
import { Check } from 'lucide-react';
import React from 'react';

import { Body1 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

export type AnimatedTimelineType = {
  title: string;
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
                  'flex h-10 min-w-10 items-center justify-center rounded-full border',
                  isComplete ? 'border-green-600' : 'border-gray-300',
                )}
              >
                <Check
                  size={16}
                  color={isComplete ? '#26936B' : '#71717A'}
                  className="z-10"
                />
              </div>
              <Body1
                className={cn(
                  isComplete ? 'text-green-600' : 'text-gray-400',
                  'line-clamp-1',
                )}
              >
                {step.title}
              </Body1>
            </div>
            {!lastStep && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.3 + 0.3, duration: 0.6 }}
                className={cn(
                  'ml-[19px] h-6 w-px',
                  isComplete ? 'bg-green-600' : 'bg-gray-300',
                )}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
