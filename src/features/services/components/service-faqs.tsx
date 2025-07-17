import { StyledMarkdown } from '@/components/shared/styled-markdown';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { H4 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { ServiceFaq } from '@/types/service';
import { getDetailsForService } from '@/utils/service';

export const ServiceFaqs = ({
  serviceName,
  filter,
  className,
}: {
  serviceName: string;
  filter?: (faq: ServiceFaq) => boolean;
  className?: string;
}) => {
  const serviceDetails = getDetailsForService(serviceName);

  const defaultValue = filter
    ? serviceDetails?.faqs?.find((faq) => filter(faq))?.question
    : serviceDetails?.faqs?.[0]?.question;

  return (
    <Accordion
      type="multiple"
      className={cn('w-full', className)}
      defaultValue={defaultValue ? [defaultValue] : undefined}
    >
      {serviceDetails?.faqs
        ? serviceDetails.faqs
            .filter(filter ?? (() => true))
            .map((faq, index) => {
              return (
                <AccordionItem
                  value={faq.question}
                  key={index}
                  className="border-b-0"
                >
                  <AccordionTrigger className="group text-zinc-900 transition-colors hover:text-zinc-500">
                    <H4 className="m-0 transition-colors group-hover:text-zinc-500">
                      {faq.question}
                    </H4>
                  </AccordionTrigger>
                  <AccordionContent>
                    <StyledMarkdown className="space-y-4 text-zinc-500">
                      {faq.answer}
                    </StyledMarkdown>
                  </AccordionContent>
                </AccordionItem>
              );
            })
        : null}
    </Accordion>
  );
};
