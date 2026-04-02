import { m } from 'framer-motion';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { H2, Body1 } from '@/components/ui/typography';
import { ProtocolIndexNumber } from '@/features/protocol/components/protocol-index-number';
import { useProtocolStepperContext } from '@/features/protocol/components/reveal/protocol-stepper-context';
import { COLOR_GRADIENTS } from '@/features/protocol/const/color-gradients';
import { GOAL_COLORS } from '@/features/protocol/const/protocol-constants';
import { cn } from '@/lib/utils';

import { ProtocolStepLayout } from '../../../layouts/protocol-step-layout';

export const GoalOverviewStep = () => {
  const { next, goals } = useProtocolStepperContext();

  const handleNext = useCallback(() => {
    next();
  }, [next]);

  return (
    <ProtocolStepLayout>
      <div>
        <H2 className="mb-1 md:text-3xl">
          Your top {goals.length} health goals
        </H2>
        <Body1 className="text-balance text-secondary">
          Based on your data we found {goals.length} key focuses.
        </Body1>
      </div>

      <div className="space-y-4">
        {goals.map((goal, index) => {
          const colorKey = GOAL_COLORS[goal.number - 1] ?? 'red';
          return (
            <m.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white px-6 py-8 shadow shadow-black/[.03]"
            >
              <div
                className={cn(
                  'absolute bottom-0 right-0 h-16 w-32 bg-gradient-to-tr opacity-50 blur-3xl',
                  COLOR_GRADIENTS[colorKey],
                )}
              />
              <div className="relative z-10 flex items-center gap-8">
                <div className="relative shrink-0">
                  <ProtocolIndexNumber index={index} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 text-lg font-semibold leading-tight text-zinc-900">
                    {goal.title}
                  </h3>
                  <p className="text-sm text-zinc-600">{goal.subtitle}</p>
                </div>
              </div>
            </m.div>
          );
        })}
      </div>

      <div className="flex justify-center gap-4">
        <Button className="w-full" onClick={handleNext}>
          Continue
        </Button>
      </div>
    </ProtocolStepLayout>
  );
};
