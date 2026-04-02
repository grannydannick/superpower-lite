import { useSearch } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { ScoreChart } from '@/components/ui/charts/score-chart/score-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { H4 } from '@/components/ui/typography';
import { AnimatedIcon } from '@/features/messages/components/ai/animated-icon';
import { useAssistantStore } from '@/features/messages/stores/assistant-store';
import { useUser } from '@/lib/auth';

import { useBiomarkers } from '../api';
import { useBiomarkerSummary } from '../api/get-biomarker-summary';
import { useCategories } from '../api/get-categories';
import { encodeCategory } from '../utils/category/encode-category';

import { PersonalizedExplanation } from './personalized-explanation';
import { BiomarkerSkeletonRow } from './table/biomarker-skeleton-row';
import { CategoryDataTable } from './table/category-data-table';

export const CategoryView = () => {
  const activeCategory = useSearch({
    strict: false,
    select: (s) => s.category,
  });
  const contentRef = useRef<HTMLDivElement>(null);
  const { data: user } = useUser();
  const { openWithMessages } = useAssistantStore();

  const summaryQuery = useBiomarkerSummary({
    category: activeCategory ?? '',
  });

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

  const relatedBiomarkerIds = new Set(
    activeCategoryData.relatedBiomarkers ?? [],
  );

  const categoryBiomarkers =
    biomarkersData?.biomarkers.filter((b) =>
      b.value?.some((v) => v.id && relatedBiomarkerIds.has(v.id)),
    ) ?? [];

  const summaryAvailable = !summaryQuery.isError && !summaryQuery.isLoading;

  return (
    <div className="w-full space-y-4">
      <div className="relative mx-auto w-full flex-1 overflow-visible rounded-[24px] border-none bg-white p-6 pb-4 shadow-sm hover:bg-white/80">
        <H4>{activeCategoryData.category}</H4>
        <div className="mb-8 flex w-full items-center justify-center py-2">
          {isLoading ? (
            <div className="flex size-full items-center justify-center gap-4">
              <Skeleton className="size-28 rounded-full" />
            </div>
          ) : (
            <ScoreChart
              biomarkers={categoryBiomarkers ?? []}
              value={activeCategoryData.value}
            />
          )}
        </div>
        <div className="space-y-4">
          <div ref={contentRef} className="space-y-4">
            <PersonalizedExplanation
              key={activeCategoryData.category}
              category={activeCategoryData.category}
            />
            {summaryAvailable && (
              <Button
                variant="ghost"
                size="small"
                className="group h-auto gap-1 p-0"
                onClick={() => {
                  const presetMessage = `Hi ${user?.firstName ?? 'there'}, what would you like to update about your medical history? This could be things like a new therapy, updated diet, new habits or anything else you would like us to remember about you.`;

                  openWithMessages([
                    {
                      id: crypto.randomUUID(),
                      role: 'assistant',
                      parts: [{ type: 'text', text: presetMessage }],
                    },
                  ]);
                }}
              >
                <AnimatedIcon state="idle" size={20} className="-mt-0.5" />
                Update my health{' '}
                <ArrowUpRight className="-mt-0.5 size-3.5 transition-all duration-200 ease-out group-hover:-translate-y-px group-hover:translate-x-px" />
              </Button>
            )}
          </div>
        </div>
      </div>
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
