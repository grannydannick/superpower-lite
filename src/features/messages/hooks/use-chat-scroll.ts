import { useMotionValue, useMotionValueEvent, useScroll } from 'framer-motion';
import { type RefObject, useCallback, useLayoutEffect, useState } from 'react';

export const CHAT_NEAR_BOTTOM_THRESHOLD_PX = 24;

interface UseChatScrollOptions {
  containerRef: RefObject<HTMLElement | null>;
}

export function useChatScroll({ containerRef }: UseChatScrollOptions) {
  const distanceFromBottom = useMotionValue(0);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const syncScrollState = useCallback(
    (scrollTop?: number) => {
      const container = containerRef.current;
      if (container == null) {
        return;
      }

      const nextScrollTop = scrollTop ?? container.scrollTop;
      const nextDistanceFromBottom =
        container.scrollHeight - nextScrollTop - container.clientHeight;

      distanceFromBottom.set(nextDistanceFromBottom);
      setIsNearBottom(nextDistanceFromBottom <= CHAT_NEAR_BOTTOM_THRESHOLD_PX);
    },
    [containerRef, distanceFromBottom],
  );

  // Keep the derived scroll state fresh after renders that change layout
  // without producing a scroll event, like prepending history or toggling
  // the welcome content.
  useLayoutEffect(() => {
    syncScrollState();
  });

  const { scrollY } = useScroll({ container: containerRef });

  useMotionValueEvent(scrollY, 'change', (y) => {
    syncScrollState(y);
  });

  return {
    distanceFromBottom,
    isNearBottom,
  };
}
