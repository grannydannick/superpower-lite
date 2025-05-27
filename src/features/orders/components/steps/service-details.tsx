import { ArrowUpRight } from 'lucide-react';
import React from 'react';

import { Body1, Body2, H2 } from '@/components/ui/typography';
import { useOrders } from '@/features/orders/api';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { ServiceDetails } from '@/features/orders/components/service-details';
import { useOrder } from '@/features/orders/stores/order-store';
import { OrderStatus } from '@/types/api';
import { getHealthcareServicePriceLabel } from '@/utils/format-money';
import { getSampleReportLinkForService } from '@/utils/service';

export const HealthcareServiceDetails = () => {
  const { service } = useOrder((s) => s);
  const ordersQuery = useOrders();
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
          {(service.name === 'Superpower Blood Panel' ||
            service.name === 'Advanced Blood Panel') && (
            <a
              href="https://superpower.com/biomarkers"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 mt-0 flex cursor-pointer items-center space-x-1 text-sm text-primary"
            >
              <span>What&apos;s tested?</span>
              <ArrowUpRight className="size-4 text-vermillion-900" />
            </a>
          )}
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
      <ServiceDetails serviceName={service.name} />
      <HealthcareServiceFooter />
    </div>
  );
};
