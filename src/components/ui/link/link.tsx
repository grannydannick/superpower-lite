import { createLink } from '@tanstack/react-router';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface BaseLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const BaseLinkComponent = React.forwardRef<HTMLAnchorElement, BaseLinkProps>(
  ({ className, 'aria-label': ariaLabel, ...props }, ref) => {
    return (
      <a
        ref={ref}
        {...props}
        aria-label={ariaLabel}
        className={cn('text-slate-600 hover:text-slate-900', className)}
      />
    );
  },
);

BaseLinkComponent.displayName = 'BaseLinkComponent';

export const Link = createLink(BaseLinkComponent);
