import { createFileRoute } from '@tanstack/react-router';
import { Suspense, type ReactNode } from 'react';

import { ContentLayout } from '@/components/layouts';
import { CardSkeleton } from '@/features/homepage/components/card-skeleton';
import { DigitalTwinCard } from '@/features/homepage/components/digital-twin-card';
import { Greeting } from '@/features/homepage/components/greeting';
import { useHomepageState } from '@/features/homepage/hooks/use-homepage-state';
import { WearableReportToast } from '@/features/wearables/components/wearable-report-toast';

export const Route = createFileRoute('/_app/')({
  component: HomepageComponent,
});

function HomepageComponent() {
  const { visibleCards, isLoading } = useHomepageState();

  const visibleCardContent: ReactNode[] = [];
  for (const { id, component: Component } of visibleCards) {
    visibleCardContent.push(
      <Suspense key={id} fallback={<CardSkeleton />}>
        <Component />
      </Suspense>,
    );
  }

  return (
    <ContentLayout
      title="Home"
      variant="homepage"
      className="max-w-[1600px] pt-6 md:space-y-6 lg:py-0"
    >
      <WearableReportToast />
      <div className="lg:hidden">
        <Greeting />
      </div>

      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-6 lg:h-full lg:grid-cols-3 lg:gap-16 lg:px-12 lg:py-8 xl:grid-cols-2">
        <DigitalTwinCard />

        <div className="flex flex-col pb-20 lg:col-span-2 lg:pb-60 xl:col-span-1">
          {isLoading ? (
            <div className="space-y-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : visibleCards.length === 0 ? (
            <div className="text-center text-zinc-500">
              <p>No cards to display at this time.</p>
            </div>
          ) : (
            <div className="space-y-6 lg:px-2">{visibleCardContent}</div>
          )}
        </div>
      </div>
    </ContentLayout>
  );
}
