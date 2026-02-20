import { ArrowUpRightIcon } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

import { Link } from '../ui/link';
import { Body2 } from '../ui/typography';

/**
 * A quick link component that is used to link to an internal page.
 * It has predefined styles and a title.
 */
const QuickLink = forwardRef<
  HTMLElement,
  {
    title?: string;
    className?: string;
    children?: React.ReactNode;
    to?: string;
    as?: React.ElementType;
    disabled?: boolean;
  } & React.HTMLAttributes<HTMLElement>
>(
  (
    {
      title,
      className,
      children,
      to,
      as: Component = to ? Link : 'div',
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <Component
        ref={ref}
        {...props}
        {...(to && !disabled && { to })}
        data-disabled={disabled}
        className={cn(
          'group relative z-0 overflow-y-auto rounded-xl border border-zinc-200 p-4 shadow-md shadow-black/[.02] transition-colors',
          disabled
            ? 'animate-pulse cursor-not-allowed'
            : 'cursor-pointer hover:bg-zinc-50',
          title && 'pt-12',
          className,
        )}
      >
        <div
          className={cn(
            'pointer-events-none absolute left-0 right-0 top-0 flex items-center gap-2 px-4 pb-6 pt-4',
            title
              ? disabled
                ? 'justify-between rounded-t-xl bg-gradient-to-t from-transparent via-white/80 to-white'
                : 'justify-between rounded-t-xl bg-gradient-to-t from-transparent via-white/80 to-white transition-colors group-hover:via-zinc-50/80 group-hover:to-zinc-50'
              : 'justify-end',
          )}
        >
          {title && (
            <Body2 className="pointer-events-auto line-clamp-1">{title}</Body2>
          )}
          <ArrowUpRightIcon
            className={cn(
              'size-5 text-zinc-400 transition-all ease-out',
              disabled
                ? 'hidden'
                : 'group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
            )}
          />
        </div>
        {children}
      </Component>
    );
  },
);

QuickLink.displayName = 'QuickLink';

export default QuickLink;
