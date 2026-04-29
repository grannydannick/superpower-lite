import { IconCheckmark1 } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconCheckmark1';
import { IconSparkle } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconSparkle';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconPlusSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusSmall';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import { MarketplaceProductMarkdownBody } from '@/features/marketplace/pages/product-page/components/product-markdown-body';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';

import { useAddOnPanelsCore } from './add-on-panels-context';
import {
  canAddOnItemToCart,
  getAddOnItemPresentation,
} from './add-on-panels-derived';
import type { AddOnItem, AddOnProductDetails } from './api/add-on-panels';

export const AddOnPanelsDetail = ({
  item,
  productDetails,
  isSelected,
  isToggleDisabled,
  onToggle,
  onClose,
  className,
}: {
  item: AddOnItem;
  productDetails: AddOnProductDetails;
  isSelected: boolean;
  isToggleDisabled: boolean;
  onToggle: () => void;
  onClose: () => void;
  className?: string;
}) => {
  const isLocked = !canAddOnItemToCart(item);
  const { showRecommendations } = useAddOnPanelsCore();
  const presentation = getAddOnItemPresentation(item, {
    recommendedBadgeLabel: showRecommendations
      ? 'Recommended'
      : 'Recommended add-on',
  });

  const contentTrimmed = productDetails.content?.trim() ?? '';
  const descriptionTrimmed = productDetails.description?.trim() ?? '';
  const detailMarkdown =
    contentTrimmed.length > 0 ? contentTrimmed : descriptionTrimmed;
  const introFromProduct = productDetails.shortDescription?.trim() ?? '';
  const introFromItem = item.description?.trim() ?? '';
  const introText =
    introFromProduct.length > 0 ? introFromProduct : introFromItem;

  const biomarkerChips: ReactNode[] = [];
  for (const b of productDetails.biomarkers) {
    if (b.hidden === true) {
      continue;
    }
    const label = b.title.trim().length > 0 ? b.title.trim() : b.name.trim();
    if (label.length === 0) {
      continue;
    }
    biomarkerChips.push(
      <span
        key={b.id}
        className="inline-flex items-center gap-2 rounded-full bg-[#fc5f2b]/10 px-4 py-2 text-sm font-medium text-[#fc5f2b]"
      >
        <span className="size-2 shrink-0 rounded-full bg-[#fc5f2b]" />
        {label}
      </span>,
    );
  }

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
            {presentation.badge?.tone === 'recommended' && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded bg-[#fc5f2b]/10 px-1 text-[11px] font-normal leading-5 tracking-wide text-[#fc5f2b]">
                <IconSparkle className="size-3 shrink-0" />
                {presentation.badge.label}
              </span>
            )}
          </div>
          {introText.length > 0 && (
            <Body1 className="text-zinc-500">{introText}</Body1>
          )}
        </div>

        <MarketplaceProductMarkdownBody markdown={detailMarkdown} />

        {biomarkerChips.length > 0 && (
          <div className="mt-8 space-y-3">
            <Body1 className="font-medium text-zinc-900">
              Included biomarkers
            </Body1>
            <div className="flex flex-wrap gap-2">{biomarkerChips}</div>
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
