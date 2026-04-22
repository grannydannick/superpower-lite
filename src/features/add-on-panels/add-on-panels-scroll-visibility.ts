import { type UIEvent, useRef, useState } from 'react';

const SUPPLEMENTARY_CONTROLS_TOGGLE_THRESHOLD_PX = 24;
const SUPPLEMENTARY_CONTROLS_TOP_THRESHOLD_PX = 24;

interface UseSupplementaryControlsVisibilityResult {
  areSupplementaryControlsHidden: boolean;
  handleScroll: (event: UIEvent<HTMLDivElement>) => void;
}

export function useSupplementaryControlsVisibility(): UseSupplementaryControlsVisibilityResult {
  const [areSupplementaryControlsHidden, setAreSupplementaryControlsHidden] =
    useState(false);
  const lastScrollTopRef = useRef(0);
  const scrollDirectionRef = useRef<'down' | 'up' | null>(null);
  const accumulatedScrollPxRef = useRef(0);

  return {
    areSupplementaryControlsHidden,
    handleScroll: (event) => {
      const nextScrollTop = event.currentTarget.scrollTop;
      const previousScrollTop = lastScrollTopRef.current;
      const delta = nextScrollTop - previousScrollTop;

      if (nextScrollTop <= SUPPLEMENTARY_CONTROLS_TOP_THRESHOLD_PX) {
        accumulatedScrollPxRef.current = 0;
        scrollDirectionRef.current = null;

        if (areSupplementaryControlsHidden) {
          setAreSupplementaryControlsHidden(false);
        }

        lastScrollTopRef.current = nextScrollTop;
        return;
      }

      if (delta === 0) {
        lastScrollTopRef.current = nextScrollTop;
        return;
      }

      const nextDirection = delta > 0 ? 'down' : 'up';
      if (scrollDirectionRef.current !== nextDirection) {
        scrollDirectionRef.current = nextDirection;
        accumulatedScrollPxRef.current = 0;
      }

      accumulatedScrollPxRef.current += Math.abs(delta);

      if (
        nextDirection === 'down' &&
        !areSupplementaryControlsHidden &&
        accumulatedScrollPxRef.current >=
          SUPPLEMENTARY_CONTROLS_TOGGLE_THRESHOLD_PX
      ) {
        setAreSupplementaryControlsHidden(true);
        accumulatedScrollPxRef.current = 0;
      } else if (
        nextDirection === 'up' &&
        areSupplementaryControlsHidden &&
        accumulatedScrollPxRef.current >=
          SUPPLEMENTARY_CONTROLS_TOGGLE_THRESHOLD_PX
      ) {
        setAreSupplementaryControlsHidden(false);
        accumulatedScrollPxRef.current = 0;
      }

      lastScrollTopRef.current = nextScrollTop;
    },
  };
}
