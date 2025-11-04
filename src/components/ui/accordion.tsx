import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown, Minus, Plus } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b', className)}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

type AccordionTriggerProps = React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Trigger
> & {
  variant?: 'default' | 'plusMinus';
};

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, variant = 'default', ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'group flex flex-1 items-center justify-between py-4 text-left font-medium transition-all',
        variant === 'plusMinus'
          ? '[&>span>svg:last-child]:absolute [&>span>svg:last-child]:opacity-0 [&>span>svg:last-child]:rotate-90 [&>span>svg]:transition-all [&>span>svg]:duration-250 [&>span>svg]:ease-in-out [&[data-state=open]>span>svg:first-child]:-rotate-90 [&[data-state=open]>span>svg:first-child]:opacity-0 [&[data-state=open]>span>svg:last-child]:opacity-100 [&[data-state=open]>span>svg:last-child]:rotate-0'
          : '[&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      {variant === 'plusMinus' ? (
        <span className="relative inline-flex size-5 items-center justify-center">
          <Plus
            aria-hidden="true"
            className="size-4 text-secondary transition-all duration-300 ease-in-out"
          />
          <Minus
            aria-hidden="true"
            className="size-4 text-vermillion-900 transition-all duration-300 ease-in-out"
          />
        </span>
      ) : (
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-secondary transition-transform duration-200"
        />
      )}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
