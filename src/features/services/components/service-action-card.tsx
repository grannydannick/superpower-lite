import type { ReactNode } from 'react';
import { useState } from 'react';

import { AnimatedCheckbox } from '@/components/ui/checkbox';
import { Body1, Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { HealthcareService } from '@/types/api';
import { formatMoney } from '@/utils/format-money';
import { getServiceImage } from '@/utils/service';

// NOTE: details trigger should be used very carefully here
// if you render this card inside of the healthcaredialog it would crash
type ServiceActionCardDetailsRenderOptions = {
  isExpanded: boolean;
  toggle: () => void;
};

type ServiceActionCardDetailsRenderResult = {
  trigger?: ReactNode;
  content?: ReactNode;
};

type ServiceActionCardProps = {
  service: HealthcareService;
  toggle: (s: HealthcareService) => void;
  disabled?: boolean;
  checked?: boolean;
  details?: (
    options: ServiceActionCardDetailsRenderOptions,
  ) => ServiceActionCardDetailsRenderResult | undefined;
  displayPrice?: boolean;
  trigger?: ReactNode;
  imgOverwrite?: string;
};

export const ServiceActionCard = ({
  service,
  disabled = false,
  displayPrice = true,
  checked,
  toggle,
  details,
  trigger,
  imgOverwrite,
}: ServiceActionCardProps) => {
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
      <div
        className="flex w-full items-center gap-4 rounded-[20px] p-4 outline-0 -outline-offset-1 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-zinc-500"
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => {
          if (!disabled) toggle(service);
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle(service);
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
              if (!disabled) toggle(service);
            }}
          />
        ) : null}
        <img
          src={imgOverwrite ? imgOverwrite : getServiceImage(service.name)}
          className="size-16 rounded-lg object-cover"
          alt={service.name}
        />
        <div className="flex flex-1 flex-col items-start">
          <Body1 className="flex items-center gap-2">{service.name}</Body1>
          {service.price > 0 && !disabled && (
            <Body1 className="md:hidden">{formatMoney(service.price)}</Body1>
          )}
          {service.description && (
            <Body2 className="line-clamp-2 text-balance text-secondary">
              {service.description}
            </Body2>
          )}
          {detailsResult?.trigger ? (
            /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
            <div
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
        {displayPrice && service.price > 0 && !disabled && (
          <Body1 className="hidden md:block">
            {formatMoney(service.price)}
          </Body1>
        )}
        {trigger && trigger}
      </div>

      {detailsResult?.content ? (
        <div
          className={cn(
            'ml-0 flex-1 border-t border-zinc-200 p-4 md:ml-32 md:mr-4 md:px-0 transition-all',
            isExpanded
              ? 'max-h-screen overflow-y-auto'
              : 'max-h-0 overflow-hidden opacity-0 pointer-events-none p-0',
          )}
        >
          {detailsResult?.content}
        </div>
      ) : null}
    </div>
  );
};
