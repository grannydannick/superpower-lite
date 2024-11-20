import React from 'react';

import {
  TimelineCard,
  TimelineConnector,
  TimelineDot,
  TimelineDotVariant,
  TimelineHeader,
  TimelineItem,
} from '@/components/ui/timeline';
import { getOnboardingTimelineItem } from '@/features/home/utils/get-onboarding-timeline-item';
import { TimelineItem as TimelineItemType } from '@/types/api';

/**
 * Wrapping component for TimelineItem to have specific to group logic
 *
 * @param shouldRenderConnector - connects all items in the current block of timeline items
 * @param shouldRenderNextConnector - connects current block with the next block (e.g. onboardingItems with currentItems)
 * @param timelineItem - actual timeline item
 *
 */
export const OnboardingTimelineItem = ({
  shouldRenderConnector,
  shouldRenderNextConnector,
  timelineItem,
}: {
  shouldRenderConnector: boolean;
  shouldRenderNextConnector: boolean;
  timelineItem: TimelineItemType;
}) => {
  const data = getOnboardingTimelineItem(timelineItem);

  if (!data) return;

  const renderButton = () => {
    switch (timelineItem.status) {
      case 'ACTION_REQUIRED':
      case 'DEFAULT':
        return data.button;
      default:
        return null;
    }
  };

  return (
    <TimelineItem>
      {shouldRenderConnector ? <TimelineConnector /> : null}
      {shouldRenderNextConnector ? <TimelineConnector /> : null}
      <TimelineHeader>
        <TimelineDot
          status={timelineItem.status.toLowerCase() as TimelineDotVariant}
        />
        <TimelineCard
          image={data.image}
          title={timelineItem.name}
          description={timelineItem.description}
          variant={timelineItem.status === 'DISABLED' ? 'disabled' : 'default'}
          button={renderButton()}
        />
      </TimelineHeader>
    </TimelineItem>
  );
};
