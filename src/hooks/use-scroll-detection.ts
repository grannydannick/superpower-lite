import { useCallback, useEffect, useRef, useState } from 'react';

interface UseScrollDetectionOptions {
  threshold?: number;
  bottomOffset?: number;
}

interface ScrollDetectionState {
  isScrolled: boolean;
  isAtBottom: boolean;
}

/**
 * Detects if the user has scrolled past a threshold and if they are at the bottom of the page.
 */
export const useScrollDetection = ({
  threshold = 180,
  bottomOffset = 10,
}: UseScrollDetectionOptions = {}): ScrollDetectionState => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const rafRef = useRef<number>();

  const checkScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const scrolledPastThreshold = scrollTop > threshold;
      const scrolledToBottom =
        scrollTop + windowHeight >= documentHeight - bottomOffset;

      setIsScrolled((prev) => {
        if (prev !== scrolledPastThreshold) {
          return scrolledPastThreshold;
        }
        return prev;
      });

      setIsAtBottom((prev) => {
        if (prev !== scrolledToBottom) {
          return scrolledToBottom;
        }
        return prev;
      });
    });
  }, [threshold, bottomOffset]);

  useEffect(() => {
    checkScroll();

    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [checkScroll]);

  return { isScrolled, isAtBottom };
};
