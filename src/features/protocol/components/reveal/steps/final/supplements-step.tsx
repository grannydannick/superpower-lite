import { IconCheckCircle2 } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconCheckCircle2';
import { m } from 'framer-motion';
import { ChevronRight, Minus, Plus } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import NumberFlow from '@/components/shared/number-flow';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import { ProtocolMarkdown } from '@/features/protocol/components/protocol-markdown';
import { useProtocolStepperContext } from '@/features/protocol/components/reveal/protocol-stepper-context';
import {
  useSupplementCart,
  MAX_SUPPLEMENT_QUANTITY,
} from '@/features/protocol/hooks/use-supplement-cart';
import {
  useSupplementGroups,
  type SupplementDisplayItem,
} from '@/features/protocol/hooks/use-supplement-groups';
import { useAnalytics } from '@/hooks/use-analytics';

import { ProtocolStepLayout } from '../../../layouts/protocol-step-layout';

type SupplementCardProps = {
  item: SupplementDisplayItem;
  quantity: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  index: number;
};

const SupplementCard = ({
  item,
  quantity,
  onIncrement,
  onDecrement,
  index,
}: SupplementCardProps) => {
  const { track } = useAnalytics();

  const productMeta = useMemo(
    () => ({
      product_id: item.product.id,
      product_name: item.product.name,
      product_price: item.product.price,
      discounted_price: item.product.price * (1 - item.product.discount / 100),
      product_url: item.product.url,
      action_id: item.actionId,
    }),
    [item.product, item.actionId],
  );

  const handleAmazonClick = useCallback(() => {
    track('protocol_reveal_supplement_amazon_viewed', {
      ...productMeta,
      amazon_price: item.amazonPrice,
      amazon_url: item.amazonUrl,
    });
    window.open(item.amazonUrl!, '_blank', 'noopener');
  }, [track, productMeta, item.amazonPrice, item.amazonUrl]);

  const { product } = item;
  const discountedPrice = product.price * (1 - product.discount / 100);

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      className="rounded-2xl border border-zinc-200 bg-white shadow shadow-black/[.03]"
    >
      <div className="p-4">
        {/* Header: product name + image */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="text-base font-semibold text-zinc-900">
            {product.name}
          </span>
          <img
            src={product.image ?? '/protocol/decision/empty.webp'}
            alt={product.name}
            className="size-12 shrink-0 rounded-lg object-cover"
          />
        </div>

        {/* Superpower + Amazon pricing grid */}
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3">
          {/* Superpower row */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-900">
              Superpower
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-vermillion-900">
                ${discountedPrice.toFixed(0)}
              </span>
              {product.discount > 0 && (
                <span className="text-sm text-zinc-400 line-through">
                  ${product.price.toFixed(0)}
                </span>
              )}
            </div>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center rounded-lg border border-zinc-200">
            <button
              type="button"
              className="flex size-8 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-700 disabled:opacity-30"
              onClick={() => onDecrement(item.actionId)}
              disabled={quantity <= 0}
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-medium tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              className="flex size-8 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-700 disabled:opacity-30"
              onClick={() => onIncrement(item.actionId)}
              disabled={quantity >= MAX_SUPPLEMENT_QUANTITY}
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {/* Amazon row — price aligns under Superpower prices */}
          {item.amazonPrice != null && item.amazonUrl != null && (
            <>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm text-secondary transition-colors hover:text-zinc-700"
                  onClick={handleAmazonClick}
                >
                  View on Amazon
                  <ChevronRight className="size-3.5" />
                </button>
                <span className="text-sm text-secondary">
                  ${item.amazonPrice.toFixed(0)}
                </span>
              </div>
              {/* Empty cell to keep grid alignment */}
              <div />
            </>
          )}
        </div>
      </div>

      {/* Why we recommend accordion */}
      {item.whyContent && (
        <Accordion type="single" collapsible>
          <AccordionItem value="why" className="border-b-0 border-t">
            <AccordionTrigger className="px-4 py-3 text-sm font-medium">
              Why we recommend this for you?
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <ProtocolMarkdown
                content={item.whyContent}
                className="text-sm text-secondary [&>div]:mb-0"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </m.div>
  );
};

export const SupplementsStep = () => {
  const { next, protocol, saveShopifyOrder } = useProtocolStepperContext();
  const { track } = useAnalytics();
  const { goalGroups, allItems, isLoading } = useSupplementGroups(
    protocol ?? undefined,
  );
  const {
    getQuantity,
    increment,
    decrement,
    totalOriginal,
    totalDiscounted,
    selectedCount,
    shipping,
    isCheckingOut,
    checkout,
  } = useSupplementCart(allItems);

  const handlePurchase = useCallback(() => {
    checkout({ saveShopifyOrder, onComplete: next });
  }, [checkout, saveShopifyOrder, next]);

  const handleSkip = useCallback(() => {
    track('protocol_reveal_supplement_no_thanks_clicked', {
      total_supplements_available: allItems.length,
      selected_count: selectedCount,
    });
    next();
  }, [next, track, allItems.length, selectedCount]);

  if (isLoading) {
    return (
      <ProtocolStepLayout>
        <div className="flex items-center justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        </div>
      </ProtocolStepLayout>
    );
  }

  const hasSelectedSupplements = selectedCount > 0;

  const groupOffsets: number[] = [];
  let offset = 0;
  for (const group of goalGroups) {
    groupOffsets.push(offset);
    offset += group.items.length;
  }

  return (
    <ProtocolStepLayout>
      <m.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto w-full max-w-2xl"
      >
        <div className="mb-8">
          <H2 className="mb-2">
            Let&apos;s help you source the right supplements
          </H2>
          <Body1 className="text-secondary">
            These specific supplements have been curated and verified by
            Superpower. You can source different brands with your own research.
          </Body1>
        </div>

        <div className="space-y-8">
          {goalGroups.map((group, groupIdx) => (
            <div key={group.goalId} className="space-y-4">
              {/* Goal section title */}
              <div className="flex items-start gap-3">
                <IconCheckCircle2 className="mt-0.5 size-5 shrink-0 text-vermillion-900" />
                <span className="text-base font-semibold text-zinc-900">
                  {group.goalTitle}
                </span>
              </div>

              {/* Supplement cards for this goal */}
              {group.items.map((item, itemIdx) => (
                <SupplementCard
                  key={item.actionId}
                  item={item}
                  quantity={getQuantity(item.actionId)}
                  onIncrement={increment}
                  onDecrement={decrement}
                  index={groupOffsets[groupIdx] + itemIdx}
                />
              ))}
            </div>
          ))}
        </div>

        <hr className="mt-8 border-zinc-200" />

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">Shipping</span>
            <span className="font-medium text-vermillion-900">
              {shipping.isFree ? (
                'FREE'
              ) : (
                <NumberFlow prefix="$" value={shipping.shippingCents / 100} />
              )}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <span className="text-sm text-secondary">Total</span>
              {hasSelectedSupplements && (
                <Badge
                  variant="vermillion"
                  className="rounded-sm bg-vermillion-900/10 text-xs"
                >
                  20% member discount
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {totalOriginal !== totalDiscounted && hasSelectedSupplements && (
                <span className="text-sm text-zinc-400 line-through">
                  <NumberFlow
                    value={(totalOriginal + shipping.shippingCents) / 100}
                    prefix="$"
                    format={{
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                  />
                </span>
              )}
              <span className="text-base font-bold text-vermillion-900">
                <NumberFlow
                  value={shipping.totalWithShipping / 100}
                  prefix="$"
                  format={{
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }}
                />
              </span>
            </div>
          </div>
        </div>
      </m.div>

      <div className="flex flex-col items-center gap-3">
        <Button
          className="w-full gap-2"
          onClick={handlePurchase}
          disabled={!hasSelectedSupplements || isCheckingOut}
        >
          {isCheckingOut ? 'Creating checkout...' : 'Purchase now'}
          {!isCheckingOut && hasSelectedSupplements && (
            <span className="text-zinc-500">
              <NumberFlow
                value={shipping.totalWithShipping / 100}
                prefix="$"
                format={{
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }}
              />
            </span>
          )}
        </Button>
        <button
          type="button"
          className="text-sm text-secondary transition-colors hover:text-zinc-700 disabled:opacity-50"
          onClick={handleSkip}
          disabled={isCheckingOut}
        >
          Skip for now
        </button>
      </div>
    </ProtocolStepLayout>
  );
};
