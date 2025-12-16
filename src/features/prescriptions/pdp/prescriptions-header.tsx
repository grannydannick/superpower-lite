import { Check } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { HomeTreatment } from '@/components/icons/marketplace/prescriptions/home-treatment';
import { Lab } from '@/components/icons/marketplace/prescriptions/lab-tested';
import { Shipping } from '@/components/icons/marketplace/prescriptions/shipping';
import { LabTest } from '@/components/icons/rx-pdp/additional-lab-test';
import { MedicalEvaluation } from '@/components/icons/rx-pdp/medical-evaluation';
import { Plan } from '@/components/icons/rx-pdp/plan';
import { Support } from '@/components/icons/rx-pdp/support';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ProgressiveImage } from '@/components/ui/progressive-image';
import { Body1, Body2, Body3, H3, H4 } from '@/components/ui/typography';
import { GHK_CU_CREAM, HCG, TRETINOIN } from '@/const';
import { cn } from '@/lib/utils';
import type { Rx } from '@/types/api';
import {
  getPrescriptionImage,
  getPrescriptionInfo,
} from '@/utils/prescription';

import { COMPOUNDED_PRODUCTS_DISCLAIMER } from '../const';

const treatmentHighlights = [
  {
    title: 'Medical evaluation',
    description: 'To achieve the best results',
    Icon: MedicalEvaluation,
  },
  {
    title: 'Additional lab tests',
    description: 'Verify your results',
    Icon: LabTest,
  },
  {
    title: 'Personalized plan',
    description: '100% adapted to your body',
    Icon: Plan,
  },
  {
    title: 'Ongoing support',
    description: 'Always there for you',
    Icon: Support,
  },
];

type HeaderProps = {
  className?: string;
  prescription: Rx;
};

export const Header = ({ className, prescription }: HeaderProps) => {
  const info = getPrescriptionInfo(prescription.name);

  if (!info) {
    return null;
  }

  const { benefits, headerFaq, includes } = info;

  return (
    <section id="prescription-header">
      <PrescriptionBreadcrumb
        prescriptionName={prescription.name}
        className="mb-4"
      />
      <div
        className={cn(
          'grid gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.65fr)] lg:items-start',
          className,
        )}
      >
        <div className="lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-[20px]">
            <div className="flex aspect-square items-center justify-center bg-zinc-50 p-6 sm:p-12 lg:p-16">
              <ProgressiveImage
                src={getPrescriptionImage(prescription.name)}
                alt={prescription.name}
                className="aspect-square size-full max-h-[700px] bg-zinc-50 object-contain"
              />
            </div>
          </div>
          {prescription.name !== HCG && (
            <Body3 className="mt-4 text-tertiary">
              {COMPOUNDED_PRODUCTS_DISCLAIMER}
            </Body3>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <Badge variant="vermillion" className="w-fit py-1">
              {prescription.additionalClassification?.[0]}
            </Badge>

            <H3>{prescription.name}</H3>

            <div className="flex flex-wrap gap-4 [&>_*]:flex [&>_*]:items-center [&>_*]:gap-1.5 [&_*]:text-secondary">
              <div>
                <Shipping />
                <Body2>Free shipping</Body2>
              </div>
              <div>
                <HomeTreatment />
                <Body2>At-home treatment</Body2>
              </div>
              {prescription.name !== TRETINOIN &&
                prescription.name !== GHK_CU_CREAM && (
                  <div>
                    <Lab />
                    <Body2>Labs included in price</Body2>
                  </div>
                )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Body1 className="whitespace-pre-line">
              {prescription.description}
            </Body1>

            <ul className="space-y-2">
              {benefits.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="size-4 text-vermillion-900" />
                  <Body2 className="flex-1">{item}</Body2>
                </li>
              ))}
            </ul>

            {prescription.name !== HCG && (
              <Body3 className="text-tertiary">
                {COMPOUNDED_PRODUCTS_DISCLAIMER}
              </Body3>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-2xl border border-zinc-200 p-4 shadow-sm">
              <div className="flex w-full flex-col gap-3">
                <div className="flex items-baseline justify-between gap-4">
                  <Body1>Monthly plan</Body1>
                  <p className="text-base font-semibold text-primary">
                    ${prescription.price}/mo
                  </p>
                </div>

                <ul className="space-y-2">
                  {includes.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="inline-flex size-1 rounded-full bg-zinc-200" />
                      <Body2 className="flex-1 text-secondary">{item}</Body2>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {prescription.url ? (
              <NavLink to={prescription.url} className="block w-full">
                <Button className="w-full">Get started</Button>
              </NavLink>
            ) : (
              <Button className="w-full" disabled>
                Get started
              </Button>
            )}
          </div>

          <div className="mt-5 hidden flex-col lg:flex">
            <H4>FAQs</H4>
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue={headerFaq[0]?.question}
            >
              {headerFaq.map(({ question, answer }) => (
                <AccordionItem value={question} key={question}>
                  <AccordionTrigger
                    variant="plusMinus"
                    className="text-xl tracking-[-0.2px] text-primary hover:text-zinc-500"
                  >
                    {question}
                  </AccordionTrigger>
                  <AccordionContent className="whitespace-pre-line text-base text-secondary">
                    {answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
      <div className="my-16 grid grid-cols-2 gap-6 md:mx-20 md:my-28 lg:grid-cols-4">
        {treatmentHighlights.map(({ title, description, Icon }) => (
          <div key={title} className="space-y-2">
            <div className="flex flex-col items-start gap-2 text-primary md:flex-row md:items-center md:justify-center md:gap-3">
              <Icon className="size-6" aria-hidden />
              <H4 className="tracking-[-0.2px] md:text-center">{title}</H4>
            </div>
            <p className="text-sm text-secondary md:text-center">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

type PrescriptionBreadcrumbProps = {
  className?: string;
  prescriptionName: string;
};

const PrescriptionBreadcrumb = ({
  className,
  prescriptionName,
}: PrescriptionBreadcrumbProps) => {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <NavLink to="/marketplace">Marketplace</NavLink>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <NavLink to="/marketplace?tab=prescriptions">Prescriptions</NavLink>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>{prescriptionName}</BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
