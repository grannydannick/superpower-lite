import { ArrowUpRight } from 'lucide-react';

import { Body1, Body2, H2 } from '@/components/ui/typography';
import { SHARED_CONTAINER_STYLE } from '@/features/orders/const/config';
import { usePurchaseStore } from '@/features/orders/stores/purchase-store';
import { ServiceFaqs } from '@/features/services/components/service-faqs';
import { cn } from '@/lib/utils';
import { getHealthcareServicePriceLabel } from '@/utils/format-money';
import {
  getSampleReportLinkForService,
  getServiceImage,
} from '@/utils/service';

import { PurchaseDialogFooter } from '../purchase-dialog-footer';

export const ServiceDetailsStep = () => {
  const { service } = usePurchaseStore((s) => s);
  const sampleReportLink = getSampleReportLinkForService(service.name);

  return (
    <div>
      <div
        className={cn(
          'flex flex-col justify-between gap-12 md:flex-row',
          SHARED_CONTAINER_STYLE,
        )}
      >
        <div className="flex flex-col justify-center gap-4 md:max-w-[278px]">
          <img
            src={getServiceImage(service.name)}
            className="block size-[70px] rounded-2xl border border-zinc-200 bg-white object-cover md:hidden"
            alt={service.name}
          />
          <div className="max-w-[220px] space-y-4 md:max-w-none">
            <H2 className="text-zinc-900">{service.name}</H2>

            <Body2 className="text-zinc-500">
              {getHealthcareServicePriceLabel(service)}
            </Body2>
          </div>
          <Body1 className="text-zinc-500">{service.description}</Body1>
          {service.supportsLabOrder && (
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
          className="hidden h-[362px] w-full rounded-2xl border border-zinc-200 bg-white object-cover md:block md:size-[362px]"
          alt={service.name}
        />
      </div>
      <div className="my-6 h-px w-full bg-zinc-200" />
      <div className={SHARED_CONTAINER_STYLE}>
        <ServiceFaqs
          filter={(faq) =>
            faq.question !== 'sampleReportLink' &&
            faq.question !== "What's tested?"
          }
          serviceName={service.name}
        />
      </div>
      <PurchaseDialogFooter />
    </div>
  );
};
