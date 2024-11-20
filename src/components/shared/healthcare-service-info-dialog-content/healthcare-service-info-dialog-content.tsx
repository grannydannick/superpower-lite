import { X } from 'lucide-react';
import React, { ReactNode } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Body1, Body2, H2, H4 } from '@/components/ui/typography';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
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
 * ### Example:
 *
 * ```jsx
 * <HealthcareServiceInfoDialog
 *   openBtn={<Button>View Details</Button>}
 *   closeBtn={<Button>Dismiss</Button>}
 *   healthcareService={serviceData}
 * />
 * ```
 *
 * @component
 *
 * @param {ReactNode} openBtn - Element that triggers the opening of the dialog.
 * @param {ReactNode} closeBtn - Element that triggers the closing of the dialog.
 * @param {HealthcareService} healthcareService - Details of the healthcare service to display.
 */
export const HealthcareServiceInfoDialog = ({
  openBtn,
  closeBtn,
  healthcareService,
}: {
  openBtn: ReactNode;
  closeBtn: ReactNode;
  healthcareService: HealthcareService;
}) => {
  const { width } = useWindowDimensions();

  if (width <= 768) {
    return (
      <Sheet>
        <SheetTrigger asChild>{openBtn}</SheetTrigger>
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px]">
          <div className="flex items-center justify-between px-4 pt-16 md:pb-4">
            <SheetClose>
              <div className="flex h-[44px] min-w-[44px] items-center justify-center rounded-full bg-zinc-100">
                <X className="h-4 min-w-4" />
              </div>
            </SheetClose>
            <Body2>Book a service</Body2>
            <div className="min-w-[44px]" />
          </div>
          <div className="overflow-auto">
            <HealthcareServiceInfoDetails healthcareService={healthcareService}>
              {closeBtn}
            </HealthcareServiceInfoDetails>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{openBtn}</DialogTrigger>
      <DialogContent>
        <div className="max-h-[90vh] overflow-y-scroll rounded-xl">
          <div>
            <div className="flex flex-row items-center justify-between px-14 pb-6 pt-12">
              <Body1 className="text-zinc-500">Service</Body1>
              <DialogClose>
                <X className="size-6 cursor-pointer p-1" />
              </DialogClose>
            </div>
            <HealthcareServiceInfoDetails healthcareService={healthcareService}>
              {closeBtn}
            </HealthcareServiceInfoDetails>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
      <div className="flex flex-col justify-between gap-12 px-6 py-12 md:flex-row md:px-14 md:pb-16">
        <div className="flex max-w-[278px] flex-col justify-center gap-4">
          <img
            src={healthcareService.image}
            className="block size-[70px] rounded-2xl border border-zinc-200 bg-white  object-cover md:hidden"
            alt={healthcareService.name}
          />
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
            <DialogClose
              className="flex flex-row items-center space-x-4"
              asChild
            >
              {children}
            </DialogClose>
          )}
        </div>

        <img
          src={healthcareService.image}
          className="hidden h-[362px] w-full rounded-2xl border border-zinc-200  bg-white object-cover md:block md:size-[362px]"
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
