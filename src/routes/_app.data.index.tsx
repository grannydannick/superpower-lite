import { createFileRoute } from '@tanstack/react-router';
import { Lock } from 'lucide-react';

import { ContentLayout } from '@/components/layouts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import { useCategories } from '@/features/data/api/get-categories';
import { CategoryView } from '@/features/data/components/category-view';
import { Overview } from '@/features/data/components/overview';
import { DataSidebar } from '@/features/data/components/sidebar/data-sidebar';
import { encodeCategory } from '@/features/data/utils/category/encode-category';
import { DigitalTwin } from '@/features/digital-twin/components/digital-twin';
import { useSummary } from '@/features/summary/api/get-summary';
import { WearablesDataView } from '@/features/wearables/components/wearables-data-view';
import { useWearablesData } from '@/features/wearables/hooks/use-wearables-data';

export const Route = createFileRoute('/_app/data/')({
  component: DataComponent,
});

function DataComponent() {
  const summaryQuery = useSummary();
  const categoriesQuery = useCategories();
  const navigate = Route.useNavigate();
  const category = Route.useSearch({ select: (s) => s.category });

  const isLoading = categoriesQuery.isLoading || summaryQuery.isLoading;

  const categories = categoriesQuery.data?.categories ?? [];
  const gating = summaryQuery.data;

  const isWearables = category === 'wearables';
  const { showEmptyState: showWearablesLock } = useWearablesData({
    enabled: isWearables,
  });

  const activeCategory = categories.find(
    (c) => encodeCategory(c.category) === encodeCategory(category ?? ''),
  );
  const shouldShowCategoryView =
    activeCategory != null || (category != null && category.length > 0);

  if (
    category != null &&
    category.length > 0 &&
    !isWearables &&
    !isLoading &&
    !categories.some(
      (c) => encodeCategory(c.category) === encodeCategory(category),
    )
  ) {
    return (
      <div className="flex h-full min-h-[calc(100vh-100px)] flex-col items-center justify-center gap-2">
        <H2 className="text-center">Category not found.</H2>
        <Body1 className="mb-2 text-center text-zinc-500">
          Sorry, we didn&apos;t discover this superpower yet.
        </Body1>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => void navigate({ to: '/data' })}
        >
          Back to overview
        </Button>
      </div>
    );
  }

  return (
    <ContentLayout title="Data" className="max-md:pt-5 md:pt-9">
      <div className="mt-[5px] flex size-full min-h-[calc(100vh-256px)] flex-1 flex-col overflow-visible md:grid md:grid-cols-10 xl:grid-cols-9">
        <DataSidebar />
        <div className="relative top-0 z-0 col-span-3 mb-[-40px] h-[512px] max-h-[50vh] md:invisible md:sticky md:-mt-16 md:h-full md:max-h-[60vh] xl:visible">
          {(isWearables ? showWearablesLock : gating?.hasPartialResults) && (
            <Badge
              variant="secondary"
              className="absolute left-1/2 top-1/2 z-10 -mt-28 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 text-balance bg-zinc-100/50 px-3 py-2 text-sm text-secondary backdrop-blur-sm max-lg:truncate md:hidden lg:mt-0 lg:flex lg:max-w-40 xl:max-w-full xl:truncate"
            >
              <Lock className="inline size-3.5 shrink-0" />
              {isWearables
                ? 'Syncing wearables data'
                : 'Unlocks after data is processed'}
            </Badge>
          )}
          {!isLoading && <DigitalTwin category={activeCategory} />}
        </div>
        <div className="relative z-10 col-span-6 bg-zinc-50/75 backdrop-blur-lg md:pt-16 xl:col-span-5">
          {isWearables ? (
            <WearablesDataView />
          ) : shouldShowCategoryView ? (
            <CategoryView />
          ) : (
            <Overview />
          )}
        </div>
      </div>
    </ContentLayout>
  );
}
