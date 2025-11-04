import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Body2, H2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import type { Rx } from '@/types/api';
import { getPrescriptionInfo } from '@/utils/prescription';

type PrescriptionsFaqProps = {
  prescription: Rx;
  className?: string;
};

export const Faq = ({ prescription, className }: PrescriptionsFaqProps) => {
  const info = getPrescriptionInfo(prescription.name);
  const faq = info?.faq;

  if (!faq || faq.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        'md:grid md:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] md:gap-10',
        className,
      )}
    >
      <div>
        <H2 className="tracking-tight">Frequently asked questions</H2>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {faq.map(({ question, answer }) => (
          <AccordionItem
            key={question}
            value={question}
            className="border-b border-zinc-200 last:border-0"
          >
            <AccordionTrigger
              variant="plusMinus"
              className="py-5 text-xl tracking-[-0.2px] text-primary hover:text-zinc-500"
            >
              {question}
            </AccordionTrigger>
            <AccordionContent className="text-secondary">
              <Body2 className="whitespace-pre-line text-base leading-7 text-secondary">
                {answer}
              </Body2>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
