import {
  CarePlanActivity,
  CarePlanActivityDetail,
  Coding,
} from '@medplum/fhirtypes';
import { HelpCircle, Image } from 'lucide-react';
import { ReactNode, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Body1, H4 } from '@/components/ui/typography';
import { ADVISORY_CALL } from '@/const';
import { useOrders } from '@/features/orders/api';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { SafeMarkdown } from '@/features/plans/components/plan-markdown';
import { useCarePlanCart } from '@/features/plans/stores/care-plan-cart-store';
import { useServices } from '@/features/services/api';
import { useProducts } from '@/features/shop/api';
import { cn } from '@/lib/utils';
import { HealthcareService, Product, OrderStatus } from '@/types/api';

interface PlanActivityProps {
  activity: CarePlanActivity;
  className?: string;
}

interface ActivityCardProps {
  className?: string;
  image?: string;
  name: string;
  description?: string | ReactNode;
  actionBtn?: ReactNode;
}

export function ActivityCard({
  className,
  image,
  name,
  description,
  actionBtn,
}: ActivityCardProps) {
  const content = (
    <div
      className={cn(
        'flex min-h-[96px] w-full items-center justify-between rounded-[20px] bg-zinc-50 p-3 transition',
        className,
      )}
    >
      <div className="flex w-full items-center space-x-6">
        {image ? (
          <img
            src={image}
            alt={name}
            className="size-[72px] rounded-[8px] bg-white object-cover object-center p-4"
          />
        ) : (
          <div className="flex size-[72px] items-center justify-center rounded-[8px] bg-white p-4">
            <Image size={48} className="text-zinc-500" />
          </div>
        )}

        <div className="flex min-w-0 flex-1 items-center justify-between">
          <div className="flex min-w-0 max-w-full flex-col gap-1 overflow-hidden pr-2">
            <Body1 className="break-words">{name}</Body1>
            <div className="break-words">{description}</div>
          </div>
          {actionBtn && <div className="shrink-0">{actionBtn}</div>}
        </div>
      </div>
    </div>
  );

  return content;
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

  const serviceMessage = useMemo(() => {
    if (isAdvisory) return 'Not currently available.';
    if (isServiceScheduled) return 'Service scheduled';
    return 'Available for booking';
  }, [isAdvisory, isServiceScheduled]);

  const actionButton = useMemo(() => {
    if (isAdvisory || isServiceScheduled) return null;
    return (
      <HealthcareServiceDialog healthcareService={service}>
        <Button size="medium">Book</Button>
      </HealthcareServiceDialog>
    );
  }, [isAdvisory, isServiceScheduled, service]);

  return (
    <div className="mt-8 space-y-2">
      <H4>{serviceName}</H4>
      <SafeMarkdown content={serviceDesc} />
      <ActivityCard
        {...service}
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
  const [, setSearchParams] = useSearchParams();
  const { addProduct, removeProduct, isProductSelected } = useCarePlanCart();
  const productName = productCoding.display || 'Unnamed Product';
  const productDesc = detail?.description || 'Recommended supplement';

  const handleAddToCart = () => {
    if (product) {
      addProduct(product);
    }
    setSearchParams((params) => {
      params.set('modal', 'checkout');
      return params;
    });
  };

  const handleRemoveFromCart = () => {
    if (product) {
      removeProduct(product.id);
    }
  };

  if (product) {
    return (
      <div className="mt-8 space-y-2">
        <H4>{productName}</H4>
        <SafeMarkdown content={productDesc} />
        <ActivityCard
          {...product}
          name={productName}
          description={
            <div className="flex items-center gap-2 text-zinc-500">
              <Body1 className="italic text-zinc-500">Available in stock</Body1>
            </div>
          }
          className={className}
          actionBtn={
            <Button
              size="medium"
              onClick={
                isProductSelected(product.id)
                  ? handleRemoveFromCart
                  : handleAddToCart
              }
              variant={isProductSelected(product.id) ? 'outline' : 'default'}
            >
              {isProductSelected(product.id)
                ? 'Remove from Cart'
                : 'Add to Cart'}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-2">
      <H4>{productName}</H4>
      <SafeMarkdown content={productDesc} />
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="group relative cursor-pointer">
              <ActivityCard
                name={productName}
                description={
                  <div className="flex w-full items-center gap-2 text-zinc-500">
                    <Body1 className="italic text-zinc-500">
                      Product not available
                    </Body1>
                    <HelpCircle size={16} />
                  </div>
                }
                className={cn('opacity-70', className)}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Product not available in store. You can order it online or contact
              your clinician for assistance.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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

  return <SafeMarkdown content={detail?.description || ''} />;
}
