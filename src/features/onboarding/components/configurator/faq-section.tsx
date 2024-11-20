import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import React, { useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
  AccordionItem,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { FancySwitch } from '@/components/ui/fancy-switch';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import {
  ALL_FAQ,
  HOW_IT_WORKS,
  MEMBERSHIP,
  SECURITY,
} from '@/features/onboarding/const/faq-content';
import { cn } from '@/lib/utils';

const FaqSection = () => {
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState('How it works');

  const options = ['How it works', 'Membership', 'Security'];

  const tabParser = (prev: number) => {
    if (prev < HOW_IT_WORKS.length) {
      setTab('How it works');
    } else if (
      prev >= HOW_IT_WORKS.length &&
      prev < MEMBERSHIP.length + HOW_IT_WORKS.length
    ) {
      setTab('Membership');
    } else {
      setTab('Security');
    }
  };

  const forward = () => {
    setIndex((prev) => {
      prev = prev !== 0 ? prev - 1 : prev;
      tabParser(prev);

      return prev;
    });
  };

  const back = () => {
    setIndex((prev) => {
      prev = prev < ALL_FAQ.length - 1 ? prev + 1 : prev;
      tabParser(prev);

      return prev;
    });
  };

  return (
    <Sheet>
      <section id="footer" className="my-3 hidden w-full lg:block">
        <Body2 className="text-zinc-400">FAQ - How it works</Body2>
        <SheetTrigger asChild>
          <Body1 className=" cursor-pointer text-zinc-900 transition-colors hover:text-vermillion-900">
            {ALL_FAQ[index].display}
          </Body1>
        </SheetTrigger>
        <hr className="mb-2 mt-3 bg-zinc-500" />
        <div className="flex flex-row justify-between">
          <div className="flex flex-row items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={forward}>
              <ChevronLeft className="size-4 cursor-pointer hover:text-zinc-900" />
            </Button>
            <Button variant="ghost" size="icon" onClick={back}>
              <ChevronRight className="size-4 cursor-pointer hover:text-zinc-900" />
            </Button>
          </div>

          <SheetTrigger asChild>
            <a href="#" className="text-sm text-zinc-400 hover:text-zinc-900">
              View FAQs
            </a>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[584px] !max-w-none space-y-8 p-16"
          >
            <SheetHeader className="flex-row items-center justify-between space-y-0">
              <H2>Superpower FAQ</H2>
              <SheetClose>
                <X className="size-[24px] min-w-[24px] text-primary" />
              </SheetClose>
            </SheetHeader>
            <FancySwitch
              value={tab}
              options={options}
              onChange={setTab}
              className="flex rounded-full border border-zinc-200 p-1"
              highlighterClassName="bg-primary rounded-full"
              radioClassName={cn(
                'relative mx-2 flex h-9 cursor-pointer items-center justify-center w-full',
                'rounded-full px-3.5 text-sm font-medium transition-colors focus:outline-none data-[checked]:text-primary-foreground',
                'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
              )}
              highlighterIncludeMargin={true}
            />
            {tab === 'How it works' ? (
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue={ALL_FAQ[index].display}
              >
                {HOW_IT_WORKS.map((item, i) => (
                  <AccordionItem value={item.display} key={i}>
                    <AccordionTrigger className="py-6  text-sm text-zinc-900">
                      {item.display}
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-500">
                      {item.description}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : null}

            {tab === 'Membership' ? (
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue={ALL_FAQ[index].display}
              >
                {MEMBERSHIP.map((item, i) => (
                  <AccordionItem value={item.display} key={i}>
                    <AccordionTrigger className="py-6 text-sm text-zinc-900">
                      {item.display}
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-500">
                      {item.description}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : null}

            {tab === 'Security' ? (
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue={ALL_FAQ[index].display}
              >
                {SECURITY.map((item, i) => (
                  <AccordionItem value={item.display} key={i}>
                    <AccordionTrigger className="py-6 text-sm text-zinc-900">
                      {item.display}
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-500">
                      {item.description}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : null}
          </SheetContent>
        </div>
      </section>
    </Sheet>
  );
};

export { FaqSection };
