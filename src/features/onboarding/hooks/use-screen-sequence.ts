import {
  type ComponentType,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

// ============================================================================
// Sequence Context (for child components to access navigation)
// ============================================================================

type SequenceContextValue = {
  next: () => void;
  back: () => void;
  skipNext: () => void;
  screenIndex: number;
  totalScreens: number;
};

const SequenceContext = createContext<SequenceContextValue | null>(null);

export const SequenceProvider = SequenceContext.Provider;

export const useSequence = () => {
  const ctx = useContext(SequenceContext);
  if (!ctx) throw new Error('useSequence must be used within SequenceProvider');
  return ctx;
};

// ============================================================================
// Screen Sequence Hook (manages sequence state)
// ============================================================================

type ScreenComponent = ComponentType<Record<string, never>>;

type ScreenSequenceOptions<TScreens extends readonly ScreenComponent[]> = {
  screens: TScreens;
  /** Called when navigating forward from the last screen */
  onComplete?: () => void;
  /** Called when navigating back from the first screen */
  onBack?: () => void;
  /** Initial screen index (default: 0) */
  initialIndex?: number;
};

type ScreenSequenceReturn<TScreens extends readonly ScreenComponent[]> = {
  /** The current screen component to render */
  Screen: TScreens[number];
  /** Current screen index (0-based) */
  screenIndex: number;
  /** Total number of screens */
  totalScreens: number;
  /** Whether the current screen is the first */
  isFirst: boolean;
  /** Whether the current screen is the last */
  isLast: boolean;
  /** Navigate to the next screen, or call onComplete if on last */
  next: () => void;
  /** Navigate to the previous screen, or call onBack if on first */
  back: () => void;
  /** Navigate to a specific screen by index */
  goTo: (index: number) => void;
  /** Pre-built value object for SequenceProvider */
  sequenceValue: SequenceContextValue;
};

const NAVIGATION_COOLDOWN_MS = 350;

export const useScreenSequence = <TScreens extends readonly ScreenComponent[]>({
  screens,
  onComplete,
  onBack,
  initialIndex = 0,
}: ScreenSequenceOptions<TScreens>): ScreenSequenceReturn<TScreens> => {
  const [screenIndex, setScreenIndex] = useState(initialIndex);
  const isNavigatingRef = useRef(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFirst = screenIndex === 0;
  const isLast = screenIndex === screens.length - 1;
  const Screen = screens[screenIndex] as TScreens[number];

  const startNavigationCooldown = useCallback(() => {
    isNavigatingRef.current = true;
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }
    cooldownTimerRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, NAVIGATION_COOLDOWN_MS);
  }, []);

  const next = useCallback(() => {
    if (isNavigatingRef.current) return;
    startNavigationCooldown();

    if (isLast) {
      onComplete?.();
    } else {
      setScreenIndex((i) => i + 1);
    }
  }, [isLast, onComplete, startNavigationCooldown]);

  const back = useCallback(() => {
    if (isNavigatingRef.current) return;
    startNavigationCooldown();

    if (isFirst) {
      onBack?.();
    } else {
      setScreenIndex((i) => i - 1);
    }
  }, [isFirst, onBack, startNavigationCooldown]);

  const skipNext = useCallback(() => {
    if (isNavigatingRef.current) return;
    startNavigationCooldown();

    setScreenIndex((i) => {
      if (i + 2 >= screens.length) {
        onComplete?.();
        return i;
      }
      return i + 2;
    });
  }, [onComplete, screens.length, startNavigationCooldown]);

  const goTo = useCallback(
    (index: number) => {
      if (isNavigatingRef.current) return;
      startNavigationCooldown();

      if (index >= 0 && index < screens.length) {
        setScreenIndex(index);
      }
    },
    [screens.length, startNavigationCooldown],
  );

  const sequenceValue = useMemo(
    () => ({
      next,
      back,
      skipNext,
      screenIndex,
      totalScreens: screens.length,
    }),
    [next, back, skipNext, screenIndex, screens.length],
  );

  return {
    Screen,
    screenIndex,
    totalScreens: screens.length,
    isFirst,
    isLast,
    next,
    back,
    goTo,
    sequenceValue,
  };
};
