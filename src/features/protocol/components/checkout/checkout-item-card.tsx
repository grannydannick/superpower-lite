import { Info } from 'lucide-react';

import { AnimatedCheckbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Body1, Body2 } from '@/components/ui/typography';
import { useMarketplace } from '@/features/marketplace/api/get-marketplace';
import { formatMoney } from '@/utils/format-money';

import { Activity } from '../../api';
import { getActivityPricing } from '../../utils/get-activity-pricing';
import { getItemDetails } from '../../utils/get-item-details';

type CheckoutItemCardProps = {
  activity: Activity;
  selected: boolean;
  onToggle: () => void;
};

export const CheckoutItemCard = ({
  activity,
  selected,
  onToggle,
}: CheckoutItemCardProps) => {
  const item = getItemDetails(activity);
  const basePriceCents = Number(item.price);

  const productsQuery = useMarketplace({});
  const { originalCents, finalCents, hasDiscount } = getActivityPricing(
    activity,
    productsQuery.data?.supplements,
  );
  const showFinalPriceCents = finalCents ?? basePriceCents;
  const showOriginalPriceCents = hasDiscount ? originalCents : null;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      aria-pressed={selected}
      className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm outline-none transition-all duration-200 hover:bg-zinc-50"
    >
      <AnimatedCheckbox
        checked={selected}
        className="size-5 rounded-md border border-transparent data-[state='unchecked']:border-zinc-200 data-[state='unchecked']:bg-zinc-100"
      />
      <div className="flex flex-1 items-center gap-3">
        {item.image && (
          <img
            src={item.image}
            alt={item.title}
            className="size-12 rounded-md object-cover"
          />
        )}
        <div className="flex-1 space-y-1">
          <Body1 className="font-medium">{item.title}</Body1>
          {activity.overview && (
            <Body2 className="leading-relaxed text-secondary">
              {activity.overview}
            </Body2>
          )}
        </div>
        {showFinalPriceCents > 0 && (
          <div className="flex items-center gap-2 text-right">
            {showOriginalPriceCents && (
              <Body2 className="text-zinc-500 line-through">
                {formatMoney(showOriginalPriceCents)}
              </Body2>
            )}
            {activity.type === 'prescription' ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5">
                      <Body2 className="font-semibold italic">
                        {formatMoney(showFinalPriceCents)}
                      </Body2>
                      <Info className="size-3.5 text-zinc-400" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This amount will be billed after approval</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Body2 className="font-semibold">
                {formatMoney(showFinalPriceCents)}
              </Body2>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
