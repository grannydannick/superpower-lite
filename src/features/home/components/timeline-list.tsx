import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { ChevronUpIcon } from '@/components/icons/chevron-up-icon';
import {
  Timeline,
  TimelineLabel,
  TimelineEmptyCard,
  TimelineItem,
  TimelineHeader,
  TimelineDot,
} from '@/components/ui/timeline';
import { useTimeline } from '@/features/home/api/get-timeline';
import { getTimelineItems } from '@/features/home/utils/get-timeline-items';
import { useOrders } from '@/features/orders/api';
import { usePlans } from '@/features/plans/api/get-plans';
import { useServices } from '@/features/services/api';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';

import { Banner } from './banner/banner';
import { RecommendationsList } from './recommendations/recommendations-list';
import {
  ActionPlanTimelineItem,
  OrderTimelineItem,
  OnboardingTimelineItem,
} from './timeline-items';
import { TimelineListSkeleton } from './timeline-list-skeleton';

export const TimelineList = () => {
  /**
   * We initially call these queries here to "preload" them for UI
   */
  const timelineQuery = useTimeline();
  const servicesQuery = useServices();
  const ordersQuery = useOrders();
  const plansQuery = usePlans({});

  const timelineItems = timelineQuery.data;

  // State for accordion sections
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);
  const [isCurrentItemsOpen, setIsCurrentItemsOpen] = useState(true);
  const [isCompletedItemsOpen, setIsCompletedItemsOpen] = useState(true);

  // Check for mobile
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  /**
   * TODO: grouping of timeline items (and subfiltering of each group) should be done in backend
   */

  const { onboardingItems, currentItems, completedItems } = useMemo(() => {
    return {
      onboardingItems: getTimelineItems(timelineItems, 'onboarding'),
      currentItems: getTimelineItems(timelineItems, 'current'),
      completedItems: getTimelineItems(timelineItems, 'completed'),
    };
  }, [timelineItems]);

  if (
    servicesQuery.isLoading ||
    ordersQuery.isLoading ||
    timelineQuery.isLoading ||
    plansQuery.isLoading
  ) {
    return <TimelineListSkeleton />;
  }

  if (!timelineItems) {
    return null;
  }

  return (
    <div className="mt-10 w-full md:mt-auto">
      <RecommendationsList />
      <Banner />
      <Timeline className="w-full">
        {onboardingItems?.length ? (
          <div>
            <button
              disabled={isMobile}
              onClick={() => setIsOnboardingOpen(!isOnboardingOpen)}
              className="mb-2 flex w-full items-center justify-center gap-8 py-2 transition-opacity md:justify-between md:pr-8 md:hover:opacity-75"
            >
              <TimelineLabel>
                <span className="text-balance text-center md:text-left">
                  Finish onboarding to get the most out of Superpower
                </span>
              </TimelineLabel>
              <ChevronUpIcon
                className={cn(
                  'size-4 text-zinc-400 hidden md:block transition-transform duration-200 shrink-0',
                  !isOnboardingOpen && 'rotate-180',
                )}
              />
            </button>
            {isOnboardingOpen && (
              <div>
                {onboardingItems.map((t, i) => {
                  switch (t.type) {
                    case 'ONBOARDING_TASK':
                      return (
                        <div key={t.id}>
                          <OnboardingTimelineItem
                            key={t.id}
                            timelineItem={t}
                            shouldRenderConnector={
                              i !== onboardingItems.length - 1
                            }
                            shouldRenderNextConnector={false}
                          />
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            )}
          </div>
        ) : null}

        {currentItems && currentItems.length > 0 && (
          <div
            id="mobile-separator"
            className="mx-auto mt-4 h-8 w-px rounded-full bg-gradient-to-b from-transparent via-zinc-100 to-vermillion-900 transition-all duration-200 md:hidden"
          />
        )}

        {currentItems && currentItems.length ? (
          <div
            className={cn(
              'transition-all duration-200 mb-6',
              isCurrentItemsOpen && 'my-6',
              !isCurrentItemsOpen && 'my-0',
              isOnboardingOpen && 'mt-6',
              !isOnboardingOpen && 'mt-0',
            )}
          >
            <button
              disabled={isMobile}
              onClick={() => setIsCurrentItemsOpen(!isCurrentItemsOpen)}
              className="flex w-full items-center justify-center gap-8 transition-opacity md:justify-between md:pr-8 md:hover:opacity-75"
            >
              <TimelineLabel className="mb-2 py-2">
                <span className="text-balance text-center md:text-left">
                  Next steps
                </span>
              </TimelineLabel>
              <ChevronUpIcon
                className={cn(
                  'size-4 text-zinc-400 hidden md:block transition-transform duration-200 shrink-0',
                  !isCurrentItemsOpen && 'rotate-180',
                )}
              />
            </button>
            {isCurrentItemsOpen && (
              <div>
                {currentItems.map((t, i) => {
                  switch (t.type) {
                    case 'ORDER':
                      return (
                        <div key={t.id}>
                          <OrderTimelineItem
                            timelineItem={t}
                            key={t.id}
                            shouldRenderConnector={
                              i !== currentItems.length - 1
                            }
                            shouldRenderNextConnector={true}
                          />
                        </div>
                      );
                    case 'PLAN':
                      return (
                        <div key={t.id}>
                          <ActionPlanTimelineItem
                            key={t.id}
                            shouldRenderConnector={
                              i !== currentItems.length - 1
                            }
                            shouldRenderNextConnector={true}
                            timelineItem={t}
                          />
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
                <div>
                  <TimelineItem>
                    <TimelineHeader>
                      <TimelineDot className="hidden md:block" />
                      <TimelineEmptyCard />
                    </TimelineHeader>
                  </TimelineItem>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {completedItems && completedItems.length > 0 && (
          <div
            id="mobile-separator"
            className="mx-auto mb-6 h-8 w-px rounded-full bg-gradient-to-b from-transparent via-zinc-100 to-vermillion-900 transition-all duration-200 md:hidden"
          />
        )}

        {completedItems && completedItems.length ? (
          <div>
            <button
              disabled={isMobile}
              onClick={() => setIsCompletedItemsOpen(!isCompletedItemsOpen)}
              className="flex w-full items-center justify-center gap-8 transition-opacity md:justify-between md:pr-8 md:hover:opacity-75"
            >
              <TimelineLabel className="mb-2 py-2">
                <span className="text-balance text-center md:text-left">
                  Done
                </span>
              </TimelineLabel>
              <ChevronUpIcon
                className={cn(
                  'size-4 text-zinc-400 hidden md:block transition-transform duration-200 shrink-0',
                  !isCompletedItemsOpen && 'rotate-180',
                )}
              />
            </button>
            {isCompletedItemsOpen && (
              <div>
                {completedItems.map((t, i) => {
                  switch (t.type) {
                    case 'ORDER':
                      return (
                        <div key={t.id}>
                          <OrderTimelineItem
                            timelineItem={t}
                            key={t.id}
                            shouldRenderConnector={
                              i !== completedItems.length - 1
                            }
                            shouldRenderNextConnector={false}
                          />
                        </div>
                      );
                    case 'ONBOARDING_TASK':
                      return (
                        <motion.div key={t.id}>
                          <OnboardingTimelineItem
                            key={t.id}
                            timelineItem={t}
                            shouldRenderConnector={
                              i !== completedItems.length - 1
                            }
                            shouldRenderNextConnector={false}
                          />
                        </motion.div>
                      );
                    case 'PLAN':
                      return (
                        <motion.div key={t.id}>
                          <ActionPlanTimelineItem
                            key={t.id}
                            timelineItem={t}
                            shouldRenderConnector={
                              i !== completedItems.length - 1
                            }
                            shouldRenderNextConnector={false}
                          />
                        </motion.div>
                      );
                  }
                })}
              </div>
            )}
          </div>
        ) : null}
      </Timeline>
    </div>
  );
};
