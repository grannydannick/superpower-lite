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
      className="max-w-[1600px] md:space-y-6 lg:py-0"
    >
      {/* Mobile: Greeting at top */}
      <div className="lg:hidden">
        <Greeting />
      </div>

      {/* Desktop: Split screen layout */}
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-6 p-4 lg:h-full lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-8">
        {/* Left column: Static, full height (digital twin placeholder) */}
        <DigitalTwinCard />

        {/* Right column: Scrollable cards */}
        <div className="flex flex-col pb-20 lg:pb-60">
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
