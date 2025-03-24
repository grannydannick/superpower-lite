import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  TimelineCard,
  TimelineConnector,
  TimelineDot,
  TimelineDotVariant,
  TimelineHeader,
  TimelineItem,
} from '@/components/ui/timeline';
import { TimelineItem as TimelineItemType } from '@/types/api';

/**
 * Wrapping component for TimelineItem to have specific to group logic
 *
 * @param shouldRenderConnector - connects all items in the current block of timeline items
 * @param shouldRenderNextConnector - connects current block with the next block (e.g. onboardingItems with currentItems)
 * @param timelineItem - actual timeline item
 *
 */
export const ActionPlanTimelineItem = ({
  shouldRenderConnector,
  shouldRenderNextConnector,
  timelineItem,
}: {
  shouldRenderConnector: boolean;
  shouldRenderNextConnector: boolean;
  timelineItem: TimelineItemType;
}) => {
  const navigate = useNavigate();

  const renderButton = () => {
    switch (timelineItem.status) {
      case 'DISABLED':
        return (
          <Button disabled className="bg-white" size="medium" variant="outline">
            More details
          </Button>
        );
      case 'DONE':
        return (
          <Button
            className="bg-white"
            size="medium"
            variant="outline"
            onClick={() => navigate(`./plans/${timelineItem.id}`)}
          >
            Open
          </Button>
        );
      default:
        return null;
    }
  };

  const renderVariant = () => {
    switch (timelineItem.status) {
      case 'DISABLED':
        return 'disabled';
      default:
        return 'default';
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
          image="/timeline/plan.png"
          title={timelineItem.name}
          description={timelineItem.description}
          variant={renderVariant()}
          button={renderButton()}
        />
      </TimelineHeader>
    </TimelineItem>
  );
};
