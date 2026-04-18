import { Children, type ReactNode } from 'react';

import { ActionableAccordion } from '@/components/shared/actionable-accordion';
import { Separator } from '@/components/ui/separator';

import { HomepageCard } from './homepage-card';

interface HomepageActionAccordionProps {
  children: ReactNode;
  title?: string;
  variant?: 'default' | 'minimal';
}

export const HomepageActionAccordion = ({
  children,
  title,
  variant = 'default',
}: HomepageActionAccordionProps) => {
  if (variant === 'minimal') {
    const items = Children.toArray(children);
    if (items.length === 0) return null;

    const rows: ReactNode[] = [];
    let separatorKey = 0;
    for (const item of items) {
      if (rows.length > 0) {
        rows.push(<Separator key={`item-separator-${separatorKey}`} />);
        separatorKey += 1;
      }
      rows.push(item);
    }

    return (
      <HomepageCard title={title}>
        <div className="-mx-4 -mb-4 md:-mx-6 md:-mb-6">{rows}</div>
      </HomepageCard>
    );
  }

  return <ActionableAccordion title={title}>{children}</ActionableAccordion>;
};
