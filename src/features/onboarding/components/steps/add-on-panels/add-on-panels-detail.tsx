import { IconCheckmark1 } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconCheckmark1';
import { IconSparkle } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconSparkle';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconPlusSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusSmall';
import { Children, isValidElement, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';

import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import type { AddOnItem } from '@/features/onboarding/api/onboarding-add-ons';
import type { PanelDetailContent } from '@/features/onboarding/data/panel-detail-content';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';

const PanelDetailMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => {
          const childNodes = Children.toArray(children);
          const onlyChild = childNodes[0];

          if (
            childNodes.length === 1 &&
            isValidElement<{ children?: ReactNode }>(onlyChild) &&
            onlyChild.type === 'strong'
          ) {
            return (
              <h3 className="m-0 mt-10 text-base font-medium text-zinc-900 first:mt-0">
                {onlyChild.props.children}
              </h3>
            );
          }

          return (
            <Body1 className="mt-4 text-zinc-500 first:mt-0">{children}</Body1>
          );
        },
        ul: ({ children }) => (
          <ul className="ml-1 mt-4 space-y-1 first:mt-0 [&>li]:relative [&>li]:flex [&>li]:items-start [&>li]:pl-4 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-1/2 [&>li]:before:size-1 [&>li]:before:shrink-0 [&>li]:before:-translate-y-1/2 [&>li]:before:rounded-full [&>li]:before:bg-zinc-300">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="ml-1 mt-4 space-y-1 [counter-reset:list-counter] first:mt-0 [&>li]:flex [&>li]:items-start [&>li]:[counter-increment:list-counter] [&>li]:before:mr-2 [&>li]:before:text-sm [&>li]:before:font-medium [&>li]:before:text-zinc-500 [&>li]:before:[content:counter(list-counter)'.']">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="text-zinc-500">{children}</li>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export const AddOnPanelsDetail = ({
  item,
  content,
  isSelected,
  isToggleDisabled,
  onToggle,
  onClose,
  className,
}: {
  item: AddOnItem;
  content: PanelDetailContent;
  isSelected: boolean;
  isToggleDisabled: boolean;
  onToggle: () => void;
  onClose: () => void;
  className?: string;
}) => {
  const isLocked = item.status !== 'available';

  return (
    <div
      className={cn(
        'flex h-full min-h-full flex-col overflow-hidden bg-white',
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-end px-8 pb-2 pt-6">
        <button
          type="button"
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          aria-label="Close details"
        >
          <IconCrossMedium className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="space-y-2 pb-6">
          <div className="flex items-center gap-2">
            <H2>{item.name}</H2>
            {item.isRecommended && item.status === 'available' && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded bg-[#fc5f2b]/10 px-1 text-[11px] font-normal leading-5 tracking-wide text-[#fc5f2b]">
                <IconSparkle className="size-3 shrink-0" />
                Recommended
              </span>
            )}
          </div>
          {item.description != null && item.description.trim().length > 0 && (
            <Body1 className="text-zinc-500">{item.description}</Body1>
          )}
        </div>

        <PanelDetailMarkdown>{content.details}</PanelDetailMarkdown>

        {content.biomarkers.length > 0 && (
          <div className="mt-8 space-y-3">
            <Body1 className="font-medium text-zinc-900">
              Included biomarkers
            </Body1>
            <div className="flex flex-wrap gap-2">
              {content.biomarkers.map((biomarker) => (
                <span
                  key={biomarker}
                  className="inline-flex items-center gap-2 rounded-full bg-[#fc5f2b]/10 px-4 py-2 text-sm font-medium text-[#fc5f2b]"
                >
                  <span className="size-2 shrink-0 rounded-full bg-[#fc5f2b]" />
                  {biomarker}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isLocked && (
        <div className="sticky bottom-0 z-10 shrink-0 border-t border-zinc-100 bg-white/95 px-8 py-5 backdrop-blur">
          <div className="flex items-center justify-between pb-3">
            <Body1 className="text-zinc-900">{formatMoney(item.price)}</Body1>
          </div>
          <Button
            onClick={onToggle}
            variant={isSelected ? 'outline' : 'default'}
            className="w-full"
            disabled={isToggleDisabled}
          >
            {isSelected ? (
              <span className="flex items-center gap-2">
                <IconCheckmark1 className="size-4" />
                Added to cart
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <IconPlusSmall className="size-4" />
                Add to cart
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
