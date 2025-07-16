import { useEffect, useState } from 'react';

interface UseScrollThresholdOptions {
  /** Distance threshold in pixels for triggering the scroll threshold */
  thresholdPx?: number;
  /** Whether to measure the threshold from the bottom of the page (true) or top (false) */
  thresholdFromBottom?: boolean;
}

/**
 * Hook that returns true when scroll position meets the threshold criteria
 */
export const useScrollThreshold = ({
  thresholdPx = 10,
  thresholdFromBottom = false,
}: UseScrollThresholdOptions = {}): boolean => {
  const [isBlurred, setIsBlurred] = useState<boolean>(false);

  useEffect(() => {
    let timeoutId: number;

    const handleScroll = (): void => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (thresholdFromBottom) {
          // Calculate scroll threshold from bottom
          const scrollTop = window.scrollY;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const distanceFromBottom =
            documentHeight - (scrollTop + windowHeight);

          setIsBlurred(distanceFromBottom >= thresholdPx);
        } else {
          // Calculate scroll threshold from top
          setIsBlurred(window.scrollY > thresholdPx);
        }
      }, 5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [thresholdPx, thresholdFromBottom]);

  return isBlurred;
};
