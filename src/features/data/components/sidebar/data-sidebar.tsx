import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router';

import { Link } from '@/components/ui/link';
import { Skeleton } from '@/components/ui/skeleton';
import { H3 } from '@/components/ui/typography';
import { useSummary } from '@/features/summary/api/get-summary';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';

import { useCategories } from '../../api/get-categories';
import { useDataFilterStore } from '../../stores/data-filter-store';
import { encodeCategory } from '../../utils/category/encode-category';

import { DataSidebarLink } from './data-sidebar-link';

const PureDataSidebar = () => {
  const selectorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const previousActiveCategoryRef = useRef<string | null>(null);
  const summaryQuery = useSummary();
  const categoriesQuery = useCategories();

  const isLoading = categoriesQuery.isLoading || summaryQuery.isLoading;

  const categories = categoriesQuery.data?.categories ?? [];
  const gating = summaryQuery.data;

  const [searchParams] = useSearchParams();

  const activeCategory = searchParams.get('category');

  const { updateCategories, clearCategories } = useDataFilterStore();

  const { width } = useWindowDimensions();
  const isMobile = useMemo(() => width < 767, [width]);

  const updateCategoryFilter = useCallback(
    (category: string | null) => {
      if (category) {
        updateCategories([category]);
      } else {
        clearCategories();
      }
    },
    [updateCategories, clearCategories],
  );

  useEffect(() => {
    if (isLoading) return;

    if (previousActiveCategoryRef.current !== activeCategory) {
      updateCategoryFilter(activeCategory);
      previousActiveCategoryRef.current = activeCategory;
    }
  }, [activeCategory, isLoading, updateCategoryFilter]);

  const repositionSelector = useCallback(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      const selector = selectorRef.current;

      const activeKey = activeCategory
        ? decodeURIComponent(activeCategory).toLowerCase()
        : 'summary';
      const activeCategoryElement = document.getElementById(
        `selector-${activeKey}`,
      );

      if (activeCategoryElement && selector) {
        selector.style.setProperty(
          'transform',
          `translateY(${activeCategoryElement.offsetTop}px) translateX(${activeCategoryElement.offsetLeft - 8}px)`,
        );
        selector.style.setProperty(
          'width',
          `${activeCategoryElement.offsetWidth}px`,
        );

        // On mobile (below md), scroll the horizontal container so the active
        const container = containerRef.current;
        if (isMobile && container) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = activeCategoryElement.getBoundingClientRect();
          const currentLeft = container.scrollLeft;
          const elementLeftInContainer =
            elementRect.left - containerRect.left + currentLeft;
          const targetLeft =
            elementLeftInContainer -
            container.clientWidth / 2 +
            activeCategoryElement.offsetWidth / 2;

          container.scrollTo({
            left: Math.max(0, targetLeft),
            behavior: 'smooth',
          });
        }
      }
    });
  }, [activeCategory, isMobile]);

  useEffect(() => {
    repositionSelector();
  }, [activeCategory, isLoading, repositionSelector]);

  const categoriesContent = useMemo(() => {
    if (isLoading) {
      return Array.from({ length: 17 }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-6 shrink-0 rounded-full"
          style={{
            width: `${Math.max(96, Math.random() * 128)}px`,
          }}
          variant="shimmer"
        />
      ));
    }

    const items = [] as JSX.Element[];

    items.push(
      <DataSidebarLink
        key="overview"
        category={{
          category: 'Summary',
          value: '-',
        }}
        isActive={activeCategory === null}
      />,
    );

    if (gating && !gating.hasCompletedCarePlan) {
      return items; // only show Summary until AIAP is completed
    }

    if (categories.length === 0) return [];

    categories.forEach((category) => {
      const isActive =
        encodeCategory(category.category) ===
        encodeCategory(activeCategory ?? '');

      items.push(
        <DataSidebarLink
          key={category.category}
          category={category}
          isActive={isActive}
        />,
      );
    });

    return items;
  }, [isLoading, activeCategory, categories, gating]);

  return (
    <aside className="relative left-1/2 z-10 col-span-1 flex w-screen -translate-x-1/2 flex-col md:left-0 md:w-40 md:translate-x-0 lg:w-auto">
      <div className="relative z-30 mb-4 flex gap-4 bg-zinc-50/20 px-6 md:sticky md:top-16 md:mb-0 md:px-0 md:backdrop-blur-lg">
        <Link to="/data">
          <H3>Twin</H3>
        </Link>
        <Link to="/data/records" className="border-b-2 border-b-transparent">
          <H3 className="text-black/20 transition-all hover:text-black/40">
            Records
          </H3>
        </Link>
      </div>

      <div
        className={cn(
          'z-[51] flex items-center transition-all',
          'w-full px-4 [mask-image:linear-gradient(to_right,transparent_0%,black_5%,black_85%,transparent_95%)] md:w-auto md:[mask-image:none]',
          'md:sticky md:inset-auto md:top-28 md:z-20 md:my-4 md:max-w-none md:-translate-y-3 md:px-0 md:pt-0',
        )}
      >
        <div
          ref={containerRef}
          className="relative -ml-2 flex max-h-svh w-full place-items-start items-start justify-start gap-3 overflow-x-auto overflow-y-hidden p-2 scrollbar scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-300 md:max-h-none md:flex-col md:overflow-visible md:px-2 md:py-8"
        >
          {!isLoading && (
            <div
              ref={selectorRef}
              className={cn(
                'pointer-events-none absolute top-0 h-full max-h-[30px] w-full translate-y-8 rounded-full transition-all duration-300 ease-out',
                isLoading && 'opacity-0',
              )}
            >
              <div
                key={activeCategory}
                className="max-md:animate-grow-shrink-horizontal md:animate-grow-shrink-vertical h-full rounded-full border border-zinc-200 bg-white shadow-md shadow-black/5"
              />
            </div>
          )}
          {categoriesContent}
        </div>
      </div>
    </aside>
  );
};

export const DataSidebar = memo(PureDataSidebar);
