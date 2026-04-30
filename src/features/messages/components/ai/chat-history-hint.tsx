import {
  animate,
  cubicBezier,
  m,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useRef } from 'react';

const HINT_THRESHOLD = 0.2;
const HINT_RING_RADIUS = 14;
const HINT_RING_CIRCUMFERENCE = 2 * Math.PI * HINT_RING_RADIUS;
const HINT_EASE = cubicBezier(0.32, 0.72, 0, 1);

export function ChatHistoryHint({
  progress,
  onClick,
}: {
  progress: MotionValue<number>;
  onClick: () => void;
}) {
  const ringFraction = useTransform(progress, [0, HINT_THRESHOLD], [0, 1], {
    clamp: true,
    ease: HINT_EASE,
  });
  const dashOffset = useTransform(
    ringFraction,
    [0, 1],
    [HINT_RING_CIRCUMFERENCE, 0],
  );
  const arrowRotate = useMotionValue(0);
  const arrowFlippedRef = useRef(false);
  useMotionValueEvent(progress, 'change', (value) => {
    const shouldFlip = value > 0.001;
    if (shouldFlip === arrowFlippedRef.current) return;
    arrowFlippedRef.current = shouldFlip;
    animate(arrowRotate, shouldFlip ? 180 : 0, {
      duration: 0.35,
      ease: HINT_EASE,
    });
  });
  const textOpacity = useTransform(progress, [0, 0.02], [1, 0], {
    ease: HINT_EASE,
  });

  return (
    <m.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="absolute inset-x-0 top-2 flex cursor-pointer flex-col items-center gap-1 text-zinc-400 transition-colors hover:text-zinc-600"
      aria-label="Show chat history"
    >
      <div className="relative size-8">
        <svg className="absolute inset-0" viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r={HINT_RING_RADIUS}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            opacity="0.2"
          />
          <m.circle
            cx="16"
            cy="16"
            r={HINT_RING_RADIUS}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={HINT_RING_CIRCUMFERENCE}
            style={{ strokeDashoffset: dashOffset }}
            strokeLinecap="round"
            transform="rotate(-90 16 16)"
          />
        </svg>
        <m.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ rotate: arrowRotate }}
        >
          <ArrowUp size={14} />
        </m.div>
      </div>
      <m.span className="text-xs" style={{ opacity: textOpacity }}>
        Scroll for chat history
      </m.span>
    </m.button>
  );
}
