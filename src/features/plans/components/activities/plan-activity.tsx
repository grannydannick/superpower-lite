import { CarePlanActivity } from '@medplum/fhirtypes';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Body1, H2 } from '@/components/ui/typography';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { useProducts } from '@/features/plans/api';
import { SafeMarkdown } from '@/features/plans/components/plan-markdown';
import { useServices } from '@/features/services/api';
import { cn } from '@/lib/utils';

interface PlanActivityProps {
  activity: CarePlanActivity;
  className?: string;
}

interface ActivityCardProps {
  className?: string;
  image?: string;
  name: string;
  description?: string;
  actionBtn?: ReactNode;
  url?: string;
  isProduct?: boolean;
}

function ActivityCard({
  className,
  image,
  name,
  description,
  actionBtn,
  url,
  isProduct = false,
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
            <H2 className="text-zinc-500">?</H2>
          </div>
        )}

        <div className="flex flex-1 items-start justify-between">
          <div className="flex flex-col gap-1">
            <Body1 className="line-clamp-1">{name}</Body1>
            <Body1
              className={cn(
                'text-base italic line-clamp-1 pr-4',
                description ? 'text-zinc-600' : 'text-zinc-400',
              )}
            >
              {description ||
                (isProduct
                  ? 'Recommended supplement'
                  : 'Book your appointment')}
            </Body1>
          </div>
          {actionBtn}
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
    // only show shopify product if it exists
    if (product) {
      return (
        <ActivityCard
          {...product}
          description={detail?.description}
          className={className}
          url={product.url}
          isProduct={true}
        />
      );
    }
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="group relative cursor-help">
              <ActivityCard
                name={productCoding.display || 'Unavailable Product'}
                description={detail?.description}
                className={cn('opacity-70', className)}
                isProduct={true}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Product not currently available.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (service) {
    return (
      <ActivityCard
        {...service}
        description={detail?.description}
        className={className}
        actionBtn={
          <HealthcareServiceDialog healthcareService={service}>
            <Button size="medium">Book</Button>
          </HealthcareServiceDialog>
        }
        isProduct={false}
      />
    );
  }

  return <SafeMarkdown content={detail?.description || ''} />;
}
