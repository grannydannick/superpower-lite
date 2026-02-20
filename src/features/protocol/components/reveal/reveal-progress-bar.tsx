import { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router';

import { cn } from '@/lib/utils';

import { useLatestProtocol } from '../../api/get-protocol';

import { REVEAL_STEPS, useRevealStepper } from './reveal-stepper';

const HIDDEN = new Set<string>([
  REVEAL_STEPS.GET_STARTED,
  REVEAL_STEPS.BIOLOGICAL_AGE,
  REVEAL_STEPS.SCORE,
]);

export const RevealProgressBar = ({ className }: { className?: string }) => {
  const { step } = useParams<{ step?: string }>();
  const { baseSteps, initialStep } = useRevealStepper(undefined, step);
  const { data: protocol } = useLatestProtocol();
  const progressBarsRef = useRef<(HTMLDivElement | null)[]>([]);
  const lastCurrentIndexRef = useRef<number>(-1);
  const isVisibleActiveRef = useRef<boolean>(false);
  const currentIndexRef = useRef<number>(0);

  const currentStep =
    (step && baseSteps.includes(step) ? step : initialStep) ??
    baseSteps[0] ??
    REVEAL_STEPS.GET_STARTED;

  const items = useMemo(() => {
    const visibleSteps = baseSteps.filter((id) => !HIDDEN.has(id));

    return visibleSteps.map((id) => {
      if (id === REVEAL_STEPS.BIOMARKERS) return { id, label: 'Biomarkers' };

      if (id.startsWith('goal-')) {
        const goalId = id.replace('goal-', '');
        const goal = protocol?.goals.find((g) => g.id === goalId);
        return { id, label: goal?.introduction ?? 'Goal' };
      }

      if (id === REVEAL_STEPS.ORDER_SUMMARY) return { id, label: 'Checkout' };
      return { id, label: id };
    });
  }, [baseSteps, protocol?.goals]);

  const visibleSteps = baseSteps.filter((id) => !HIDDEN.has(id));
  const visibleIndex = visibleSteps.findIndex((s) => s === currentStep);
  let currentIndex = visibleIndex;

  if (visibleIndex === -1) {
    const allIndexMap = new Map(baseSteps.map((s, i) => [s, i] as const));
    const currentAllIndex = allIndexMap.get(currentStep) ?? 0;
    const fallbackIndex = visibleSteps.findIndex(
      (s) => (allIndexMap.get(s) ?? Infinity) >= currentAllIndex,
    );
    currentIndex =
      fallbackIndex === -1 ? visibleSteps.length - 1 : fallbackIndex;
  }

  currentIndex = Math.max(0, currentIndex);
  const isVisibleActive = visibleIndex !== -1;

  currentIndexRef.current = currentIndex;
  isVisibleActiveRef.current = isVisibleActive;

  useEffect(() => {
    const currentIdx = currentIndexRef.current;
    const isVisible = isVisibleActiveRef.current;

    if (!isVisible) return;

    const lastIndex = lastCurrentIndexRef.current;

    if (lastIndex !== currentIdx) {
      progressBarsRef.current.forEach((bar, index) => {
        if (!bar) return;

        const shouldFill = index <= currentIdx;
        const wasAlreadyFilled = index <= lastIndex;
        const isNewestBar = index === currentIdx;

        if (shouldFill && !wasAlreadyFilled && isNewestBar) {
          bar.style.transform = 'scaleX(0)';
          bar.style.transformOrigin = 'left';
          requestAnimationFrame(() => {
            bar.style.transition =
              'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)';
            bar.style.transform = 'scaleX(1)';
          });
        } else if (shouldFill) {
          bar.style.transform = 'scaleX(1)';
          bar.style.transition = 'none';
        } else {
          bar.style.transform = 'scaleX(0)';
          bar.style.transition = 'none';
        }
      });

      lastCurrentIndexRef.current = currentIdx;
    }
  }, [currentStep]);

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-1',
        className,
      )}
    >
      {items.map((item, index) => (
        <div
          key={`${item.id}-${index}`}
          className={cn(
            'relative h-1 flex-1 overflow-hidden rounded-full bg-white/50',
          )}
        >
          <div
            ref={(el) => {
              progressBarsRef.current[index] = el;
            }}
            className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-white"
            style={{
              transform: 'scaleX(0)',
            }}
          />
        </div>
      ))}
    </div>
  );
};
