import { PopoverClose } from '@radix-ui/react-popover';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import React, { RefObject, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
  AccordionItem,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { H2 } from '@/components/ui/typography';

type Faq = {
  display: string;
  description: string;
};

const HOW_IT_WORKS: Faq[] = [
  {
    display: 'Can I get more tests whenever I want?',
    description:
      'Yes. We’re here to support all of your preventative health, performance and longevity needs. A core part of the Superpower Concierge is being able to get you access to all the testing you need, in minutes. That includes custom lab panels, MRIs, DEXA scans, Galleri’s cancer screen, and more.',
  },
  {
    display: 'Do you replace my primary care doctor?',
    description: `No. Your annual membership to Superpower’s Baseline testing and health concierge is designed to complement your primary care doctor, not replace them.

We do not offer typical sick care, but rather, our longevity clinicians are there to answer questions related to prevention, performance, and longevity. We try to step in where the healthcare system is falling short. We provide best-in-class early diagnostics assessments and guidance from our longevity-trained clinicians.`,
  },
  {
    display: 'Where do I go for my lab visit?',
    description:
      'You will be tested at one of over 2,000 locations across the US, within 10 miles of nearly every home in the United States. Our lab partner performs over 50 million tests per year and is trusted by the entire medical community. We also offer at-home testing for an additional fee where a nurse will come to you.',
  },
];

const MEMBERSHIP: Faq[] = [
  {
    display: 'Does Superpower accept health insurance?',
    description: `Not at this time, but we’re working on it. We already accept HSA and FSA.

We see Superpower like a gym membership for those committed to prevention and performance. Superpower is a bridge between wellness and healthcare. Health insurance traditionally focuses on reactive care whereas, at Superpower, we believe it’s never too early to start looking out for your long-term health.`,
  },
  {
    display: 'Which tests are included in my membership?',
    description: `The first lab panel includes over 60 biomarkers.

Additional tests can be ordered at any time from the Superpower app. We have brought together the best tests into one platform. Many of these are hard to access anywhere else.`,
  },
  {
    display: 'Can I business expense Superpower?',
    description: `The majority of members business expense Superpower. Your health directly impacts the success of your business. Just as executive coaching sessions and other professional services are considered a justified expense, Superpower should be viewed in the same light. If there are reservations, we are more than willing to discuss the value of this investment with your company’s leadership team – it's a minimal cost for potentially significant returns.`,
  },
  {
    display: 'What is your price & health guarantee?',
    description: `
    Our price guarantee means that for all items in our curated marketplace, we will price match.
Our health guarantee means that all products meet our rigorous standards for ingredient quality and scientific efficacy.`,
  },
];

const SECURITY: Faq[] = [
  {
    display: 'Is my data secure?',
    description:
      'We take data privacy and information security extremely seriously. Superpower is designed to be your lifelong health partner and give you full control and ownership of your health information. All of your data is securely encrypted with full HIPAA compliance, and never shared with any third parties.',
  },
];

const ALL_FAQ = [...HOW_IT_WORKS, ...MEMBERSHIP, ...SECURITY];

const FaqSection = ({ faqRef }: { faqRef: RefObject<HTMLDivElement> }) => {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      if (faqRef.current) {
        setWidth(faqRef.current.scrollWidth - 60);
      }
    };

    // Initial width setting
    updateWidth();

    // Listen for changes to the element
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, [faqRef]);

  return (
    <section id="footer" className="my-3 w-full text-[#A1A1A1]">
      <p className="text-xs">FAQ - How it works</p>
      <p className="text-lg text-zinc-900">{ALL_FAQ[index].display}</p>
      <hr className="mb-2 mt-3 bg-zinc-500" />
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIndex((prev) => (prev !== 0 ? prev - 1 : prev))}
          >
            <ChevronLeft className="size-4 cursor-pointer hover:text-zinc-900" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setIndex((prev) => (prev < ALL_FAQ.length - 1 ? prev + 1 : prev))
            }
          >
            <ChevronRight className="size-4 cursor-pointer hover:text-zinc-900" />
          </Button>
        </div>

        {isPopoverOpen &&
          createPortal(
            <div className="fixed inset-0 z-40 bg-white opacity-80" />,
            document.body,
          )}

        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <a href="#" className="text-sm hover:text-zinc-900">
              View FAQs
            </a>
          </PopoverTrigger>
          <PopoverContent
            className="h-[calc(100dvh-150px)] rounded-2xl p-16"
            style={{ width: width }}
            side="top"
            align="end"
          >
            <div className="grid gap-16">
              <div className="flex items-center justify-between">
                <H2 className="text-zinc-900">Superpower FAQ</H2>
                <PopoverClose>
                  <X className="size-6 cursor-pointer text-zinc-900" />
                </PopoverClose>
              </div>
              <div>
                <Tabs defaultValue="how">
                  <TabsList className="grid h-auto w-full grid-cols-3 rounded-[64px] border border-zinc-200 bg-white p-1 text-sm text-zinc-900">
                    <TabsTrigger
                      value="how"
                      className="max-w-[140px] rounded-[80px]  !border-b-0 px-5 py-3 text-sm text-zinc-900 data-[state=active]:!border-b-0 data-[state=active]:bg-zinc-900 data-[state=active]:text-white"
                    >
                      How it works
                    </TabsTrigger>
                    <TabsTrigger
                      value="membership"
                      className="max-w-[140px] rounded-[80px]  !border-b-0 px-5 py-3 text-sm text-zinc-900 data-[state=active]:!border-b-0 data-[state=active]:bg-zinc-900 data-[state=active]:text-white"
                    >
                      Membership
                    </TabsTrigger>
                    <TabsTrigger
                      value="security"
                      className="max-w-[140px] rounded-[80px]  !border-b-0 px-5 py-3 text-sm text-zinc-900 data-[state=active]:!border-b-0 data-[state=active]:bg-zinc-900 data-[state=active]:text-white"
                    >
                      Security
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="how">
                    <Accordion type="single" collapsible className="w-full">
                      {HOW_IT_WORKS.map((item, i) => (
                        <AccordionItem value={i.toString()} key={i}>
                          <AccordionTrigger className="text-sm text-zinc-900">
                            {item.display}
                          </AccordionTrigger>
                          <AccordionContent className="text-zinc-500">
                            {item.description}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>{' '}
                  <TabsContent value="membership">
                    <Accordion type="single" collapsible className="w-full">
                      {MEMBERSHIP.map((item, i) => (
                        <AccordionItem value={i.toString()} key={i}>
                          <AccordionTrigger className="text-sm text-zinc-900">
                            {item.display}
                          </AccordionTrigger>
                          <AccordionContent className="text-zinc-500">
                            {item.description}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                  <TabsContent value="security">
                    <Accordion type="single" collapsible className="w-full">
                      {SECURITY.map((item, i) => (
                        <AccordionItem value={i.toString()} key={i}>
                          <AccordionTrigger className="text-sm text-zinc-900">
                            {item.display}
                          </AccordionTrigger>
                          <AccordionContent className="text-zinc-500">
                            {item.description}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </section>
  );
};

export { FaqSection };
