import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Timeline,
  TimelineLabel,
  TimelineSpacer,
  TimelineEmptyCard,
  TimelineItem,
  TimelineHeader,
  TimelineDot,
  TimelineConnector,
} from '@/components/ui/timeline';
import { useTimeline } from '@/features/home/api/get-timeline';
import { useOrders } from '@/features/orders/api';
import { useServices } from '@/features/services/api';

import {
  ActionPlanTimelineItem,
  OrderTimelineItem,
  OnboardingTimelineItem,
} from './timeline-items';

export const TimelineList = () => {
  /**
   * We initially call these queries here to "preload" them for UI
   */
  const timelineQuery = useTimeline();
  const servicesQuery = useServices();
  const ordersQuery = useOrders();

  const timelineItems = timelineQuery.data;

  if (
    servicesQuery.isLoading ||
    ordersQuery.isLoading ||
    timelineQuery.isLoading
  ) {
    return (
      <div className="w-full space-y-3">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Skeleton className="h-[90px] w-full rounded-3xl" key={i} />
          ))}
      </div>
    );
  }

  if (!timelineItems) {
    return null;
  }

  const onboardingItems = timelineItems.filter(
    (ti) => ti.type === 'ONBOARDING_TASK' && ti.status !== 'DONE',
  );

  const currentItems = timelineItems.filter(
    (ti) =>
      ti.type !== 'ONBOARDING_TASK' &&
      ti.status !== 'DONE' &&
      ti.status !== 'DISABLED',
  );

  const completedItems = timelineItems.filter(
    (ti) => ti.status === 'DONE' || ti.status === 'DISABLED',
  );

  return (
    <Timeline className="w-full">
      {onboardingItems.length ? (
        <TimelineLabel className="mb-5">
          Finish onboarding to get the most out of Superpower
        </TimelineLabel>
      ) : null}
      {onboardingItems.map((t, i) => {
        switch (t.type) {
          case 'ONBOARDING_TASK':
            return (
              <OnboardingTimelineItem
                key={t.id}
                timelineItem={t}
                shouldRenderConnector={i !== onboardingItems.length - 1}
                shouldRenderNextConnector={
                  !!currentItems.length || !!completedItems.length
                }
              />
            );
          default:
            return null;
        }
      })}
      {currentItems.length ? (
        <TimelineSpacer
          className="mb-2 pb-0"
          shouldRenderConnector={!!onboardingItems.length}
        >
          <TimelineLabel>Next steps</TimelineLabel>
        </TimelineSpacer>
      ) : null}
      {currentItems.map((t, i) => {
        switch (t.type) {
          case 'ORDER':
            return (
              <OrderTimelineItem
                timelineItem={t}
                key={t.id}
                shouldRenderConnector={i !== currentItems.length - 1}
                shouldRenderNextConnector={true}
              />
            );
          case 'PLAN':
            return (
              <ActionPlanTimelineItem
                key={t.id}
                shouldRenderConnector={i !== currentItems.length - 1}
                shouldRenderNextConnector={true}
                timelineItem={t}
              />
            );
          default:
            return null;
        }
      })}
      <TimelineItem>
        {completedItems.length ? <TimelineConnector /> : null}
        <TimelineHeader>
          <TimelineDot />
          <TimelineEmptyCard />
        </TimelineHeader>
      </TimelineItem>
      {completedItems.length ? (
        <TimelineSpacer className="mb-2 pb-0">
          <TimelineLabel>Done</TimelineLabel>
        </TimelineSpacer>
      ) : null}
      {completedItems.map((t, i) => {
        switch (t.type) {
          case 'ORDER':
            return (
              <OrderTimelineItem
                timelineItem={t}
                key={t.id}
                shouldRenderConnector={i !== completedItems.length - 1}
                shouldRenderNextConnector={false}
              />
            );
          case 'ONBOARDING_TASK':
            return (
              <OnboardingTimelineItem
                key={t.id}
                timelineItem={t}
                shouldRenderConnector={i !== completedItems.length - 1}
                shouldRenderNextConnector={false}
              />
            );
          case 'PLAN':
            return (
              <ActionPlanTimelineItem
                key={t.id}
                timelineItem={t}
                shouldRenderConnector={i !== completedItems.length - 1}
                shouldRenderNextConnector={false}
              />
            );
        }
      })}
    </Timeline>
  );
};
