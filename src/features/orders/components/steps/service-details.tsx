import { ArrowUpRight } from 'lucide-react';
import React from 'react';

import { TestDetails } from '@/components/shared/healthcare-service-info-dialog-content/types/service';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Body1, Body2, H2, H4 } from '@/components/ui/typography';
import { useOrders } from '@/features/orders/api';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { useOrder } from '@/features/orders/stores/order-store';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types/api';
import { getHealthcareServicePriceLabel } from '@/utils/format-money';
import {
  getDetailsForService,
  getSampleReportLinkForService,
} from '@/utils/service';

export const HealthcareServiceDetails = () => {
  const { service } = useOrder((s) => s);
  const ordersQuery = useOrders();
  const serviceDetails = getDetailsForService(service.name);
  const sampleReportLink = getSampleReportLinkForService(service.name);

  const existingDraftOrder = ordersQuery.data?.orders
    .filter((o) => o.status === OrderStatus.draft)
    .find((o) => o.serviceId === service.id);

  return (
    <div>
      <div className="flex flex-col justify-between gap-12 px-6 py-12 md:flex-row md:px-14 md:pb-16">
        <div className="flex flex-col justify-center gap-4 md:max-w-[278px]">
          <img
            src={service.image}
            className="block size-[70px] rounded-2xl border border-zinc-200 bg-white  object-cover md:hidden"
            alt={service.name}
          />
          <div className="max-w-[220px] space-y-4 md:max-w-none">
            <H2 className="text-zinc-900">{service.name}</H2>
            <Body2 className="text-zinc-500">
              {existingDraftOrder
                ? 'Included'
                : getHealthcareServicePriceLabel(service)}
            </Body2>
          </div>
          <Body1 className="text-zinc-500">{service.description}</Body1>
          {sampleReportLink ? (
            <a
              href={sampleReportLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex cursor-pointer items-center space-x-1 text-sm text-primary"
            >
              <span>View sample report</span>
              <ArrowUpRight className="size-4 text-vermillion-900" />
            </a>
          ) : null}
        </div>

        <img
          src={service.image}
          className="hidden h-[362px] w-full rounded-2xl border border-zinc-200  bg-white object-cover md:block md:size-[362px]"
          alt={service.name}
        />
      </div>
      <Accordion
        type="single"
        collapsible
        className={cn(
          'w-full',
          serviceDetails && Object.keys(serviceDetails).length > 0
            ? 'border-t'
            : null,
        )}
      >
        {serviceDetails
          ? Object.keys(serviceDetails).map((serviceDetailTitle, index) => (
              <AccordionItem
                value={serviceDetailTitle}
                key={index}
                className="p-8 md:p-14"
              >
                <AccordionTrigger className="p-0">
                  <H4 className="text-zinc-900">{serviceDetailTitle}</H4>
                </AccordionTrigger>
                <AccordionContent className="pb-0 pt-4">
                  <Body2 className="whitespace-break-spaces text-zinc-500">
                    {serviceDetails[serviceDetailTitle as keyof TestDetails]}
                  </Body2>
                </AccordionContent>
              </AccordionItem>
            ))
          : null}
      </Accordion>

      <HealthcareServiceFooter />
    </div>
  );
};
