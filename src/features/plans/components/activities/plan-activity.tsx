import {
  CarePlanActivity,
  Coding,
  CarePlanActivityDetail,
} from '@medplum/fhirtypes';
import { HelpCircle, ExternalLink, Image } from 'lucide-react';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Body1, H4 } from '@/components/ui/typography';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { useProducts } from '@/features/plans/api';
import { SafeMarkdown } from '@/features/plans/components/plan-markdown';
import { useServices } from '@/features/services/api';
import { cn } from '@/lib/utils';
import { Product, HealthcareService } from '@/types/api';

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
  url?: string;
}

function ActivityCard({
  className,
  image,
  name,
  description,
  actionBtn,
  url,
}: ActivityCardProps) {
  const content = (
    <div
      className={cn(
        'flex min-h-[96px] w-full items-center justify-between rounded-[20px] bg-zinc-50 p-3 transition',
        url && 'hover:bg-zinc-100',
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

        <div className="flex min-w-0 flex-1 items-start justify-between">
          <div className="flex min-w-0 max-w-full flex-col gap-1 overflow-hidden pr-2">
            <Body1 className="overflow-hidden truncate">{name}</Body1>
            <Body1 className="overflow-hidden truncate">{description}</Body1>
          </div>
          {actionBtn && <div className="shrink-0">{actionBtn}</div>}
        </div>
      </div>
    </div>
  );

  if (url) {
    return (
      <a
        href={url}
        className="block cursor-pointer hover:no-underline"
        target="_blank"
        rel="noreferrer"
      >
        {content}
      </a>
    );
  }

  return content;
}

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
    return renderProductActivity(productCoding, detail, product, className);
  }

  if (service) {
    return renderServiceActivity(service, serviceCoding, detail, className);
  }

  return <SafeMarkdown content={detail?.description || ''} />;
}

function renderProductActivity(
  productCoding: Coding,
  detail?: CarePlanActivityDetail,
  product?: Product,
  className?: string,
) {
  const productName = productCoding.display || 'Unnamed Product';
  const productDesc = detail?.description || 'Recommended supplement';

  if (product) {
    return (
      <div className="mt-8 space-y-2">
        <H4>{productName}</H4>
        <Body1 className="text-zinc-500">{productDesc}</Body1>
        <ActivityCard
          {...product}
          name={productName}
          description={
            <div className="flex items-center gap-2 text-zinc-500">
              <Body1 className="italic text-zinc-500">Available in stock</Body1>
              <ExternalLink size={16} />
            </div>
          }
          className={className}
          url={product.url}
        />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-2">
      <H4>{productName}</H4>
      <Body1 className="text-zinc-500">{productDesc}</Body1>
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
}

function renderServiceActivity(
  service: HealthcareService,
  serviceCoding?: Coding,
  detail?: CarePlanActivityDetail,
  className?: string,
) {
  const serviceName =
    service.name || serviceCoding?.display || 'Unnamed Service';
  const serviceDesc =
    detail?.description || service.description || 'Book your appointment';

  return (
    <div className="mt-8 space-y-2">
      <H4>{serviceName}</H4>
      <Body1 className="text-zinc-500">{serviceDesc}</Body1>
      <ActivityCard
        {...service}
        name={serviceName}
        description={
          <div className="flex items-center gap-2 text-zinc-500">
            <Body1 className="italic text-zinc-500">
              Available for booking
            </Body1>
          </div>
        }
        className={className}
        actionBtn={
          <HealthcareServiceDialog healthcareService={service}>
            <Button size="medium">Book</Button>
          </HealthcareServiceDialog>
        }
      />
    </div>
  );
}
