import { type ReactNode } from 'react';

import { ActionableAccordion } from '@/components/shared/actionable-accordion';

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
    return (
      <ActionableAccordion
        title={title}
        defaultOpen
        allowCollapse={false}
        highlighted={false}
        showHeaderIndicator={false}
        showTopSeparator={false}
      >
        {children}
      </ActionableAccordion>
    );
  }

  return <ActionableAccordion title={title}>{children}</ActionableAccordion>;
};
