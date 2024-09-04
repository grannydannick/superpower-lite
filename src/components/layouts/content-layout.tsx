import * as React from 'react';

import { H1 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { Head } from '../seo';

type ContentLayoutProps = {
  children: React.ReactNode;
  title: string;
  className?: string;
  bgColor?: 'white' | 'zinc';
};

export const ContentLayout = ({
  children,
  title,
  className,
  bgColor = 'white',
}: ContentLayoutProps) => {
  return (
    <>
      <Head title={title} />
      <div
        className={cn(
          'w-full flex-1',
          bgColor === 'zinc' ? 'bg-zinc-50' : null,
        )}
      >
        <div
          className={cn(
            'container  mx-auto px-6 py-16 space-y-6 sm:p-16 md:space-y-12',
            className,
          )}
        >
          <H1>{title}</H1>

          {children}
        </div>
      </div>
    </>
  );
};
