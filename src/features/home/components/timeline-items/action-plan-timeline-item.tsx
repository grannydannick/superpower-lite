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
import { usePlans } from '@/features/action-plan/api';
import { useCurrentPatient } from '@/features/rdns/hooks/use-current-patient';
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
  const plansQuery = usePlans();
  const { hasAllowedRole } = useCurrentPatient();
  const navigate = useNavigate();

  const plan = plansQuery.data?.actionPlans.find(
    (ap) => ap.id === timelineItem.id,
  );

  if (!plan) return null;

  const renderButton = () => {
    if (hasAllowedRole) {
      return (
        <Button
          size="medium"
          onClick={() => navigate(`./plans/${plan.orderId}`)}
        >
          Edit your note
        </Button>
      );
    }

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
            onClick={() => navigate(`./plans/${plan.orderId}`)}
          >
            Open
          </Button>
        );
      default:
        return null;
    }
  };

  const renderVariant = () => {
    if (hasAllowedRole) {
      return 'default';
    }

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
