import {
  CarePlanActivity,
  CarePlanActivityDetail,
  Coding,
} from '@medplum/fhirtypes';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Body1, H4 } from '@/components/ui/typography';
import { ADVISORY_CALL } from '@/const';
import { useOrders } from '@/features/orders/api';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { useServices } from '@/features/services/api';
import { useProducts } from '@/features/shop/api';
import { HealthcareService, Product, OrderStatus } from '@/types/api';
import { getServiceImage } from '@/utils/service';

import { extractCitations } from '../../utils/extract-citations';
import { PlanMarkdown } from '../plan-markdown';

import { ActivityCard } from './activity-card';
import { ProductCard } from './product-card';

interface PlanActivityProps {
  activity: CarePlanActivity;
  className?: string;
}

export const ServiceActivity = ({
  service,
  serviceCoding,
  detail,
  className,
}: {
  service: HealthcareService;
  serviceCoding?: Coding;
  detail?: CarePlanActivityDetail;
  className?: string;
}) => {
  const { data: ordersData } = useOrders();

  const serviceName =
    service.name || serviceCoding?.display || 'Unnamed Service';
  const serviceDesc =
    detail?.description || service.description || 'Book your appointment';
  const citations = extractCitations(detail);
  const isAdvisory = serviceName === ADVISORY_CALL;

  const isServiceScheduled = useMemo(() => {
    if (!ordersData?.orders) return false;
    return ordersData.orders.some(
      (order) =>
        order.serviceId === service.id &&
        (order.status === OrderStatus.upcoming ||
          order.status === OrderStatus.pending ||
          order.status === OrderStatus.completed),
    );
  }, [ordersData?.orders, service.id]);

  const shouldShowEarlyAccess = useMemo(() => {
    return !service.active;
  }, [service.active]);

  const serviceMessage = useMemo(() => {
    if (isAdvisory) return 'Not currently available.';
    if (isServiceScheduled) return 'Service scheduled';
    if (shouldShowEarlyAccess) return 'Request Early Access';
    return 'Available for booking';
  }, [isAdvisory, isServiceScheduled, shouldShowEarlyAccess]);

  const actionButton = useMemo(() => {
    if (isAdvisory || isServiceScheduled) return null;
    return (
      <HealthcareServiceDialog healthcareService={service}>
        <Button size="medium">
          {shouldShowEarlyAccess ? 'Request' : 'Book'}
        </Button>
      </HealthcareServiceDialog>
    );
  }, [isAdvisory, isServiceScheduled, service, shouldShowEarlyAccess]);

  return (
    <div className="mt-8 space-y-2">
      <H4>{serviceName}</H4>
      <PlanMarkdown
        content={serviceDesc}
        citations={citations}
        boldVermillion
      />
      <ActivityCard
        {...service}
        image={getServiceImage(service.name)}
        name={serviceName}
        description={
          <div className="flex items-center gap-2 text-zinc-500">
            <Body1 className="italic text-zinc-500">{serviceMessage}</Body1>
          </div>
        }
        className={className}
        actionBtn={actionButton}
      />
    </div>
  );
};

const ProductActivity = ({
  productCoding,
  detail,
  product,
  className,
}: {
  productCoding: Coding;
  detail?: CarePlanActivityDetail;
  product?: Product;
  className?: string;
}) => {
  const productName = productCoding.display || 'Unnamed Product';
  const productDesc = detail?.description || 'Recommended supplement';
  const citations = extractCitations(detail);

  return (
    <div className="mt-8 space-y-2">
      <H4 className="text-lg">{productName}</H4>
      <PlanMarkdown
        content={productDesc}
        citations={citations}
        boldVermillion
      />
      <ProductCard
        productName={productName}
        product={product}
        className={className}
      />
    </div>
  );
};

export function PlanActivity({ activity, className }: PlanActivityProps) {
  const { detail } = activity;
  const { data: productsData } = useProducts({});
  const { data: servicesData } = useServices();

  const productCoding = detail?.productCodeableConcept?.coding?.[0];
  const serviceCoding = detail?.code?.coding?.[0];

  const product = productsData?.products?.find(
    (p) => p.id === productCoding?.code,
  );
  const service = servicesData?.services?.find(
    (s) => s.id === serviceCoding?.code,
  );

  if (productCoding) {
    return (
      <ProductActivity
        productCoding={productCoding}
        detail={detail}
        product={product}
        className={className}
      />
    );
  }

  if (service) {
    return (
      <ServiceActivity
        service={service}
        serviceCoding={serviceCoding}
        detail={detail}
        className={className}
      />
    );
  }

  const citations = extractCitations(detail);

  return (
    <PlanMarkdown
      content={detail?.description || ''}
      citations={citations}
      boldVermillion
    />
  );
}
