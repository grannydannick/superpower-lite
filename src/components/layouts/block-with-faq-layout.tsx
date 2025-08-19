import * as React from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Head } from '@/components/seo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Body1, Body2, H3 } from '@/components/ui/typography';

// NOTE: progress here is used if we want to indicate any type of progress like 1/3 steps etc
type LayoutProps = {
  children: React.ReactNode;
  title: string;
  className?: string;
  progress?: {
    current: number;
    total: number;
  };
};

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
        Your membership includes one comprehensive blood panel per year. This
        single draw measures 100+ biomarkers - handpicked by our board of MDs -
        to give you a complete baseline of your health. You can find the full
        list of tested biomarkers{' '}
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
      "Your general check up includes anywhere from 10 to 30 labs, which isn't a comprehensive view of your health. We take it a step further by giving you 100+ insights across 17 core areas of health (e.g. heart, liver, inflammation, hormones and more) to ensure we give you a precise and tailored action plan to take your health to the next level.",
  },
  {
    display: 'Can I get more tests whenever I want?',
    description:
      'Yes. We’re here to support all of your preventative health, performance and longevity needs. A core part of the Superpower Concierge is being able to get you access to all the testing you need. That includes gut microbiome, toxin tests, Galleri’s cancer screen, and more.',
  },
  {
    display: 'Do you replace my primary care doctor?',
    description:
      'We do not offer typical sick care, but rather, our care team is there to answer questions related to prevention, performance, and longevity.',
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

const FooterLinks = () => (
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
      Terms of Service
    </a>
  </div>
);

export const BlockWithFaqLayout = ({
  children,
  title,
  progress,
}: LayoutProps) => {
  return (
    <>
      <Head title={title} />
      <div className="relative mx-auto grid w-full gap-16 p-4 py-8 md:p-8 lg:min-h-dvh lg:grid-cols-2 lg:justify-items-center">
        <div className="flex w-full flex-col gap-8 md:px-8 lg:max-w-2xl lg:flex-1 lg:justify-between lg:gap-4">
          <div className="flex items-center justify-between">
            <SuperpowerLogo />
            {progress ? (
              <div className="flex items-center gap-4">
                <Body2 className="text-zinc-400">
                  Step {progress.current} / {progress.total}
                </Body2>
                <Progress
                  value={(progress.current / progress.total) * 100}
                  className="h-[3px] w-20"
                />
              </div>
            ) : null}
          </div>
          {children}
          <FooterLinks />
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
                <AccordionTrigger className="py-3 text-left text-sm text-zinc-900 hover:text-zinc-500">
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
    </>
  );
};
