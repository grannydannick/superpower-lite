import { createLink } from '@tanstack/react-router';
import * as React from 'react';

import { H4 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

const HOMEPAGE_CARD_CLASS_NAME =
  'rounded-[24px] bg-white p-4 shadow-md shadow-black/[.02] md:p-6';

interface HomepageCardProps {
  title?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

interface HomepageCardContentProps {
  title?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  titleClassName?: string;
}

const HomepageCardContent = ({
  title,
  headerRight,
  children,
  titleClassName,
}: HomepageCardContentProps) => {
  return (
    <>
      {(title || headerRight) && (
        <div
          className={cn(
            'mb-4 flex items-center justify-between',
            titleClassName,
          )}
        >
          {title && <H4>{title}</H4>}
          {headerRight}
        </div>
      )}
      <div>{children}</div>
    </>
  );
};

export const HomepageCard = ({
  title,
  headerRight,
  children,
  className,
  titleClassName,
}: HomepageCardProps) => {
  return (
    <div className={cn(HOMEPAGE_CARD_CLASS_NAME, className)}>
      <HomepageCardContent
        title={title}
        headerRight={headerRight}
        titleClassName={titleClassName}
      >
        {children}
      </HomepageCardContent>
    </div>
  );
};

interface BaseHomepageLinkCardProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  title?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  titleClassName?: string;
}

const BaseHomepageLinkCard = React.forwardRef<
  HTMLAnchorElement,
  BaseHomepageLinkCardProps
>(
  (
    { className, title, headerRight, children, titleClassName, ...props },
    ref,
  ) => {
    return (
      <a
        ref={ref}
        {...props}
        className={cn(
          HOMEPAGE_CARD_CLASS_NAME,
          'group block overflow-hidden',
          className,
        )}
      >
        <HomepageCardContent
          title={title}
          headerRight={headerRight}
          titleClassName={titleClassName}
        >
          {children}
        </HomepageCardContent>
      </a>
    );
  },
);

BaseHomepageLinkCard.displayName = 'BaseHomepageLinkCard';

export const HomepageLinkCard = createLink(BaseHomepageLinkCard);
