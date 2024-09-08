import { ChevronLeft } from 'lucide-react';
import * as React from 'react';

import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  children: JSX.Element;
  className?: string;
  blockBackButton?: boolean;
};

export const ImageContentLayout = (props: Props) => {
  const { title, children, className } = props;

  let { blockBackButton = false } = props;
  const { prevStep, activeStep, steps } = useStepper((s) => s);

  if (steps[activeStep].id === 'additional-booking-success') {
    blockBackButton = true;
  }
  return (
    <>
      <Head title={title} />
      <div className="flex h-screen w-full flex-col overflow-y-auto lg:flex-row">
        <div
          className={cn(
            'min-h-[210px] lg:sticky lg:top-0 lg:h-screen w-full lg:max-w-[556px] bg-spine-2 bg-no-repeat bg-cover flex px-6 flex-col items-start justify-center',
            className,
          )}
        >
          {!blockBackButton ? (
            <Button
              variant="ghost"
              className="flex size-[44px] items-center justify-center rounded-full bg-white p-0 lg:hidden"
              onClick={() => {
                prevStep();
              }}
            >
              <ChevronLeft className="size-4 text-zinc-900" />
            </Button>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col py-6 lg:py-12">
          <section
            id="header"
            className="flex w-full items-center justify-between px-8 lg:px-14"
          >
            {!blockBackButton ? (
              <Button
                variant="ghost"
                className="hidden size-4 rounded-full p-0 lg:block"
                onClick={() => {
                  prevStep();
                }}
              >
                <ChevronLeft className="text-zinc-900" />
              </Button>
            ) : (
              <div className="size-12" />
            )}
            <div className="w-[114px]">
              <img className="w-auto" src="/logo-dark.svg" alt="logo" />
            </div>
            <div className="size-12" />
          </section>
          <div className="p-8 lg:px-16 lg:pb-16 lg:pt-24">{children}</div>
        </div>
      </div>
    </>
  );
};
