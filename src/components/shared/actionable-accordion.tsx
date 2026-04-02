import { Collapsible } from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Children, ReactNode, useState } from 'react';

import { cn } from '@/lib/utils';

import { CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Separator } from '../ui/separator';
import { Body1, Body2 } from '../ui/typography';

export interface ActionableAccordionItemProps {
  title: string;
  description: string;
  imageSrc: string;
  onClick: () => void;
}

interface ActionableAccordionProps {
  children: ReactNode;
  title?: string;
  defaultOpen?: boolean;
  allowCollapse?: boolean;
  highlighted?: boolean;
  showHeaderIndicator?: boolean;
  showTopSeparator?: boolean;
}

export const ActionableAccordionItem = ({
  title,
  description,
  imageSrc,
  onClick,
}: ActionableAccordionItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full items-center gap-3 px-4 py-4 text-left outline-none transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex shrink-0 items-center">
        <div className="relative flex size-4 items-center justify-center rounded-full bg-vermillion-100">
          <div className="size-1.5 rounded-full bg-vermillion-900" />
        </div>
        <img
          src={imageSrc}
          alt=""
          className="ml-1.5 size-12 shrink-0 object-contain pt-1 rounded-mask"
        />
      </div>

      <div className="flex flex-1 items-center gap-3">
        <div className="flex-1">
          <Body1 className="text-zinc-900">{title}</Body1>
          <Body2 className="text-zinc-600">{description}</Body2>
        </div>
        <ChevronRight
          aria-hidden="true"
          className="size-5 text-zinc-400 transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </button>
  );
};

export const ActionableAccordion = ({
  children,
  title,
  defaultOpen = false,
  allowCollapse = true,
  highlighted = true,
  showHeaderIndicator = true,
  showTopSeparator = true,
}: ActionableAccordionProps) => {
  const items = Children.toArray(children);
  const totalActionable = items.length;
  const [open, setOpen] = useState(defaultOpen);

  if (totalActionable === 0) {
    return null;
  }

  const rows: Array<ReactNode> = [];
  let separatorKey = 0;

  for (const item of items) {
    if (rows.length > 0) {
      rows.push(<Separator key={`item-separator-${separatorKey}`} />);
      separatorKey += 1;
    }

    rows.push(item);
  }

  let headerTitle = title;
  if (headerTitle === undefined) {
    headerTitle = `You have ${totalActionable} task${totalActionable === 1 ? '' : 's'}`;
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[20px] border bg-white',
        highlighted
          ? 'border-vermillion-900 shadow-[0_0_4px_0_rgba(252,95,43,0.5)]'
          : 'border-zinc-200 shadow-none',
      )}
    >
      {allowCollapse ? (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                'group relative flex w-full items-center p-4 text-left',
                showHeaderIndicator ? 'gap-3' : undefined,
              )}
            >
              {showHeaderIndicator ? (
                <div className="relative flex size-4 items-center justify-center rounded-full bg-vermillion-100">
                  <div className="size-1.5 rounded-full bg-vermillion-900" />
                </div>
              ) : null}
              <div className="flex flex-1 items-center justify-between">
                <Body1 className="text-zinc-900">{headerTitle}</Body1>
                <ChevronDown
                  className={cn(
                    'size-5 text-zinc-400 transition-transform duration-200',
                    !open && '-rotate-90',
                  )}
                />
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div>
              {showTopSeparator ? <Separator /> : null}
              {rows}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div>
          <div
            className={cn(
              'group relative flex w-full items-center p-4 text-left',
              showHeaderIndicator ? 'gap-3' : undefined,
            )}
          >
            {showHeaderIndicator ? (
              <div className="relative flex size-4 items-center justify-center rounded-full bg-vermillion-100">
                <div className="size-1.5 rounded-full bg-vermillion-900" />
              </div>
            ) : null}
            <div className="flex flex-1 items-center justify-between">
              <Body1 className="text-zinc-900">{headerTitle}</Body1>
            </div>
          </div>
          <div>
            {showTopSeparator ? <Separator /> : null}
            {rows}
          </div>
        </div>
      )}
    </div>
  );
};
