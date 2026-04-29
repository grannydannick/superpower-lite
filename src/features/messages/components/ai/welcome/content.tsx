import { m, type MotionValue, useTransform } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

import { Greeting } from './greeting';
import { type SetupAction, SuggestedActions } from './suggested-actions';

interface WelcomeContentProps {
  onSend: (text: string) => void;
  setupActions: SetupAction[];
}

export function WelcomeContent({ onSend, setupActions }: WelcomeContentProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 pt-4">
      <Greeting />

      <div className="flex w-full">
        <SuggestedActions
          onSendSuggestion={onSend}
          setupActions={setupActions}
        />
      </div>
    </div>
  );
}

// Distance (in px from the scroll bottom) over which the hint fades out as
// the user scrolls up. Roughly a message's height so the fade feels gradual
// rather than snapping off after a tiny nudge.
const FADE_RANGE_PX = 160;

export function EarlierMessagesHint({
  distanceFromBottom,
  onClick,
}: {
  distanceFromBottom: MotionValue<number>;
  onClick: () => void;
}) {
  const isMobile = useIsMobile();
  const hintLabel = isMobile
    ? 'Swipe down for chat history'
    : 'Scroll up for chat history';

  // Opacity/translate are driven by the scroll motion value directly, so
  // the DOM updates per frame without re-rendering this component. Hover /
  // focus still animate cleanly on top because framer-motion transitions
  // back to the style-bound motion value when those states end.
  const opacity = useTransform(
    distanceFromBottom,
    [0, FADE_RANGE_PX],
    [0.55, 0],
    { clamp: true },
  );
  const translateY = useTransform(
    distanceFromBottom,
    [0, FADE_RANGE_PX],
    [0, -6],
    { clamp: true },
  );

  // Keep the button non-interactive once it's effectively invisible so it
  // doesn't swallow clicks on whatever's underneath it as the user scrolls.
  const pointerEvents = useTransform(distanceFromBottom, (d) =>
    d > FADE_RANGE_PX ? 'none' : 'auto',
  );

  return (
    <m.button
      type="button"
      onClick={onClick}
      style={{ opacity, y: translateY, pointerEvents }}
      whileHover={{ opacity: 1 }}
      whileFocus={{ opacity: 1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="group inline-flex shrink-0 flex-col items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-medium tracking-wide text-secondary outline-none transition-colors duration-200 hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
    >
      <m.span
        aria-hidden
        animate={isMobile ? { y: [0, 2, 0] } : { y: [0, -2, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-tertiary transition-colors duration-200 group-hover:text-secondary"
      >
        <ChevronUp
          className={isMobile ? 'rotate-180' : undefined}
          size={14}
          strokeWidth={2}
        />
      </m.span>
      <span className={cn('min-w-0 text-center', isMobile && 'leading-snug')}>
        {hintLabel}
      </span>
    </m.button>
  );
}
