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
import type { DataSummaryCategory } from '@/features/data/types/data-api';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

import { useCheckPerformance } from '../hooks/use-check-performance';
import { Area, Level } from '../types';

import { DigitalTwinFallback } from './digital-twin-fallback';

const DigitalTwinModel = lazy(() => import('./digital-twin-model'));

interface HealthAreaState {
  area: Area;
  level: Level;
}

const ALL_HEALTH_AREAS: HealthAreaState[] = [
  { area: 'heart', level: 'good' },
  { area: 'metabolic', level: 'neutral' },
  { area: 'liver', level: 'good' },
  { area: 'kidney', level: 'good' },
  { area: 'inflammation', level: 'good' },
  { area: 'nutrients', level: 'neutral' },
  { area: 'immune', level: 'good' },
  { area: 'thyroid', level: 'good' },
  { area: 'sex', level: 'neutral' },
];

const CyclingDigitalTwinModel = ({
  healthAreas,
  model,
  overlayStrength,
  onLoadingStateChange,
}: {
  healthAreas: HealthAreaState[];
  model: 'male' | 'female';
  overlayStrength: number;
  onLoadingStateChange: (state: number) => void;
}) => {
  const [areaIdx, setAreaIdx] = useState(0);
  let healthAreasSignature = '';

  for (const healthArea of healthAreas) {
    healthAreasSignature += `${healthArea.area}:${healthArea.level}|`;
  }

  useEffect(() => {
    if (healthAreas.length === 0) return;

    const interval = setInterval(() => {
      setAreaIdx((prev) => (prev + 1) % healthAreas.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [healthAreas.length, healthAreasSignature]);

  const currentArea = healthAreas[areaIdx % healthAreas.length];

  return (
    <DigitalTwinModel
      model={model}
      area={currentArea?.area}
      level={currentArea?.level}
      overlayStrength={overlayStrength}
      onLoadingStateChange={onLoadingStateChange}
    />
  );
};

export const DigitalTwin = ({
  category,
  filterCategories,
}: {
  category?: DataSummaryCategory;
  filterCategories?: string[];
}) => {
  const [ready, setReady] = useState(false);
  const [loadState, setLoadState] = useState<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastProgressRef = useRef<number>(-1);

  const { data: user, isLoading: isUserLoading } = useUser();
  const { isPerformanceSufficient, isLoading: isPerformanceLoading } =
    useCheckPerformance();

  const model: 'male' | 'female' =
    user?.gender?.toLowerCase() === 'male' ? 'male' : 'female';

  const handleLoadingStateChange = useCallback((state: number) => {
    const scaled = Math.round((100 * state) / 43);
    if (scaled === lastProgressRef.current) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      lastProgressRef.current = scaled;
      setLoadState(scaled);
    });
  }, []);

  const level = useMemo<Level | undefined>(() => {
    switch (category?.score?.value) {
      case 'A':
        return 'good';
      case 'B':
        return 'neutral';
      case 'C':
        return 'bad';
      default:
        return undefined;
    }
  }, [category]);

  const area = useMemo<Area | undefined>(() => {
    const key = category?.title?.toLowerCase();
    return key ? CATEGORY_MAP[key] : undefined;
  }, [category]);

  const healthAreas = useMemo(() => {
    if (filterCategories === undefined) return ALL_HEALTH_AREAS;

    const allowedAreas = new Set<Area>();
    for (const categoryName of filterCategories) {
      const mappedArea = CATEGORY_MAP[categoryName.toLowerCase()];
      if (mappedArea === undefined) continue;
      allowedAreas.add(mappedArea);
    }

    const filteredAreas: HealthAreaState[] = [];
    for (const healthArea of ALL_HEALTH_AREAS) {
      if (!allowedAreas.has(healthArea.area)) continue;
      filteredAreas.push(healthArea);
    }

    return filteredAreas;
  }, [filterCategories]);

  const cycleKey = (() => {
    if (category != null) return category.slug;
    if (filterCategories === undefined) return 'all-categories';
    if (filterCategories.length === 0) return 'no-categories';
    return filterCategories.join('|');
  })();

  const overlayStrength =
    category != null || (filterCategories?.length ?? 0) > 0 ? 1.0 : 0.5;
  const shouldAnimateCategories =
    user?.resultsGate?.hasFinalDiagnosticReport !== false;

  const markReady = useCallback(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    const anyWindow: any = window as any;
    if (typeof anyWindow.requestIdleCallback === 'function') {
      anyWindow.requestIdleCallback(markReady, { timeout: 300 });
      return;
    }

    const t = setTimeout(markReady, 0);
    return () => clearTimeout(t);
  }, [markReady]);

  if (isPerformanceLoading) {
    return null;
  }

  if (!isPerformanceSufficient) {
    return <DigitalTwinFallback />;
  }

  return (
    <div
      className={cn(
        'will-change-opacity -mt-12 h-[24rem] w-full shrink-0 cursor-grab transition-opacity duration-1000 active:cursor-grabbing md:-mt-20 md:h-[120vh] md:max-h-[76rem] [&>div]:!touch-pan-y md:[@media(max-height:800px)]:h-[56rem]',
        loadState === 0 && 'opacity-0',
      )}
    >
      {!isUserLoading && ready && (
        <Suspense fallback={null}>
          {category != null ? (
            <DigitalTwinModel
              model={model}
              area={area}
              level={level}
              overlayStrength={overlayStrength}
              onLoadingStateChange={handleLoadingStateChange}
            />
          ) : !shouldAnimateCategories ? (
            <DigitalTwinModel
              model={model}
              overlayStrength={overlayStrength}
              onLoadingStateChange={handleLoadingStateChange}
            />
          ) : (
            <CyclingDigitalTwinModel
              key={cycleKey}
              healthAreas={healthAreas}
              model={model}
              overlayStrength={overlayStrength}
              onLoadingStateChange={handleLoadingStateChange}
            />
          )}
        </Suspense>
      )}
    </div>
  );
};
