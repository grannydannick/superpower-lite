import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { ReactNode } from 'react';

import { H2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

export const BlockAccordion = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactNode => {
  return (
    <Accordion.Root type="single" collapsible className="w-full max-w-[630px]">
      <Accordion.Item value="item-1">
        <Accordion.Header className="w-full">
          <Accordion.Trigger
            className={cn(
              'flex justify-between items-center w-full cursor-pointer',
              'bg-zinc-900 px-5 py-2 transition-all',
              'rounded-lg',
              '[&[data-state=open]>svg]:rotate-180',
              'data-[state=open]:rounded-b-none',
              'data-[state=open]:rounded-t-lg',
            )}
          >
            <H2 className="text-base text-white md:text-base">{title}</H2>
            <ChevronDown
              className={cn(
                'h-5 w-5 transition-transform duration-300 ease-in-out',
                'text-white',
              )}
            />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content
          asChild
          className={cn(
            'overflow-hidden border border-t-0 rounded-b-lg transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
          )}
        >
          <div>{children}</div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};
