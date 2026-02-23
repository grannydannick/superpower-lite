import { createLink } from '@tanstack/react-router';
import { ArrowUpRightIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Body2 } from './typography';

interface QuickLinkAnchorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const QuickLinkAnchor = React.forwardRef<
  HTMLAnchorElement,
  QuickLinkAnchorProps
>(({ title, className, children, ...props }, ref) => {
  const hasTitle = title != null && title !== '';

  const containerClassName = cn(
    'group relative z-0 overflow-y-auto rounded-xl border border-zinc-200 p-4 shadow-md shadow-black/[.02] transition-colors',
    'cursor-pointer hover:bg-zinc-50',
    hasTitle && 'pt-12',
    className,
  );

  return (
    <a ref={ref} className={containerClassName} {...props}>
      <div
        className={cn(
          'pointer-events-none absolute left-0 right-0 top-0 flex items-center gap-2 px-4 pb-6 pt-4',
          hasTitle
            ? 'justify-between rounded-t-xl bg-gradient-to-t from-transparent via-white/80 to-white transition-colors group-hover:via-zinc-50/80 group-hover:to-zinc-50'
            : 'justify-end',
        )}
      >
        {hasTitle ? (
          <Body2 className="pointer-events-auto line-clamp-1">{title}</Body2>
        ) : null}
        <ArrowUpRightIcon
          className={cn(
            'size-5 text-zinc-400 transition-all ease-out',
            'group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
          )}
        />
      </div>
      {children}
    </a>
  );
});

QuickLinkAnchor.displayName = 'QuickLinkAnchor';

export const QuickLink = createLink(QuickLinkAnchor);

export interface QuickLinkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const QuickLinkButton = React.forwardRef<
  HTMLButtonElement,
  QuickLinkButtonProps
>(({ title, className, children, disabled, ...props }, ref) => {
  const isDisabled = disabled === true;
  const hasTitle = title != null && title !== '';

  const containerClassName = cn(
    'group relative z-0 overflow-y-auto rounded-xl border border-zinc-200 p-4 shadow-md shadow-black/[.02] transition-colors',
    isDisabled
      ? 'animate-pulse cursor-not-allowed'
      : 'cursor-pointer hover:bg-zinc-50',
    hasTitle && 'pt-12',
    className,
  );

  return (
    <button
      ref={ref}
      data-disabled={isDisabled ? true : undefined}
      className={containerClassName}
      {...props}
      type="button"
      disabled={isDisabled}
      aria-disabled={isDisabled ? true : undefined}
    >
      <div
        className={cn(
          'pointer-events-none absolute left-0 right-0 top-0 flex items-center gap-2 px-4 pb-6 pt-4',
          hasTitle
            ? isDisabled
              ? 'justify-between rounded-t-xl bg-gradient-to-t from-transparent via-white/80 to-white'
              : 'justify-between rounded-t-xl bg-gradient-to-t from-transparent via-white/80 to-white transition-colors group-hover:via-zinc-50/80 group-hover:to-zinc-50'
            : 'justify-end',
        )}
      >
        {hasTitle ? (
          <Body2 className="pointer-events-auto line-clamp-1">{title}</Body2>
        ) : null}
        <ArrowUpRightIcon
          className={cn(
            'size-5 text-zinc-400 transition-all ease-out',
            isDisabled
              ? 'hidden'
              : 'group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
          )}
        />
      </div>
      {children}
    </button>
  );
});

QuickLinkButton.displayName = 'QuickLinkButton';
