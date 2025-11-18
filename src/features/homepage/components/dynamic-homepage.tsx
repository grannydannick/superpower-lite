import { Suspense } from 'react';

import { ContentLayout } from '@/components/layouts';

import { useHomepageState } from '../hooks/use-homepage-state';

import { CardSkeleton } from './card-skeleton';
import { DigitalTwinCard } from './digital-twin-card';
import { Greeting } from './greeting';

export const DynamicHomepage = () => {
  const { visibleCards, isLoading } = useHomepageState();

  return (
    <ContentLayout
      title="Home"
      variant="homepage"
      className="!w-full !max-w-none !space-y-0 !p-0 lg:!flex lg:!h-[calc(100dvh-68px)] lg:!max-h-[calc(100dvh-68px)] lg:!flex-col lg:overflow-hidden"
    >
      {/* Mobile: Greeting at top */}
      <div className="p-4 lg:hidden">
        <Greeting />
      </div>

      {/* Desktop: Split screen layout */}
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-6 p-4 lg:h-full lg:grid-cols-2 lg:gap-16 lg:overflow-hidden lg:px-16 lg:py-8">
        {/* Left column: Static, full height (digital twin placeholder) */}
        <DigitalTwinCard />

        {/* Right column: Scrollable cards */}
        <div className="flex flex-col lg:overflow-y-auto">
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
            <div className="space-y-6 px-2">
              {visibleCards.map(({ id, component: Component }) => (
                <Suspense key={id} fallback={<CardSkeleton />}>
                  <Component />
                </Suspense>
              ))}
            </div>
          )}
        </div>
      </div>
    </ContentLayout>
  );
};
