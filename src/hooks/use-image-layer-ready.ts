import {
  type DependencyList,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

/** Default delay before `requestAnimationFrame` (see `useImageLayerReady`). */
export const DEFAULT_IMAGE_LAYER_READY_DELAY_MS = 300;

interface UseImageLayerReadyOptions {
  /** When any of these change, `ready` resets to false and pending timers clear. */
  resetDeps: DependencyList;
  /**
   * After load is signaled (`scheduleReveal` or cached `complete` img), wait this many ms then
   * one `requestAnimationFrame` before `ready` becomes true (e.g. WebKit layer promotion before motion).
   */
  delayMs: number;
}

/**
 * Drives a boolean `ready` after an `<img>` has loaded: supports both `onLoad` and the cached
 * (`complete` + `naturalWidth`) path, with an optional delay + rAF before flipping `ready`.
 */
export function useImageLayerReady(options: UseImageLayerReadyOptions) {
  const { resetDeps, delayMs } = options;
  const [ready, setReady] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const revealRafRef = useRef<number | undefined>(undefined);
  const revealScheduledRef = useRef(false);

  const scheduleReveal = useCallback(() => {
    if (revealScheduledRef.current === true) return;
    revealScheduledRef.current = true;

    const pending = revealTimeoutRef.current;
    if (pending !== undefined) {
      clearTimeout(pending);
    }
    revealTimeoutRef.current = setTimeout(() => {
      revealTimeoutRef.current = undefined;
      revealRafRef.current = requestAnimationFrame(() => {
        revealRafRef.current = undefined;
        setReady(true);
      });
    }, delayMs);
  }, [delayMs]);

  useLayoutEffect(() => {
    const clearPendingReveal = () => {
      const timeoutId = revealTimeoutRef.current;
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
        revealTimeoutRef.current = undefined;
      }
      const rafId = revealRafRef.current;
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
        revealRafRef.current = undefined;
      }
    };

    setReady(false);
    revealScheduledRef.current = false;
    clearPendingReveal();

    const el = imgRef.current;
    if (el !== null && el.complete === true && el.naturalWidth > 0) {
      scheduleReveal();
    }

    return clearPendingReveal;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetDeps supplied by caller
  }, [...resetDeps, scheduleReveal]);

  return {
    ready,
    imgRef,
    scheduleReveal,
  };
}
