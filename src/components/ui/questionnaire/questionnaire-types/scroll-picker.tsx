import { useCallback, useEffect, useRef } from 'react';
import { useWebHaptics } from 'web-haptics/react';

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 6;
const CENTER_OFFSET = Math.floor(VISIBLE_ITEMS / 2);
const SNAP_DELAY_MS = 80;
const MAX_ROTATE_DEG = 90;

function applyTransforms(
  scrollEl: HTMLElement,
  scrollTop: number,
  itemCount: number,
) {
  const halfItem = ITEM_HEIGHT / 2;
  const range = CENTER_OFFSET * ITEM_HEIGHT;

  for (let i = 0; i < itemCount; i++) {
    const child = scrollEl.children[i] as HTMLElement | undefined;
    if (!child) continue;

    const itemTop = i * ITEM_HEIGHT + CENTER_OFFSET * ITEM_HEIGHT;
    const distPx = itemTop - scrollTop - CENTER_OFFSET * ITEM_HEIGHT;
    const normalised = distPx / range;
    const clamped = Math.max(-1, Math.min(1, normalised));
    const rotateX = clamped * MAX_ROTATE_DEG;
    const absClamped = Math.abs(clamped);

    const edgeOffset = distPx < 0 ? halfItem : distPx > 0 ? -halfItem : 0;

    child.style.transform = `translateY(${edgeOffset}px) rotateX(${-rotateX}deg) translateY(${-edgeOffset}px)`;
    child.style.opacity = `${1 - 0.75 * absClamped}`;
  }
}

function findClosestIndex(values: number[], target: number): number {
  if (values.length === 0) return 0;
  let bestIdx = 0;
  let bestDiff = Math.abs(values[0] - target);
  for (let i = 1; i < values.length; i++) {
    const diff = Math.abs(values[i] - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
}

export function ScrollPicker({
  values,
  selectedValue,
  onChange,
  formatLabel,
}: {
  values: number[];
  selectedValue: number;
  onChange: (value: number) => void;
  formatLabel: (value: number) => string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const rafRef = useRef<number>(0);
  const lastTickIndexRef = useRef<number | null>(null);
  const { trigger: triggerHaptic } = useWebHaptics();
  // Tracks the last index we set programmatically (from useEffect or our own
  // snap scrollTo), so we can both (a) avoid re-setting scrollTop and stomping
  // on an in-flight smooth-scroll animation, and (b) suppress the snap
  // callback for scroll events caused by our own programmatic scroll.
  const lastProgrammaticIndexRef = useRef<number | null>(null);

  const selectedIndex = findClosestIndex(values, selectedValue);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (lastProgrammaticIndexRef.current === selectedIndex) {
      // We already moved to this index (e.g. via snap scrollTo). Don't
      // interrupt any in-progress smooth-scroll animation.
      applyTransforms(el, el.scrollTop, values.length);
      return;
    }
    lastProgrammaticIndexRef.current = selectedIndex;
    lastTickIndexRef.current = selectedIndex;
    el.scrollTop = selectedIndex * ITEM_HEIGHT;
    applyTransforms(el, el.scrollTop, values.length);
  }, [selectedIndex, values]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      applyTransforms(el, el.scrollTop, values.length);

      const centerIndex = Math.round(el.scrollTop / ITEM_HEIGHT);
      if (
        lastTickIndexRef.current !== null &&
        centerIndex !== lastTickIndexRef.current
      ) {
        triggerHaptic(8, { intensity: 0.4 });
      }
      lastTickIndexRef.current = centerIndex;
    });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const index = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, values.length - 1));

      // If the scroll settled on the index we last set programmatically,
      // don't fire onChange — that scroll wasn't user-initiated and would
      // otherwise cause silent value drift (e.g. lbToKg(120) = 54.4 → 54).
      const wasProgrammatic = lastProgrammaticIndexRef.current === clampedIndex;

      if (el.scrollTop !== clampedIndex * ITEM_HEIGHT) {
        lastProgrammaticIndexRef.current = clampedIndex;
        el.scrollTo({ top: clampedIndex * ITEM_HEIGHT, behavior: 'smooth' });
      }

      if (!wasProgrammatic && values[clampedIndex] !== selectedValue) {
        lastProgrammaticIndexRef.current = clampedIndex;
        onChange(values[clampedIndex]);
      }
    }, SNAP_DELAY_MS);
  }, [values, selectedValue, onChange, triggerHaptic]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
    >
      <div
        className="pointer-events-none absolute left-0 right-0 rounded-lg bg-muted"
        style={{
          top: CENTER_OFFSET * ITEM_HEIGHT,
          height: ITEM_HEIGHT,
        }}
      />

      <div
        ref={containerRef}
        className="relative h-full overflow-y-auto"
        style={{
          scrollSnapType: 'y mandatory',
          scrollPaddingTop: CENTER_OFFSET * ITEM_HEIGHT,
          paddingTop: CENTER_OFFSET * ITEM_HEIGHT,
          paddingBottom: CENTER_OFFSET * ITEM_HEIGHT,
        }}
        onScroll={handleScroll}
      >
        {values.map((value) => (
          <div
            key={value}
            className="flex items-center justify-center text-lg will-change-transform"
            style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'start' }}
          >
            {formatLabel(value)}
          </div>
        ))}
      </div>
    </div>
  );
}
