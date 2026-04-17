import { IconCheckCircle2 } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconCheckCircle2';
import { IconCheckmark1 } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconCheckmark1';
import { IconSparkle } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconSparkle';
import { IconChevronLeft } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronLeft';
import { IconChevronRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronRight';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconLock } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLock';
import { IconMagnifyingGlass } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMagnifyingGlass';
import { type UIEvent, useRef } from 'react';

import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselMainContainer,
  useCarousel,
} from '@/components/ui/carousel';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2, Body3, H2, H3 } from '@/components/ui/typography';
import type {
  AddOnGroup,
  AddOnItem,
} from '@/features/onboarding/api/onboarding-add-ons';
import { hasPanelDetailContent } from '@/features/onboarding/data/panel-detail-content-ids';
import { useOnboardingCartStore } from '@/features/onboarding/stores/onboarding-cart-store';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';
import { getServiceImage } from '@/utils/service';

import { useAddOnPanelsStep } from './add-on-panels-context';
import { CartFooter } from './add-on-panels-overlays';
import { useSupplementaryControlsVisibility } from './add-on-panels-scroll-visibility';
import {
  findGroupByItemId,
  getCurrentRecommendation,
  getFilteredGroups,
  getGroupItems,
  getMarketplaceGroups,
  getPurchasedItems,
} from './add-on-panels-selectors';

export const TEST_CARD_SKELETON_KEYS: string[] = [
  'test-card-skeleton-1',
  'test-card-skeleton-2',
  'test-card-skeleton-3',
  'test-card-skeleton-4',
  'test-card-skeleton-5',
];

const GROUP_TUBE_IMAGES: Record<string, string> = {
  autoimmunity: '/onboarding/upsell/tubes/partial/autoimmune-panel.png',
  'heart-health': '/onboarding/upsell/tubes/partial/cardiovascular-panel.png',
  'vitamins-minerals': '/onboarding/upsell/tubes/partial/nutrient-panel.png',
  methylation: '/onboarding/upsell/tubes/partial/methylation-panel.png',
  'blood-panels': '/onboarding/upsell/tubes/partial/baseline-panel.png',
  'organ-age': '/onboarding/upsell/tubes/partial/organ-age-panel.png',
  metabolic: '/onboarding/upsell/tubes/partial/metabolic-panel.png',
  'mens-health': '/onboarding/upsell/tubes/partial/advanced-panel.png',
  alzheimers: '/onboarding/upsell/tubes/partial/advanced-panel.png',
};

function getAddOnImage(groupId: string, itemName: string): string {
  return GROUP_TUBE_IMAGES[groupId] ?? getServiceImage(itemName);
}

function getGroupHeroItem(group: AddOnGroup): AddOnItem | null {
  return getGroupItems(group)[0] ?? null;
}

function getBundleOriginalPrice(group: AddOnGroup): number | null {
  if (
    group.selection.type !== 'bundle-or-components' ||
    group.selection.bundle == null ||
    group.selection.components.length === 0
  ) {
    return null;
  }

  return group.selection.components.reduce((sum, component) => {
    return sum + component.price;
  }, 0);
}

function getItemBadgeLabel(item: AddOnItem): string | null {
  if (item.status === 'purchased') return 'Purchased';
  if (item.status === 'included') return 'Included';
  if (item.isRecommended && item.kind !== 'complete-panel') {
    return 'Recommended';
  }

  return null;
}

function getItemBadgeTone(
  item: AddOnItem,
): 'included' | 'purchased' | 'recommended' {
  if (item.status === 'included') return 'included';
  if (item.status === 'purchased') return 'purchased';
  if (item.isRecommended && item.status === 'available') return 'recommended';

  return 'included';
}

const ExploreTestsSearch = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchQuery, setSearchQuery } = useAddOnPanelsStep();

  return (
    <div className="relative min-w-0">
      <IconMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
      <Input
        ref={inputRef}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search"
        className="h-11 rounded-full border-none bg-zinc-100 pl-11 pr-10 font-normal text-primary shadow-none outline-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-100"
      />
      {searchQuery.trim().length > 0 && (
        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 hover:text-primary"
          aria-label="Clear search"
        >
          <IconCrossMedium className="size-4" />
        </button>
      )}
    </div>
  );
};

const FilterPillsContent = () => {
  const { activeFilterId, filterOptions, setActiveFilterId } =
    useAddOnPanelsStep();
  const { canScrollPrev, canScrollNext, scrollPrev, scrollNext } =
    useCarousel();

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      <button
        type="button"
        onClick={scrollPrev}
        className={cn(
          'absolute left-0 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-all duration-200',
          canScrollPrev
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-75 opacity-0',
        )}
        aria-label="Scroll filters left"
      >
        <IconChevronLeft className="size-4" />
      </button>
      <CarouselMainContainer
        role="group"
        aria-label="Filter options"
        className="w-full min-w-0 gap-2 px-0 pb-1"
      >
        {filterOptions.map((opt) => (
          <Button
            key={opt.id}
            type="button"
            size="small"
            variant={opt.id === activeFilterId ? 'default' : 'outline'}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full border shadow-none',
              opt.id === activeFilterId
                ? 'border-primary'
                : 'border-zinc-200 text-secondary',
            )}
            onClick={() => setActiveFilterId(opt.id)}
          >
            {opt.label}
          </Button>
        ))}
      </CarouselMainContainer>
      <button
        type="button"
        onClick={scrollNext}
        className={cn(
          'absolute right-0 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-all duration-200',
          canScrollNext
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-75 opacity-0',
        )}
        aria-label="Scroll filters right"
      >
        <IconChevronRight className="size-4" />
      </button>
    </div>
  );
};

const FilterPills = () => {
  return (
    <Carousel
      className="w-full min-w-0 max-w-full"
      carouselOptions={{
        align: 'start',
        containScroll: 'trimSnaps',
        dragFree: true,
      }}
    >
      <FilterPillsContent />
    </Carousel>
  );
};

const ItemBadge = ({
  label,
  tone,
}: {
  label: string;
  tone: 'included' | 'purchased' | 'recommended';
}) => {
  if (label == null) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded border px-1.5 text-[11px] font-normal leading-5 tracking-wide',
        tone === 'recommended'
          ? 'border-[#fc5f2b]/10 bg-[#fc5f2b]/10 text-[#fc5f2b]'
          : tone === 'purchased'
            ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
            : 'border-zinc-200 bg-zinc-50 text-zinc-600',
      )}
    >
      {tone === 'recommended' ? (
        <IconSparkle className="size-3 shrink-0" />
      ) : tone === 'purchased' || tone === 'included' ? (
        <IconCheckCircle2 className="size-3 shrink-0" />
      ) : null}
      {label}
    </span>
  );
};

interface TestCardProps {
  item: AddOnItem;
  isSelected: boolean;
  includedByBundle?: boolean;
  onToggle: () => void;
  disabled?: boolean;
  originalPrice: number | null;
}

const TestCard = ({
  item,
  isSelected,
  includedByBundle = false,
  onToggle,
  disabled,
  originalPrice,
}: TestCardProps) => {
  const { openDetail } = useAddOnPanelsStep();
  const isLocked = item.status !== 'available';
  const showLearnMore = !isLocked && hasPanelDetailContent(item.id);
  const displayName =
    item.kind === 'complete-panel' ? 'Add the complete panel' : item.name;
  const badgeLabel = getItemBadgeLabel(item);
  const hasRecommendationReason =
    item.status === 'available' &&
    item.kind !== 'complete-panel' &&
    item.recommendation?.reason != null &&
    item.recommendation.reason.trim().length > 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!disabled && item.status === 'available') onToggle();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!disabled && item.status === 'available') onToggle();
        }
      }}
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-white transition-colors',
        isSelected && !isLocked
          ? 'border-vermillion-900 ring-2 ring-vermillion-900/20'
          : includedByBundle
            ? 'border-vermillion-900/40 ring-1 ring-vermillion-900/10'
            : 'border-zinc-200 shadow-sm',
        !disabled && 'hover:border-vermillion-900/40',
        disabled ? 'opacity-50' : 'cursor-pointer',
      )}
    >
      <div
        className={cn(
          'absolute left-4 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-md shadow-[0px_0px_1px_0px_rgba(0,0,0,0.33),0px_1px_2px_0px_rgba(0,0,0,0.08)] transition-colors duration-200 ease-out',
          isSelected && !isLocked
            ? 'bg-vermillion-900'
            : includedByBundle
              ? 'bg-vermillion-900/30'
              : 'bg-white',
        )}
      >
        {item.status === 'included' ? (
          <IconCheckmark1 className="size-3.5 text-zinc-400" />
        ) : isLocked ? (
          <IconLock className="size-3 text-zinc-400" />
        ) : item.status === 'available' ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 19 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
            className="text-white"
          >
            <path
              d="M3.80859 9.38867L7.55859 13.1387L15.8086 4.88867"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: isSelected || includedByBundle ? 0 : 24,
                transition:
                  'stroke-dashoffset 300ms cubic-bezier(0.65, 0, 0.35, 1)',
              }}
            />
          </svg>
        ) : null}
      </div>

      <div
        className={cn(
          'flex w-full items-start pl-[3.25rem] pr-4 pt-5 text-left',
          showLearnMore || hasRecommendationReason ? 'pb-3' : 'pb-5',
        )}
      >
        <div className="flex flex-1 flex-col items-start gap-3">
          <div className="flex w-full items-start gap-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
              <Body1 className="text-zinc-900">{displayName}</Body1>
              {badgeLabel != null && (
                <ItemBadge label={badgeLabel} tone={getItemBadgeTone(item)} />
              )}
            </div>
            {!isLocked && (
              <div className="flex shrink-0 items-center gap-2">
                {originalPrice != null && (
                  <span className="text-base leading-[22px] text-zinc-400 line-through">
                    {formatMoney(originalPrice)}
                  </span>
                )}
                <Body1 className="text-zinc-900">
                  {formatMoney(item.price)}
                </Body1>
              </div>
            )}
          </div>
          {!hasRecommendationReason &&
            item.description != null &&
            item.description.trim().length > 0 && (
              <Body2 className="text-left text-zinc-500">
                {item.description}
              </Body2>
            )}
        </div>
      </div>

      {hasRecommendationReason && (
        <div className="space-y-3 px-4 pb-5 pl-[3.25rem]">
          <div className="space-y-1.5">
            <Body3 className="font-medium text-zinc-500">
              Why we recommend this test
            </Body3>
            <Body2 className="text-left text-zinc-400">
              {item.recommendation!.reason}
            </Body2>
          </div>
          {item.recommendation!.rationale.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
              {[
                ...new Map(
                  item.recommendation!.rationale.map((r) => [r.label, r]),
                ).values(),
              ].map((r) => (
                <span
                  key={r.label}
                  className="inline-flex items-center gap-1 text-[13px] leading-5 text-zinc-500"
                >
                  <IconSparkle className="size-3 shrink-0 text-vermillion-900" />
                  {r.label}
                </span>
              ))}
            </div>
          )}
          {showLearnMore && (
            <div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openDetail(item.id);
                }}
                className="flex items-center gap-1 text-sm text-zinc-900/50 hover:text-zinc-900/70"
              >
                <span>Learn more</span>
                <IconChevronRight className="size-[15px]" />
              </button>
            </div>
          )}
        </div>
      )}

      {!hasRecommendationReason && showLearnMore && (
        <div className="pb-5 pl-[3.25rem] pr-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openDetail(item.id);
            }}
            className="flex items-center gap-1 text-sm text-zinc-900/50 hover:text-zinc-900/70"
          >
            <span>Learn more</span>
            <IconChevronRight className="size-[15px]" />
          </button>
        </div>
      )}
    </div>
  );
};

export const TestCardSkeleton = () => (
  <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 px-4 py-5">
    <Skeleton className="size-5 shrink-0 rounded-md" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-20" />
    </div>
    <Skeleton className="h-5 w-12 shrink-0" />
  </div>
);

const GroupSectionHeader = ({ group }: { group: AddOnGroup }) => {
  const heroItem = getGroupHeroItem(group);

  if (heroItem == null) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 pb-1 pt-5 first:pt-1">
      <div className="relative size-10 shrink-0 overflow-hidden rounded-md">
        <img
          src={getAddOnImage(group.id, heroItem.name)}
          alt=""
          className="size-full object-contain"
        />
        <div className="absolute bottom-0 left-0 h-4 w-full bg-gradient-to-b from-transparent to-white" />
      </div>
      <H3 className="text-[22px] font-normal tracking-tight text-zinc-900">
        {group.label}
      </H3>
    </div>
  );
};

const GroupSectionItems = ({ group }: { group: AddOnGroup }) => {
  const { isPending, addOnsData, applySelectionToggle } = useAddOnPanelsStep();
  const selectedServiceIds = useOnboardingCartStore(
    (s) => s.selectedServiceIds,
  );
  const originalPrice = getBundleOriginalPrice(group);

  const bundleSelected =
    group.selection.type === 'bundle-or-components' &&
    group.selection.bundle != null &&
    selectedServiceIds.has(group.selection.bundle.id);

  const renderItem = (item: AddOnItem, isBundle: boolean) => {
    const toggle = () => {
      if (item.status !== 'available') return;
      // The `group` here may be search-filtered (missing components that don't
      // match the query), which would cause `computeToggle`'s sibling check to
      // misfire. Always toggle against the original unfiltered group.
      let sourceGroup: AddOnGroup = group;
      for (const g of addOnsData.groups) {
        if (g.id === group.id) {
          sourceGroup = g;
          break;
        }
      }
      applySelectionToggle(sourceGroup, item, 'card');
    };

    return (
      <TestCard
        key={item.id}
        item={item}
        isSelected={selectedServiceIds.has(item.id)}
        includedByBundle={!isBundle && bundleSelected}
        onToggle={toggle}
        disabled={isPending || item.status !== 'available'}
        originalPrice={isBundle ? originalPrice : null}
      />
    );
  };

  return (
    <>
      {group.selection.type === 'bundle-or-components' ? (
        <>
          {group.selection.bundle != null &&
            renderItem(group.selection.bundle, true)}
          {group.selection.bundle != null &&
            group.selection.components.length > 0 && (
              <div className="flex items-center gap-2.5">
                <div className="h-px flex-1 border-t border-zinc-900/10" />
                <span className="text-xs text-zinc-900/40">
                  or add individual markers
                </span>
                <div className="h-px flex-1 border-t border-zinc-900/10" />
              </div>
            )}
          {group.selection.components.map((component) => {
            return renderItem(component, false);
          })}
        </>
      ) : (
        group.selection.items.map((item) => renderItem(item, false))
      )}
    </>
  );
};

const MarketplaceGroupSection = ({ group }: { group: AddOnGroup }) => {
  return (
    <>
      <GroupSectionHeader group={group} />
      <GroupSectionItems group={group} />
    </>
  );
};

const PurchasedPanelRow = ({
  name,
  groupId,
}: {
  name: string;
  groupId: string;
}) => (
  <div className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3">
    <div className="relative size-8 shrink-0 overflow-hidden rounded-md opacity-40">
      <img
        src={getAddOnImage(groupId, name)}
        alt=""
        className="size-full object-contain"
      />
      <div className="absolute bottom-0 left-0 h-3 w-full bg-gradient-to-b from-transparent to-white" />
    </div>
    <Body1 className="min-w-0 truncate text-zinc-900">{name}</Body1>
    <ItemBadge label="Purchased" tone="purchased" />
  </div>
);

const RecommendationGroupSection = ({ group }: { group: AddOnGroup }) => {
  return <GroupSectionItems group={group} />;
};

export const RecommendationView = () => {
  const { addOnsData, recommendationIndex } = useAddOnPanelsStep();
  const currentRec = getCurrentRecommendation(addOnsData, recommendationIndex);

  if (currentRec == null) return null;

  const heroItem = getGroupHeroItem(currentRec);

  return (
    <div className="mx-auto max-w-lg py-6">
      <div className="space-y-4">
        {heroItem != null && (
          <div className="flex items-center gap-3">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-md">
              <img
                src={getAddOnImage(currentRec.id, heroItem.name)}
                alt=""
                className="size-full object-contain"
              />
              <div className="absolute bottom-0 left-0 h-4 w-full bg-gradient-to-b from-transparent to-white" />
            </div>
            <H2>{currentRec.label}</H2>
          </div>
        )}
      </div>
      <div className="pt-4">
        <div className="space-y-3">
          <RecommendationGroupSection group={currentRec} />
        </div>
      </div>
    </div>
  );
};

interface MarketplaceHeaderProps {
  areFiltersHidden: boolean;
}

const MarketplaceHeader = ({ areFiltersHidden }: MarketplaceHeaderProps) => (
  <div className="shrink-0 bg-white pb-4">
    <div className="mx-auto max-w-lg px-4 pt-6">
      <div className="space-y-6">
        <H2>Explore Tests</H2>
        <div className="relative z-10 bg-white">
          <ExploreTestsSearch />
        </div>
      </div>
      <div
        className={cn(
          'relative z-0 overflow-hidden transition-all duration-300 ease-out',
          areFiltersHidden
            ? 'pointer-events-none max-h-0 -translate-y-2 opacity-0'
            : 'mt-6 max-h-16 translate-y-0 opacity-100',
        )}
      >
        <FilterPills />
      </div>
    </div>
  </div>
);

interface MarketplaceListProps {
  bottomPaddingClass: string;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
}

const MarketplaceList = ({
  bottomPaddingClass,
  onScroll,
}: MarketplaceListProps) => {
  const { activeFilterId, addOnsData, searchQuery } = useAddOnPanelsStep();
  const purchasedItems = getPurchasedItems(addOnsData.groups);
  const marketplaceGroups = getMarketplaceGroups(addOnsData.groups);
  const filtered = getFilteredGroups(
    marketplaceGroups,
    activeFilterId,
    searchQuery,
  );

  return (
    <div
      onScroll={onScroll}
      className={cn('min-h-0 flex-1 overflow-y-auto px-4', bottomPaddingClass)}
    >
      <div className="mx-auto max-w-lg pt-2">
        <div className="space-y-3">
          {purchasedItems.map((item) => {
            const group = findGroupByItemId(addOnsData.groups, item.id);

            return (
              <PurchasedPanelRow
                key={item.id}
                name={item.name}
                groupId={group?.id ?? ''}
              />
            );
          })}
          {filtered.length === 0 ? (
            <div className="py-8 text-center">
              <Body1 className="text-zinc-500">
                No tests found matching your search.
              </Body1>
            </div>
          ) : (
            filtered.map((group) => (
              <MarketplaceGroupSection key={group.id} group={group} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface MarketplaceScreenProps {
  bottomPaddingClass: string;
}

export const MarketplaceScreen = ({
  bottomPaddingClass,
}: MarketplaceScreenProps) => {
  const { areSupplementaryControlsHidden, handleScroll } =
    useSupplementaryControlsVisibility();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MarketplaceHeader areFiltersHidden={areSupplementaryControlsHidden} />
      <MarketplaceList
        bottomPaddingClass={bottomPaddingClass}
        onScroll={handleScroll}
      />
      <CartFooter hidePaymentMethodCard={areSupplementaryControlsHidden} />
    </div>
  );
};
