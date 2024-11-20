import React from 'react';

import { Button } from '@/components/ui/button';
import {
  TimelineCard,
  TimelineConnector,
  TimelineDot,
  TimelineDotVariant,
  TimelineHeader,
  TimelineItem,
} from '@/components/ui/timeline';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { useServices } from '@/features/services/api';
import { TimelineItem as TimelineItemType } from '@/types/api';

/**
 * Wrapping component for TimelineItem to have specific to group logic
 *
 * @param shouldRenderConnector - connects all items in the current block of timeline items
 * @param shouldRenderNextConnector - connects current block with the next block (e.g. onboardingItems with currentItems)
 * @param timelineItem - actual timeline item
 *
 */
export const OrderTimelineItem = ({
  shouldRenderConnector,
  shouldRenderNextConnector,
  timelineItem,
}: {
  shouldRenderConnector: boolean;
  shouldRenderNextConnector: boolean;
  timelineItem: TimelineItemType;
}) => {
  const servicesQuery = useServices();

  const service = servicesQuery.data?.services.find(
    (s) => s.name === timelineItem.name,
  );

  if (!service) return null;

  return (
    <TimelineItem>
      {shouldRenderConnector ? <TimelineConnector /> : null}
      {shouldRenderNextConnector ? <TimelineConnector /> : null}
      <TimelineHeader>
        <TimelineDot
          status={timelineItem.status.toLowerCase() as TimelineDotVariant}
        />
        <TimelineCard
          image={service.image ?? '/settings/membership/card-2024.png'}
          title={timelineItem.name}
          description={timelineItem.description}
          variant={timelineItem.status === 'DISABLED' ? 'disabled' : 'default'}
          button={
            timelineItem.status === 'ACTION_REQUIRED' ? (
              <HealthcareServiceDialog healthcareService={service}>
                <Button className="bg-white" size="medium" variant="outline">
                  Book
                </Button>
              </HealthcareServiceDialog>
            ) : null
          }
        />
      </TimelineHeader>
    </TimelineItem>
  );
};
