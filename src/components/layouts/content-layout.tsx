import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Head } from '../seo';

const contentLayoutVariants = cva('grow space-y-6 md:space-y-8', {
  variants: {
    variant: {
      default: 'px-6 py-10 sm:px-16',
      homepage: 'p-4 sm:p-4',
      noPadding: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type ContentLayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  title?: string;
} & VariantProps<typeof contentLayoutVariants>;

export const ContentLayout = ({
  children,
  title,
  variant,
  className,
  ...rest
}: ContentLayoutProps) => {
  return (
    <>
      <Head title={title} />
      <div
        className={cn(
          contentLayoutVariants({ variant }),
          'container mx-auto',
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </>
  );
};
