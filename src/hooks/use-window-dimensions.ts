import { useSyncExternalStore } from 'react';

interface WindowDimensions {
  width: number;
  height: number;
}

const SERVER_DIMENSIONS: WindowDimensions = { width: 0, height: 0 };

let dimensions: WindowDimensions = readDimensions();
let isListening = false;
let scheduledId: number | null = null;
const listeners = new Set<() => void>();

function readDimensions() {
  if (typeof window === 'undefined') return SERVER_DIMENSIONS;
  return { width: window.innerWidth, height: window.innerHeight };
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function scheduleUpdate() {
  if (typeof window === 'undefined') return;

  const canUseRaf = typeof window.requestAnimationFrame === 'function';

  if (scheduledId !== null) {
    if (canUseRaf) {
      window.cancelAnimationFrame(scheduledId);
    } else {
      window.clearTimeout(scheduledId);
    }
  }

  const run = () => {
    scheduledId = null;

    const next = readDimensions();
    if (next.width === dimensions.width && next.height === dimensions.height) {
      return;
    }

    dimensions = next;
    emitChange();
  };

  scheduledId = canUseRaf
    ? window.requestAnimationFrame(run)
    : window.setTimeout(run, 16);
}

function subscribe(listener: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  listeners.add(listener);

  if (!isListening) {
    isListening = true;
    dimensions = readDimensions();
    window.addEventListener('resize', scheduleUpdate, { passive: true });
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size !== 0) return;

    if (isListening) {
      isListening = false;
      window.removeEventListener('resize', scheduleUpdate);
    }

    if (scheduledId !== null) {
      const canUseRaf = typeof window.requestAnimationFrame === 'function';
      if (canUseRaf) {
        window.cancelAnimationFrame(scheduledId);
      } else {
        window.clearTimeout(scheduledId);
      }
      scheduledId = null;
    }
  };
}

function getSnapshot() {
  return dimensions;
}

function getServerSnapshot() {
  return SERVER_DIMENSIONS;
}

/**
 * Use this only when you REALLY NEED it.
 *
 * Otherwise, tailwind's xs, sm, md, lg, etc... is preferred.
 */
export const useWindowDimensions = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
