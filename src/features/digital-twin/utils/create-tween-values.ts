import { Color } from 'three';

const easeOutPower2 = (t: number) => {
  const inv = 1 - t;
  return 1 - inv * inv;
};

export const getEase = (name: string | undefined) => {
  if (name === 'power2.out') {
    return easeOutPower2;
  }
  return (t: number) => t;
};

export const startTween = ({
  from,
  to,
  durationMs,
  ease,
  onStart,
  onUpdate,
  onComplete,
}: {
  from: number;
  to: number;
  durationMs: number;
  ease: (t: number) => number;
  onStart?: () => void;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}) => {
  if (durationMs <= 0 || from === to) {
    onStart?.();
    onUpdate(to);
    onComplete?.();
    return () => {};
  }

  let rafId: number | null = null;
  let cancelled = false;
  const start = performance.now();

  onStart?.();
  onUpdate(from);

  const tick = (now: number) => {
    if (cancelled) {
      return;
    }

    const elapsed = now - start;
    const progress = Math.min(elapsed / durationMs, 1);
    const eased = ease(progress);
    const value = from + (to - from) * eased;
    onUpdate(value);

    if (progress >= 1) {
      onComplete?.();
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return () => {
    cancelled = true;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  };
};

export const createTweenValue = (
  initial = 0,
  options?: {
    duration?: number;
    ease?: string;
    onUpdate?: (v: number) => void;
    onStart?: () => void;
    onComplete?: () => void;
  },
) => {
  const ref = { value: initial };
  let cancel: (() => void) | null = null;
  let lastTarget = initial;

  const set = (target: number) => {
    if (target === lastTarget) return;
    lastTarget = target;

    if (cancel) {
      cancel();
      cancel = null;
    }

    const from = ref.value;
    const durationMs = (options?.duration ?? 1.5) * 1000;
    cancel = startTween({
      from,
      to: target,
      durationMs,
      ease: getEase(options?.ease ?? 'power2.out'),
      onStart: options?.onStart,
      onUpdate: (value) => {
        ref.value = value;
        options?.onUpdate?.(value);
      },
      onComplete: () => {
        cancel = null;
        options?.onComplete?.();
      },
    });
  };

  const get = () => ref.value;

  return { get, set };
};

export const createColorTween = (
  initial: Color | string,
  onUpdate: (color: Color) => void,
) => {
  const current = new Color(initial);
  let cancel: (() => void) | null = null;

  const setTarget = (
    newColor: Color | string,
    options: {
      duration?: number;
      ease?: string;
      onComplete?: () => void;
    } = {},
  ) => {
    const next = new Color(newColor);

    if (current.equals(next)) return;

    if (cancel) {
      cancel();
      cancel = null;
    }

    const from = { r: current.r, g: current.g, b: current.b };
    const to = { r: next.r, g: next.g, b: next.b };

    cancel = startTween({
      from: 0,
      to: 1,
      durationMs: (options.duration ?? 1.5) * 1000,
      ease: getEase(options.ease ?? 'power2.out'),
      onUpdate: (p) => {
        current.setRGB(
          from.r + (to.r - from.r) * p,
          from.g + (to.g - from.g) * p,
          from.b + (to.b - from.b) * p,
        );
        onUpdate(current);
      },
      onComplete: () => {
        cancel = null;
        options.onComplete?.();
      },
    });
  };

  return {
    current,
    setTarget,
  };
};
