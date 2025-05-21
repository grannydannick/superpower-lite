import { ChevronLeft } from 'lucide-react';
import * as React from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Head } from '@/components/seo';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  title: string;
  children: JSX.Element;
  blockBackButton?: boolean;
  showAvailableStates?: boolean;
};

export const OnboardingLayout = (props: Props) => {
  const { title, children, className, showAvailableStates = false } = props;

  let { blockBackButton = false } = props;
  const { prevStep, activeStep, steps } = useStepper((s) => s);

  if (['mission'].includes(steps[activeStep].id)) {
    blockBackButton = true;
  }

  return (
    <>
      <Head title={title} />
      <div className="flex min-h-dvh w-full flex-col p-8 md:p-16">
        <div
          className={cn(
            'fixed left-0 top-0 z-0 h-full w-full bg-male bg-cover',
            className,
          )}
        />
        <div className="z-10 flex w-full flex-1 flex-col justify-between">
          <div className="flex w-full items-center justify-between">
            {activeStep !== 0 && !blockBackButton ? (
              <Button
                variant="glass"
                className="size-12 rounded-full p-0"
                onClick={() => {
                  prevStep();
                }}
              >
                <ChevronLeft className="size-4" />
              </Button>
            ) : (
              <div className="size-12" />
            )}
            <SuperpowerLogo fill="white" />
            <div className="size-12" />
          </div>

          {children}

          {showAvailableStates ? (
            <section
              id="footer"
              className="flex w-full items-center justify-center"
            >
              <Accordion
                type="single"
                collapsible
                className="w-full max-w-[480px] rounded-xl border border-white/20 bg-white/5 p-5"
              >
                <AccordionItem value="item-1" className="border-b-0 text-white">
                  <AccordionTrigger className="p-0">
                    Which states offer Superpower?
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pb-0 pt-4">
                    <div>
                      Superpower is currently available to residents in Arizona,
                      California, Colorado, Connecticut, Florida, Georgia,
                      Illinois, Indiana, Massachusetts, Maryland, Michigan,
                      Minnesota, North Carolina, New Jersey, Nevada, New York,
                      Ohio, Oklahoma, Oregon, Pennsylvania, Tennessee, Texas,
                      Utah, Virginia, and Washington.
                    </div>
                    <div>
                      We are expanding quickly with plans to be available for
                      residents in every state across the US in 2025.
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
          ) : (
            <div />
          )}
        </div>
      </div>
    </>
  );
};
