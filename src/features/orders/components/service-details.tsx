import React from 'react';

import { TestDetails } from '@/components/shared/healthcare-service-info-dialog-content/types/service';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Body2, H4 } from '@/components/ui/typography';
import { Markdown } from '@/features/messages/components/ai/markdown';
import { cn } from '@/lib/utils';
import { getDetailsForService } from '@/utils/service';

export const ServiceDetails = ({ serviceName }: { serviceName: string }) => {
  const serviceDetails = getDetailsForService(serviceName);

  return (
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
        ? Object.keys(serviceDetails)
            .filter(
              (serviceDetailTitle) =>
                serviceDetailTitle !== 'sampleReportLink' &&
                serviceDetailTitle !== "What's tested?",
            )
            .map((serviceDetailTitle, index) => {
              return (
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
                      <Markdown>
                        {String(
                          serviceDetails[
                            serviceDetailTitle as keyof TestDetails
                          ],
                        )}
                      </Markdown>
                    </Body2>
                  </AccordionContent>
                </AccordionItem>
              );
            })
        : null}
    </Accordion>
  );
};
