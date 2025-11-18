import * as React from 'react';

import { H4 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface HomepageCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export const HomepageCard = ({
  title,
  children,
  className,
  titleClassName,
}: HomepageCardProps) => {
  return (
    <div
      className={cn(
        'md:rounded-3xl md:bg-white md:p-6 md:shadow-sm',
        className,
      )}
    >
      {title && <H4 className={cn('mb-4', titleClassName)}>{title}</H4>}
      <div>{children}</div>
    </div>
  );
};
