import * as React from 'react';

import { H2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

const PlanSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-3xl bg-white shadow-md md:p-6', className)}
    {...props}
  />
));
PlanSection.displayName = 'PlanSection';

const PlanSectionHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
PlanSectionHeader.displayName = 'PlanSectionHeader';

const PlanSectionTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <H2
    ref={ref}
    className={cn('leading-none tracking-tight', className)}
    {...props}
  />
));
PlanSectionTitle.displayName = 'PlanSectionTitle';

const PlanSectionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
PlanSectionContent.displayName = 'PlanSectionContent';

export { PlanSection, PlanSectionHeader, PlanSectionTitle, PlanSectionContent };
