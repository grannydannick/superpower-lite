import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { CATEGORY_MAP } from '@/const/category-map';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Category } from '@/types/api';

import { useCheckPerformance } from '../hooks/use-check-performance';
import { Level } from '../types';

import { DigitalTwinFallback } from './digital-twin-fallback';

const DigitalTwinModel = lazy(() => import('./digital-twin-model'));

export const DigitalTwin = ({ category }: { category?: Category }) => {
  const [ready, setReady] = useState(false);
  const [loadState, setLoadState] = useState<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastProgressRef = useRef<number>(-1);

  const { data: user, isLoading: isUserLoading } = useUser();
  const { isPerformanceSufficient, isLoading: isPerformanceLoading } =
    useCheckPerformance();

  // Stable gender → model mapping
  const model = useMemo<'male' | 'female'>(
    () => (user?.gender === 'MALE' ? 'male' : 'female'),
    [user?.gender],
  );

  const handleLoadingStateChange = useCallback((state: number) => {
    const scaled = Math.round((100 * state) / 43);
    if (scaled === lastProgressRef.current) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      lastProgressRef.current = scaled;
      setLoadState(scaled);
    });
  }, []);

  const level = useMemo(() => {
    switch (category?.value) {
      case 'A':
        return 'good';
      case 'B':
        return 'neutral';
      case 'C':
        return 'bad';
    }
  }, [category]) as Level;

  const area = useMemo(() => {
    const key = category?.category?.toLowerCase();
    return key ? CATEGORY_MAP[key] : undefined;
  }, [category]);

  // defer mounting the heavy 3D scene until the main thread is idle
  useEffect(() => {
    const anyWindow: any = window as any;
    if (typeof anyWindow.requestIdleCallback === 'function') {
      anyWindow.requestIdleCallback(() => setReady(true), { timeout: 300 });
    } else {
      const t = setTimeout(() => setReady(true), 0);
      return () => clearTimeout(t);
    }
  }, []);

  if (isPerformanceLoading) {
    return null;
  }

  if (!isPerformanceSufficient) {
    return <DigitalTwinFallback />;
  }

  return (
    <div
      className={cn(
        'will-change-opacity -mt-12 h-[28rem] w-full cursor-grab transition-opacity duration-1000 active:cursor-grabbing md:mt-0 md:h-[80vh] md:max-h-[56rem] [&>div]:!touch-pan-y md:[@media(max-height:800px)]:h-[48rem]',
        loadState === 0 && 'opacity-0',
      )}
    >
      {!isUserLoading && ready && (
        <Suspense fallback={null}>
          <DigitalTwinModel
            model={model}
            area={area}
            level={level}
            onLoadingStateChange={handleLoadingStateChange}
          />
        </Suspense>
      )}
    </div>
  );
};
