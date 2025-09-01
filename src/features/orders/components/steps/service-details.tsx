import { ArrowUpRight } from 'lucide-react';

import { Body1, Body2, H2 } from '@/components/ui/typography';
import { ADVANCED_BLOOD_PANEL, SUPERPOWER_BLOOD_PANEL } from '@/const';
import { useOrders } from '@/features/orders/api';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { useOrder } from '@/features/orders/stores/order-store';
import { ServiceFaqs } from '@/features/services/components/service-faqs';
import { OrderStatus } from '@/types/api';
import { getHealthcareServicePriceLabel } from '@/utils/format-money';
import {
  getSampleReportLinkForService,
  getServiceImage,
} from '@/utils/service';

import { useScheduleGapWarning } from '../hooks/use-schedule-gap-warning';

import { ScheduleWarningBanner } from './schedule-warning-banner';

export const HealthcareServiceDetails = () => {
  const { service } = useOrder((s) => s);
  const ordersQuery = useOrders();
  const sampleReportLink = getSampleReportLinkForService(service.name);
  const shouldShowWarning = useScheduleGapWarning(service.name);

  const existingDraftOrder = ordersQuery.data?.orders
    .filter((o) => o.status === OrderStatus.draft)
    .find((o) => o.serviceId === service.id);

  return (
    <div>
      {shouldShowWarning && <ScheduleWarningBanner />}
      <div className="flex flex-col justify-between gap-12 p-6 md:flex-row md:px-14 md:pb-16">
        <div className="flex flex-col justify-center gap-4 md:max-w-[278px]">
          <img
            src={getServiceImage(service.name)}
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
          {(service.name === SUPERPOWER_BLOOD_PANEL ||
            service.name === ADVANCED_BLOOD_PANEL) && (
            <a
              href="https://superpower.com/biomarkers"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 mt-0 flex cursor-pointer items-center space-x-1 text-sm text-primary"
            >
              <span>What&apos;s tested?</span>
              <ArrowUpRight className="mb-0.5 size-4 text-vermillion-900" />
            </a>
          )}
          {sampleReportLink ? (
            <a
              href={sampleReportLink.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex cursor-pointer items-center space-x-1 text-sm text-primary"
            >
              <span>View sample report</span>
              <ArrowUpRight className="mb-0.5 size-4 text-vermillion-900" />
            </a>
          ) : null}
        </div>

        <img
          src={getServiceImage(service.name)}
          className="hidden h-[362px] w-full rounded-2xl border border-zinc-200  bg-white object-cover md:block md:size-[362px]"
          alt={service.name}
        />
      </div>
      <div className="mb-6 h-px w-full bg-zinc-200" />
      <div className="px-6 md:px-12">
        <ServiceFaqs
          filter={(faq) =>
            faq.question !== 'sampleReportLink' &&
            faq.question !== "What's tested?"
          }
          serviceName={service.name}
        />
      </div>
      <HealthcareServiceFooter />
    </div>
  );
};
