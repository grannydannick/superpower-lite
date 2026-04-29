import { IconChecklist } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChecklist';
import { IconChevronTop } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronTop';
import { IconCircleInfo } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCircleInfo';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { Suspense, lazy } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner/spinner';
import { Body1, Body2 } from '@/components/ui/typography';
import { useCredits } from '@/features/orders/api/credits';
import { useServices } from '@/features/services/api';
import { CurrentPaymentMethodCard } from '@/features/users/components/payment';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';
import { getServiceImage } from '@/utils/service';

import {
  useAddOnPanelsCart,
  useAddOnPanelsCore,
  useAddOnPanelsDetail,
  useAddOnPanelsMarketplace,
} from './add-on-panels-context';
import { canAddOnItemToCart } from './add-on-panels-derived';
import {
  findGroupByItemId,
  findItemById,
  getCurrentRecommendation,
  getSelectedItems,
} from './add-on-panels-selectors';
import type { AddOnItem } from './api/add-on-panels';

const LazyAddOnPanelsDetailContent = lazy(
  () => import('./add-on-panels-detail-content'),
);

interface CartFooterProps {
  hidePaymentMethodCard?: boolean;
}

export const CartFooter = ({
  hidePaymentMethodCard = false,
}: CartFooterProps) => {
  const {
    addOnsData,
    cartTitle,
    flowContext,
    hasPaymentMethodId,
    isFlexSelected,
    isPending,
    isSelectingPaymentMethod,
    proceed,
    removeItemFromCart,
    selectedServiceIds,
    showRecommendations,
    skip,
  } = useAddOnPanelsCore();
  const { isCartExpanded, toggleCartExpanded } = useAddOnPanelsCart();
  const { goToNextRecommendation, recommendationIndex } =
    useAddOnPanelsMarketplace();

  const currentRecommendation = showRecommendations
    ? getCurrentRecommendation(addOnsData, recommendationIndex)
    : null;
  const selectedItems = getSelectedItems(addOnsData.groups, selectedServiceIds);
  const hasSelected = selectedItems.length > 0;
  const totalPrice = selectedItems.reduce((sum, i) => sum + i.price, 0);
  const tubeCount = selectedItems.reduce((sum, i) => sum + i.bloodTubeCount, 0);
  const needsMultipleAppointments =
    addOnsData.meta.coveredTubeCount + tubeCount >
    addOnsData.meta.multipleAppointmentThreshold;
  const shouldCheckRetestAdvance =
    flowContext === 'schedule_retest' && !hasSelected;
  const creditsQuery = useCredits({
    queryConfig: {
      enabled: shouldCheckRetestAdvance,
    },
  });
  const phlebotomyServicesQuery = useServices({
    group: 'phlebotomy',
    includeUnorderable: true,
    queryConfig: {
      enabled: shouldCheckRetestAdvance,
    },
  });
  let hasExistingPhlebotomyCredit = false;

  if (shouldCheckRetestAdvance) {
    const phlebotomyServiceIds = new Set<string>();

    for (const service of phlebotomyServicesQuery.data?.services ?? []) {
      phlebotomyServiceIds.add(service.id);
    }

    for (const credit of creditsQuery.data?.credits ?? []) {
      if (!phlebotomyServiceIds.has(credit.serviceId)) continue;

      hasExistingPhlebotomyCredit = true;
      break;
    }
  }

  const isCheckingRetestAdvance =
    shouldCheckRetestAdvance &&
    (creditsQuery.isLoading || phlebotomyServicesQuery.isLoading);
  const isRetestAdvanceBlocked =
    shouldCheckRetestAdvance &&
    (isCheckingRetestAdvance || !hasExistingPhlebotomyCredit);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 pb-8 pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white" />
      <div className="pointer-events-auto relative px-4 pt-4">
        <div className="mx-auto max-w-lg space-y-3">
          {hasSelected && (
            <div className="overflow-hidden rounded-[20px] bg-zinc-100 shadow-[0px_0px_1px_0px_rgba(0,0,0,0.33),0px_48px_48px_-24px_rgba(0,0,0,0.08)]">
              {needsMultipleAppointments && (
                <div className="flex items-center gap-1.5 px-4 py-2">
                  <IconCircleInfo className="size-4 shrink-0 text-zinc-500" />
                  <span className="text-xs tracking-wide text-zinc-500">
                    Test count requires two separate appointments
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={toggleCartExpanded}
                className="flex w-full items-center rounded-t-[20px] bg-white p-4"
              >
                <div className="flex flex-1 items-center gap-2">
                  <IconChecklist className="size-5 text-zinc-900" />
                  <span className="text-base text-zinc-900">
                    {cartTitle}{' '}
                    <span className="text-zinc-900/40">
                      {selectedItems.length}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Body2 className="text-zinc-900">
                    {formatMoney(totalPrice)}
                  </Body2>
                  <IconChevronTop
                    className={cn(
                      'size-4 text-zinc-900 transition-transform',
                      !isCartExpanded && 'rotate-180',
                    )}
                  />
                </div>
              </button>

              {isCartExpanded && (
                <div className="bg-white px-4 pb-4">
                  <div className="mb-4 h-px w-full rounded-sm bg-zinc-900/10" />
                  <div className="space-y-2">
                    {selectedItems.map((item) => (
                      <div key={item.id} className="flex h-8 items-center">
                        <div className="flex flex-1 items-center gap-2 overflow-hidden">
                          <div className="relative size-8 shrink-0 overflow-hidden rounded">
                            <img
                              src={getServiceImage(item.name)}
                              alt=""
                              className="size-full object-contain"
                            />
                            <div className="absolute bottom-0 left-0 h-3 w-full bg-gradient-to-b from-transparent to-white" />
                          </div>
                          <Body1 className="truncate text-black">
                            {item.name}
                          </Body1>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Body2 className="text-black">
                            {formatMoney(item.price)}
                          </Body2>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItemFromCart(item);
                            }}
                            className="text-zinc-400 hover:text-zinc-600"
                            aria-label={`Remove ${item.name}`}
                          >
                            <IconCrossMedium className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentRecommendation != null ? (
            <Button onClick={goToNextRecommendation} className="w-full">
              Next
            </Button>
          ) : (
            <>
              {hasSelected && (
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-out',
                    isSelectingPaymentMethod
                      ? 'max-h-[32rem] translate-y-0 opacity-100'
                      : hidePaymentMethodCard
                        ? 'pointer-events-none max-h-0 translate-y-2 opacity-0'
                        : 'max-h-28 translate-y-0 opacity-100',
                  )}
                >
                  <CurrentPaymentMethodCard />
                </div>
              )}
              <Button
                onClick={hasSelected ? proceed : skip}
                disabled={
                  isPending ||
                  isSelectingPaymentMethod ||
                  (hasSelected && !hasPaymentMethodId) ||
                  isRetestAdvanceBlocked
                }
                className="w-full"
              >
                {isPending && hasSelected ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" variant="light" />
                    <span>Processing purchase</span>
                  </span>
                ) : hasSelected ? (
                  <>
                    {`Confirm & pay${isFlexSelected ? ' with HSA/FSA' : ''}`}
                    <span className="ml-2 opacity-80">
                      {formatMoney(totalPrice)}
                    </span>
                  </>
                ) : (
                  'Skip additional testing'
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface DetailPanelSkeletonProps {
  onClose: () => void;
}

const DetailPanelSkeleton = ({ onClose }: DetailPanelSkeletonProps) => {
  return (
    <div className="flex h-full min-h-full flex-col overflow-hidden bg-white">
      <div className="space-y-6 px-8 py-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Close details"
          >
            <IconCrossMedium className="size-4" />
          </button>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
};

interface DetailPanelProps {
  itemId?: AddOnItem['id'] | null;
}

const DetailPanel = ({ itemId = null }: DetailPanelProps) => {
  const { addOnsData, applySelectionToggle, isPending, selectedServiceIds } =
    useAddOnPanelsCore();
  const { closeDetail, detailItemId } = useAddOnPanelsDetail();
  const currentItemId = itemId ?? detailItemId;

  if (currentItemId == null) return null;

  const group = findGroupByItemId(addOnsData.groups, currentItemId);
  const item = findItemById(addOnsData.groups, currentItemId);

  if (group == null || item == null) return null;

  const isSelected = selectedServiceIds.has(item.id);
  const isToggleDisabled = isPending || !canAddOnItemToCart(item);

  const onToggle = () => {
    applySelectionToggle(group, item, 'detail_sheet');
  };

  return (
    <Suspense fallback={<DetailPanelSkeleton onClose={closeDetail} />}>
      <LazyAddOnPanelsDetailContent
        item={item}
        isSelected={isSelected}
        isToggleDisabled={isToggleDisabled}
        onToggle={onToggle}
        onClose={closeDetail}
      />
    </Suspense>
  );
};

export const DetailSheet = () => {
  const { closeDetail, detailItemId } = useAddOnPanelsDetail();

  return (
    <Sheet
      open={detailItemId != null}
      onOpenChange={(open) => {
        if (!open) closeDetail();
      }}
    >
      <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
        <SheetTitle className="sr-only">Test details</SheetTitle>
        <DetailPanel />
      </SheetContent>
    </Sheet>
  );
};
