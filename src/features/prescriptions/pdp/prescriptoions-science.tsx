import { NavLink } from 'react-router-dom';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Body2, H2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import type { Rx } from '@/types/api';
import { getPrescriptionInfo } from '@/utils/prescription';

type PrescriptoionsScienceProps = {
  prescription: Rx;
  className?: string;
};

export const Science = ({
  prescription,
  className,
}: PrescriptoionsScienceProps) => {
  const info = getPrescriptionInfo(prescription.name);
  const science = info?.science;

  if (!science) {
    return null;
  }

  const sections = [
    {
      key: 'activeIngredients',
      title: 'Active ingredients',
      description: science.activeIngredients,
    },
    {
      key: 'mechanism',
      title: 'Mechanism',
      description: science.mechanism,
    },
    {
      key: 'history',
      title: 'History',
      description: science.history,
    },
  ].filter((section) => Boolean(section.description?.trim()));

  if (!sections.length) {
    return null;
  }

  return (
    <section
      className={cn(
        'my-12 lg:my-16 grid gap-7 lg:gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]',
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:gap-6">
        <H2 className="tracking-tight">The science of {prescription.name}</H2>
        <Accordion
          type="single"
          collapsible
          defaultValue={sections[0]?.key}
          className="border-none"
        >
          {sections.map((section) => (
            <AccordionItem key={section.key} value={section.key}>
              <AccordionTrigger
                variant="plusMinus"
                className="text-xl tracking-[-0.2px] text-primary hover:text-zinc-500"
              >
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="text-secondary">
                <Body2 className="whitespace-pre-line text-base leading-7 text-secondary">
                  {section.description}
                </Body2>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {prescription.url ? (
          <NavLink to={prescription.url} className="inline-block w-fit">
            <Button type="button" size="medium" className="w-fit">
              Get started
            </Button>
          </NavLink>
        ) : (
          <Button type="button" size="medium" className="w-fit" disabled>
            Get started
          </Button>
        )}
      </div>
      <div className="order-first flex items-center justify-center lg:order-last">
        <img
          src="/rx/rx-science.webp"
          alt="Superpower science illustration"
          className="w-full object-cover"
        />
      </div>
    </section>
  );
};
