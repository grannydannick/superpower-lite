import type { ReactNode } from 'react';
import { useState } from 'react';

import { AnimatedCheckbox } from '@/components/ui/checkbox';
import { Body1, Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';

// NOTE: details trigger should be used very carefully here
// if you render this card inside of the healthcaredialog it would crash
type SelectableCardDetailsRenderOptions = {
  isExpanded: boolean;
  toggle: () => void;
};

type SelectableCardDetailsRenderResult = {
  trigger?: ReactNode;
  content?: ReactNode;
};

type SelectableCardProps = {
  title: string;
  description?: string;
  price?: number;
  imageSrc: string;
  onToggle: () => void;
  disabled?: boolean;
  checked?: boolean;
  details?: (
    options: SelectableCardDetailsRenderOptions,
  ) => SelectableCardDetailsRenderResult | undefined;
  trigger?: ReactNode;
};

export const SelectableCard = ({
  title,
  price,
  imageSrc,
  description = '',
  disabled = false,
  checked,
  onToggle,
  details,
  trigger,
}: SelectableCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDetails = () => {
    setIsExpanded((prev) => !prev);
  };

  const detailsResult = details?.({
    isExpanded,
    toggle: toggleDetails,
  });

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-[20px] border border-zinc-200 bg-white text-left transition',
        'hover:border-zinc-300 hover:bg-zinc-50',
        'flex flex-col',
        isExpanded && 'border-zinc-300',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <div className="flex flex-col gap-4 px-2 pb-2 pt-4 xs:flex-row xs:items-center xs:gap-0 xs:p-0 xs:pr-4">
        <div
          className="flex w-full items-center gap-4 rounded-[20px] outline-0 -outline-offset-1 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-zinc-500 xs:p-4"
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onClick={() => {
            if (!disabled) onToggle();
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggle();
            }
          }}
        >
          {checked !== undefined ? (
            <AnimatedCheckbox
              className="size-5 border border-zinc-200 bg-white data-[state='checked']:border-transparent"
              checked={checked}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) onToggle();
              }}
            />
          ) : null}
          <img
            src={imageSrc}
            className="size-16 rounded-lg object-cover"
            alt={title}
          />
          <div className="flex flex-1 flex-col items-start">
            <Body1 className="flex items-center gap-2">{title}</Body1>
            {price && price > 0 && !disabled && (
              <Body1 className="md:hidden">{formatMoney(price)}</Body1>
            )}
            <Body2 className="line-clamp-2 text-balance text-secondary">
              {description ?? 'No description.'}
            </Body2>
            {detailsResult?.trigger ? (
              <div
                role="presentation"
                className="mt-1"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onKeyDown={(e) => {
                  // we prevent keyboard triggers as well
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                  }
                }}
              >
                {detailsResult.trigger}
              </div>
            ) : null}
          </div>
          {price && price > 0 && !disabled && (
            <Body1 className="hidden md:block">{formatMoney(price)}</Body1>
          )}
        </div>

        {trigger && trigger}
      </div>

      {detailsResult?.content ? (
        <div
          className={cn(
            'ml-0 flex-1 border-t border-zinc-200 p-4 transition-all md:ml-32 md:mr-4 md:px-0',
            isExpanded
              ? 'max-h-screen overflow-y-auto'
              : 'pointer-events-none max-h-0 overflow-hidden p-0 opacity-0',
          )}
        >
          {detailsResult?.content}
        </div>
      ) : null}
    </div>
  );
};
