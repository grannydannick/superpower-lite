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
import { useOrders } from '@/features/orders/api';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { HealthcareServiceRescheduleDialog } from '@/features/orders/components/reschedule';
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
const OrderTimelineItem = ({
  shouldRenderConnector,
  shouldRenderNextConnector,
  timelineItem,
}: {
  shouldRenderConnector: boolean;
  shouldRenderNextConnector: boolean;
  timelineItem: TimelineItemType;
}) => {
  const servicesQuery = useServices();
  const getOrdersQuery = useOrders();

  const service = servicesQuery.data?.services.find(
    (s) => s.name === timelineItem.name,
  );
  const order = getOrdersQuery.data?.orders.find(
    (o) => o.id === timelineItem.id,
  );

  if (!service || !order) return null;

  const renderTimelineButton = () => {
    switch (timelineItem.status) {
      case 'ACTION_REQUIRED':
        return (
          <HealthcareServiceDialog healthcareService={service}>
            <Button className="bg-white" size="medium" variant="outline">
              Book
            </Button>
          </HealthcareServiceDialog>
        );
      case 'CURRENT':
        return (
          <HealthcareServiceRescheduleDialog
            healthcareService={service}
            order={order}
          >
            <Button className="bg-white" size="medium" variant="outline">
              More Details
            </Button>
          </HealthcareServiceRescheduleDialog>
        );
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
          className="hidden md:block"
          status={timelineItem.status.toLowerCase() as TimelineDotVariant}
        />
        <TimelineCard
          image={service.image ?? '/settings/membership/card-2024.png'}
          title={timelineItem.name}
          description={timelineItem.description}
          variant={timelineItem.status === 'DISABLED' ? 'disabled' : 'default'}
          button={renderTimelineButton()}
        />
      </TimelineHeader>
    </TimelineItem>
  );
};

export default React.memo(OrderTimelineItem);
