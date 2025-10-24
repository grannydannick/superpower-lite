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
import { GUT_MICROBIOME_ANALYSIS, TOTAL_TOXIN_TEST } from '@/const';
import { useOrders } from '@/features/orders/api';
import { useServices } from '@/features/services/api';
import { TimelineItem as TimelineItemType } from '@/types/api';
import { getServiceImage } from '@/utils/service';

import DeliveryTestDialog from './delivery-test-dialog';

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
  const navigate = useNavigate();
  const servicesQuery = useServices();
  const getOrdersQuery = useOrders();

  const service = servicesQuery.data?.services.find(
    (s) => s.name === timelineItem.name,
  );
  const order = getOrdersQuery.data?.orders.find(
    (o) => o.id === timelineItem.id,
  );

  if (!order) return null;

  const isDelivery =
    order.serviceName === GUT_MICROBIOME_ANALYSIS ||
    order.serviceName === TOTAL_TOXIN_TEST;

  const renderTimelineButton = () => {
    // If the order is a gut GUT_MICROBIOME_ANALYSIS test, show a button to view more details
    if (isDelivery && order.status === 'COMPLETED') {
      return (
        <DeliveryTestDialog>
          <Button className="bg-white" size="medium" variant="outline">
            More details
          </Button>
        </DeliveryTestDialog>
      );
    }

    switch (timelineItem.status) {
      case 'ACTION_REQUIRED': {
        // reason #1: we cannot render booking without full service info
        // reason #2:
        // If healthcare service was not found it likely means that
        // we depricated it and do not show anymore
        // this was done during 199 (superpower v2) migration
        // to normalize all data and this behaviour is expected
        // before changing this code please double check with
        //   Nikita or Dan <3
        if (!service) return;

        return (
          <Button
            className="bg-white"
            size="medium"
            variant="outline"
            onClick={() => navigate(`/services/${service.id}`)}
          >
            Book
          </Button>
        );
      }
      case 'CURRENT':
        return (
          <Button
            className="bg-white"
            size="medium"
            variant="outline"
            onClick={() => navigate(`./orders/${timelineItem.id}`)}
          >
            More details
          </Button>
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
          image={getServiceImage(order.serviceName)}
          title={timelineItem.name}
          description={timelineItem.description}
          info={order.location?.address?.line?.join(', ')}
          variant={timelineItem.status === 'DISABLED' ? 'disabled' : 'default'}
          button={renderTimelineButton()}
        />
      </TimelineHeader>
    </TimelineItem>
  );
};

export default React.memo(OrderTimelineItem);
