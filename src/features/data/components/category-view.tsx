import { useSearchParams } from 'react-router-dom';

import { MiniScoreChart } from '@/components/ui/charts/mini-score-chart/mini-score-chart';
import { ScoreChart } from '@/components/ui/charts/score-chart/score-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { H4 } from '@/components/ui/typography';

import { useBiomarkers } from '../api';
import { useCategories } from '../api/get-categories';
import { encodeCategory } from '../utils/category/encode-category';

import { BiomarkerSkeletonRow } from './table/biomarker-skeleton-row';
import { CategoryDataTable } from './table/category-data-table';

export const CategoryView = () => {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useCategories();
  const activeCategoryData = categoriesData?.categories.find(
    (category) =>
      encodeCategory(category.category) ===
      encodeCategory(activeCategory ?? ''),
  );

  const { data: biomarkersData, isLoading: isBiomarkersLoading } =
    useBiomarkers({
      category: activeCategoryData?.category,
    });

  const isLoading = isCategoriesLoading || isBiomarkersLoading;

  if (!activeCategoryData) {
    return null;
  }

  const relatedBiomarkerIds = new Set(activeCategoryData.relatedBiomarkers);

  const categoryBiomarkers =
    biomarkersData?.biomarkers.filter((b) =>
      b.value?.some((v) => v.id && relatedBiomarkerIds.has(v.id)),
    ) ?? [];

  return (
    <div className="w-full space-y-4">
      {/* We're not showing the full detail view when we don't receive the biomarkers related to the category */}
      {categoryBiomarkers.length > 0 ? (
        <div className="mx-auto w-full flex-1 overflow-visible rounded-[24px] border-none bg-white p-6 scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300 hover:bg-white/80">
          <H4>{activeCategoryData?.category}</H4>
          <div className="flex w-full items-center justify-center py-2">
            {isLoading ? (
              <div className="flex size-full items-center justify-center gap-4">
                <Skeleton className="size-28 rounded-full" />
              </div>
            ) : (
              <ScoreChart
                biomarkers={categoryBiomarkers ?? []}
                value={activeCategoryData?.value}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {isLoading ? (
            <>
              <Skeleton className="size-8 rounded-full" />{' '}
              <Skeleton className="h-8 w-24" />
            </>
          ) : (
            <>
              <MiniScoreChart value={activeCategoryData.value} />
              <H4>{activeCategoryData?.category}</H4>
            </>
          )}
        </div>
      )}
      {isLoading ? (
        <div className="mt-8 w-full space-y-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <BiomarkerSkeletonRow key={index} />
          ))}
        </div>
      ) : (
        <div className="w-full space-y-3">
          <CategoryDataTable category={activeCategoryData} />
        </div>
      )}
    </div>
  );
};
