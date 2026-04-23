import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { Suspense, type ReactElement, type ReactNode } from 'react';

import { ErrorBoundary } from '@/components/errors/error-boundary';
import { ContentLayout } from '@/components/layouts';
import { Body2 } from '@/components/ui/typography';
import { BiomarkersDistributionBar } from '@/features/data/components/biomarkers-distribution-bar';
import {
  creditsQuery,
  ordersQuery,
  phlebotomyServicesQuery,
  prefetchHomepageQueries,
} from '@/features/homepage/api/queries';
import { ActionItemsCard } from '@/features/homepage/cards/action-items-card';
import { ActionableOrdersCard } from '@/features/homepage/cards/actionable-orders-card';
import { LabOrderCard } from '@/features/homepage/cards/lab-order/lab-order-card';
import { ProtocolGoalsCard } from '@/features/homepage/cards/protocol-goals-card';
import { LiveBetterTogetherCard } from '@/features/homepage/cards/referral-card';
import { RetestingCtaCard } from '@/features/homepage/cards/retesting-cta-card';
import { ScoreCards } from '@/features/homepage/cards/score-cards';
import { CardSkeleton } from '@/features/homepage/components/card-skeleton';
import { DigitalTwinCardWithInsights } from '@/features/homepage/components/digital-twin-card-with-insights';
import { Greeting } from '@/features/homepage/components/greeting';
import {
  HomepageCard,
  HomepageLinkCard,
} from '@/features/homepage/components/homepage-card';
import { getRetestingCtaVisibility } from '@/features/homepage/lib/get-retesting-cta-visibility';
import { useNowMs } from '@/hooks/use-now-ms';
import { useUser } from '@/lib/auth';
import { type Credit, type RequestGroup } from '@/types/api';

export const Route = createFileRoute('/_app/')({
  loader: ({ context: { queryClient } }) => {
    void prefetchHomepageQueries(queryClient);
  },
  component: HomepageComponent,
});

const ExploreMoreLink = ({ to }: { to: string }) => (
  <Link
    to={to}
    className="group inline-flex items-center gap-1 text-sm font-medium text-secondary transition-colors hover:text-primary"
  >
    Explore more
    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
  </Link>
);

const HomepageUnavailableCard = () => {
  return (
    <HomepageCard>
      <Body2 className="text-zinc-500">
        This section is temporarily unavailable.
      </Body2>
    </HomepageCard>
  );
};

const HomepageSection = ({
  children,
  loadingFallback,
  errorFallback,
  className,
}: {
  children: ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: ReactElement;
  className?: string;
}) => {
  const suspenseFallback = loadingFallback ?? <CardSkeleton />;
  const boundaryFallback = errorFallback ?? <HomepageUnavailableCard />;
  const content = (
    <ErrorBoundary fallback={boundaryFallback}>
      <Suspense fallback={suspenseFallback}>{children}</Suspense>
    </ErrorBoundary>
  );

  if (className == null) return content;

  return <div className={className}>{content}</div>;
};

function HomepageRetestingCta() {
  const { data: ordersData } = useSuspenseQuery(ordersQuery());
  const { data: creditsData } = useSuspenseQuery(creditsQuery());
  const nowMs = useNowMs();
  const requestGroups = ordersData.requestGroups;
  const credits = creditsData.credits;
  const shouldShowRetestingCtaWithoutCredits = getRetestingCtaVisibility({
    nowMs,
    requestGroups,
    credits: [],
    phlebotomyServiceIds: [],
  });
  if (!shouldShowRetestingCtaWithoutCredits) return null;
  if (credits.length === 0) return <RetestingCtaCard source="homepage" />;

  return (
    <HomepageRetestingCtaWithPhlebotomyServices
      nowMs={nowMs}
      requestGroups={requestGroups}
      credits={credits}
    />
  );
}

function HomepageRetestingCtaWithPhlebotomyServices({
  nowMs,
  requestGroups,
  credits,
}: {
  nowMs: number;
  requestGroups: RequestGroup[];
  credits: Credit[];
}) {
  const { data: phlebotomyServicesData } = useSuspenseQuery(
    phlebotomyServicesQuery(),
  );
  const phlebotomyServiceIds: string[] = [];

  for (const service of phlebotomyServicesData.services) {
    phlebotomyServiceIds.push(service.id);
  }

  const shouldShowRetestingCta = getRetestingCtaVisibility({
    nowMs,
    requestGroups,
    credits,
    phlebotomyServiceIds,
  });
  if (!shouldShowRetestingCta) return null;

  return <RetestingCtaCard source="homepage" />;
}

function HomepageComponent() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const shouldShowBiomarkersCard =
    !isUserLoading && user?.resultsGate?.hasFinalDiagnosticReport !== false;

  return (
    <ContentLayout
      title="Home"
      variant="homepage"
      className="max-w-[1600px] pt-6 md:space-y-6 lg:py-0"
    >
      <div className="lg:hidden">
        <Greeting />
      </div>

      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 items-start gap-6 lg:h-full lg:grid-cols-3 lg:gap-16 lg:px-12 lg:pt-6 xl:grid-cols-2">
        <DigitalTwinCardWithInsights />

        <div className="flex flex-col pb-20 lg:col-span-2 lg:pb-60 lg:pt-[3px] xl:col-span-1">
          <div className="flex flex-col gap-6">
            <HomepageSection>
              <HomepageRetestingCta />
            </HomepageSection>

            <HomepageSection>
              <ActionableOrdersCard />
            </HomepageSection>

            <HomepageSection>
              <LabOrderCard />
            </HomepageSection>

            <HomepageSection>
              <ScoreCards />
            </HomepageSection>

            {shouldShowBiomarkersCard ? (
              <HomepageLinkCard
                to="/data"
                title="Your biomarkers"
                headerRight={
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-secondary transition-colors group-hover:text-primary">
                    Explore more
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                }
              >
                <HomepageSection>
                  <BiomarkersDistributionBar />
                </HomepageSection>
              </HomepageLinkCard>
            ) : null}

            <HomepageSection>
              <ProtocolGoalsCard
                headerRight={<ExploreMoreLink to="/protocol" />}
              />
            </HomepageSection>

            <HomepageSection>
              <ActionItemsCard />
            </HomepageSection>

            <HomepageSection>
              <LiveBetterTogetherCard />
            </HomepageSection>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
