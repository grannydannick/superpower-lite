import React, { ReactNode } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { TestimonialCarousel } from '@/components/shared/testimonials/components/testimonial-carousel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Body1, Body2, H3 } from '@/components/ui/typography';

const MEMBERSHIP_BENEFITS = [
  {
    title: <Body1>100+ lab tests</Body1>,
    descripion: (
      <Body2 className="text-zinc-500">
        Annual whole body testing for heart health, hormones, inflammation,
        nutrients, and more.&nbsp;
        <a
          href="https://superpower.com/biomarkers"
          target="_blank"
          rel="noreferrer"
          className="text-vermillion-900"
        >
          See all tests
        </a>
      </Body2>
    ),
    image: 'onboarding/lab-tests.webp',
  },
  {
    title: <Body1>Your data tracked overtime</Body1>,
    descripion: (
      <Body2 className="text-zinc-500">
        Medical records, family history, and your lab results all in one place
        tracked over a lifetime
      </Body2>
    ),
    image: 'onboarding/your-data.webp',
  },
  {
    title: <Body1>Custom protocol & 24/7 health concierge</Body1>,
    descripion: (
      <Body2 className="text-zinc-500">
        An action plan from world-class experts using the latest in scientific
        research and unlimited texting with your concierge
      </Body2>
    ),
    image: 'onboarding/custom-protocol.webp',
  },
];

const MEMBERSHIP_FAQ = [
  {
    display: 'What lab tests do I get in a membership?',
    description: (
      <p>
        A membership covers two lab panels per year. The first establishes your
        baseline across 60 labs — each handpicked by our board of MDs. The
        second, six months later, rechecks the same 60 to track progress. You
        can find the full list of tested biomarkers{' '}
        <a
          href="https://superpower.com/biomarkers"
          target="_blank"
          rel="noreferrer"
          className="text-vermillion-900 underline-offset-2 hover:underline"
        >
          here
        </a>
        . Our membership also includes a custom written action plan and access
        to a concierge medical team via text.
      </p>
    ),
  },
  {
    display: 'Don’t I already get a blood test in my general checkup?',
    description:
      "Your general check up includes anywhere from 10 to 30 labs, which isn't a comprehensive view of your health. We take it a step further by testing 60+ labs across 17 core areas of health (e.g. heart, liver, inflammation, hormones and more) to ensure we give you a precise and tailored action plan to take your health to the next level.",
  },
  {
    display: 'Can I get more tests whenever I want?',
    description:
      'Yes. We’re here to support all of your preventative health, performance and longevity needs. A core part of the Superpower Concierge is being able to get you access to all the testing you need. That includes gut microbiome, toxin tests, Galleri’s cancer screen, and more.',
  },
  {
    display: 'Do you replace my primary care doctor?',
    description:
      'No. Your annual membership to Superpower’s testing and health concierge is designed to complement your primary care doctor, not replace them. We do not offer typical sick care, but rather, our care team are there to answer questions related to prevention, performance, and longevity. We try to step in where the healthcare system is falling short. We provide best-in-class early diagnostics assessments and guidance from our longevity advisors.',
  },
  {
    display: 'Where do I go for my lab visit?',
    description:
      'We partner with over 2,000 locations across the US. Our lab partner performs billions of tests each year and is one of the leading labs in the nation. We also offer at-home testing for an additional fee where a private nurse will come to you.',
  },
  {
    display: 'Does Superpower accept HSA/FSA?',
    description: (
      <p>
        Superpower is HSA/FSA eligible, and members can request an itemized
        receipt from{' '}
        <a
          href="mailto:members@superpower.com"
          className="text-vermillion-900 underline-offset-2 hover:underline"
        >
          members@superpower.com
        </a>{' '}
        to submit for reimbursement. If for whatever reason your HSA/FSA
        reimbursement is declined, we’re happy to refund you prior to your first
        lab test.
      </p>
    ),
  },
];

export const RegisterLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="mx-auto grid min-h-dvh w-full gap-16 p-4 py-8 md:p-8 lg:grid-cols-2 lg:justify-items-center">
      <div className="flex flex-1 flex-col justify-between gap-8 md:px-8 lg:gap-4">
        <SuperpowerLogo />
        {children}
        <div className="lg:hidden">
          <TestimonialCarousel darkMode={false} />
        </div>
        <div className="flex gap-6 text-xs text-zinc-400">
          <a
            href="https://www.superpower.com/privacy"
            target="_blank"
            rel="noreferrer"
            className="transition-colors duration-150 hover:text-zinc-500"
          >
            Privacy Policy
          </a>
          <a
            href="https://www.superpower.com/terms"
            target="_blank"
            rel="noreferrer"
            className="transition-colors duration-150 hover:text-zinc-500"
          >
            Terms of services
          </a>
        </div>
      </div>

      <div className="sticky top-8 hidden w-full flex-1 flex-col justify-between gap-12 rounded-3xl px-16 py-12 lg:flex lg:min-h-[calc(100vh-4rem)] lg:bg-zinc-100">
        <div className="space-y-6">
          <H3>Your membership includes</H3>
          <div className="space-y-4">
            {MEMBERSHIP_BENEFITS.map((b, i) => (
              <div
                className="flex gap-3 rounded-[20px] bg-white p-4 shadow-md shadow-black/[.02] animate-in fade-in slide-in-from-bottom-10"
                key={i}
                style={{
                  animationDuration: `${(i + 1) * 0.3}s`,
                }}
              >
                <img
                  className="size-12 min-w-12 rounded-xl bg-zinc-100"
                  src={b.image}
                  alt="superpower benefit"
                />
                <div>
                  {b.title}
                  {b.descripion}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue={MEMBERSHIP_FAQ[0].display}
        >
          {MEMBERSHIP_FAQ.map((item, i) => (
            <AccordionItem value={item.display} key={i}>
              <AccordionTrigger className="py-3 text-sm text-zinc-900 hover:text-zinc-500">
                {item.display}
              </AccordionTrigger>
              <AccordionContent className="text-zinc-500">
                {item.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
