import { X } from 'lucide-react';
import React, { ReactNode } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { DialogClose, DialogContent } from '@/components/ui/dialog';
import { Body1, Body2, H2, H4 } from '@/components/ui/typography';
import { HealthcareService } from '@/types/api';
import { getHealthcareServicePriceLabel } from '@/utils/format-money';
import { getDetailsForService } from '@/utils/service';

import { TestDetails } from '../healthcare-service-info-dialog-content/types/service';

/**
 * This version of dialog should not trigger Order flow.
 *
 * If you wish to trigger order flow, please use:
 * @param {HealthcareServiceDialog}
 *
 * You can pass any other component into the button position with any action required.
 *
 * P.S. Make sure to wrap this into <Dialog /> with <DialogTrigger /> to call this.
 *
 * @param {ReactNode} [children] - Optional; pass the content, usually wrapped into <DialogClose /> or another component.
 * @param {HealthcareService} healthcareService - The healthcare service details.
 */
export const HealthcareServiceInfoDialogContent = ({
  children,
  healthcareService,
}: {
  children?: ReactNode;
  healthcareService: HealthcareService;
}) => {
  return (
    <DialogContent>
      <div className="max-h-[90vh] overflow-y-scroll rounded-xl">
        <div>
          <div className="flex flex-row items-center justify-between bg-[#F7F7F7] px-12 pb-6 pt-12">
            <Body1 className="text-zinc-500">Service</Body1>
            <DialogClose>
              <X className="size-6 cursor-pointer p-1" />
            </DialogClose>
          </div>
          <HealthcareServiceInfoDetails healthcareService={healthcareService}>
            {children}
          </HealthcareServiceInfoDetails>
        </div>
      </div>
    </DialogContent>
  );
};

/**
 * Primarily used with <HealthcareServiceDialogContent /> but can be called separately if no dialog is required.
 *
 * @param {HealthcareService} healthcareService - The healthcare service details.
 * @param {ReactNode} [children] - Optional; expected to be a button component or element that should perform some action
 */
export function HealthcareServiceInfoDetails({
  healthcareService,
  children,
}: {
  healthcareService: HealthcareService;
  children?: ReactNode;
}): JSX.Element {
  const serviceDetails = getDetailsForService(healthcareService.name);

  return (
    <div>
      <div className="flex flex-col justify-between gap-12 bg-[#F7F7F7] px-12 pb-16 sm:flex-row">
        <div className="flex max-w-[278px] flex-col justify-center gap-6">
          <div>
            <H2 className="text-zinc-900">{healthcareService.name}</H2>
            <Body2 className="text-zinc-500">
              {getHealthcareServicePriceLabel(healthcareService)}
            </Body2>
          </div>
          <Body1 className="text-zinc-500">
            {healthcareService.description}
          </Body1>
          {children && (
            <div className="flex flex-row items-center space-x-4">
              {children}
            </div>
          )}
        </div>

        <img
          src={healthcareService.image}
          className="size-[362px] h-auto rounded-2xl border border-zinc-200  bg-white object-cover"
          alt={healthcareService.name}
        />
      </div>
      <Accordion type="single" collapsible className="w-full border-t">
        {serviceDetails
          ? Object.keys(serviceDetails).map((serviceDetailTitle, index) => (
              <AccordionItem
                value={serviceDetailTitle}
                key={index}
                className="p-12"
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
    </div>
  );
}
