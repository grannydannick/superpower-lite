import type { ReactNode, Ref } from 'react';

import { Button } from '@/components/ui/button';
import {
  ADVANCED_UPGRADE_BUNDLE_IDS,
  type AdvancedUpgradeBundleId,
} from '@/const';
import type { OnboardingProduct } from '@/features/onboarding/api/onboarding-products';
import { cn } from '@/lib/utils';
import type { User } from '@/types/api';
import { formatMoney } from '@/utils/format-money';
import { getUpgradePrice } from '@/utils/get-upgrade-price';

import { BundleHeroImages } from './bundle-picker-hero-images';
import { IncludedAccordion } from './bundle-picker-included';
import {
  type BundleGenderCopyInput,
  getBundleMarketingCopy,
  getBundleUnlockCopy,
} from './bundle-picker-products';

const ADVANCED_MICROBIOME_BUNDLE_SAVINGS = 4900;
const COMPLETE_BUNDLE_SAVINGS = 19600;
const BUNDLE_SAVINGS_BY_ID: Partial<Record<AdvancedUpgradeBundleId, number>> = {
  [ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_MICROBIOME_BUNDLE]:
    ADVANCED_MICROBIOME_BUNDLE_SAVINGS,
  [ADVANCED_UPGRADE_BUNDLE_IDS.COMPLETE_BUNDLE]: COMPLETE_BUNDLE_SAVINGS,
};

interface BundleOptionCardsProps {
  user: User | undefined;
  productBySlug: Map<string, OnboardingProduct>;
  bundleOrder: AdvancedUpgradeBundleId[];
  selectedId: AdvancedUpgradeBundleId;
  disabled: boolean;
  productsPending: boolean;
  productsError: boolean;
  gender: BundleGenderCopyInput['gender'];
  onSelect: (id: AdvancedUpgradeBundleId, price: number) => void;
}

interface BundleMobileCompactSelectorProps {
  user: User | undefined;
  bundleOrder: AdvancedUpgradeBundleId[];
  selectedId: AdvancedUpgradeBundleId;
  disabled: boolean;
  gender: BundleGenderCopyInput['gender'];
  onSelect: (id: AdvancedUpgradeBundleId, price: number) => void;
  selectorRef?: Ref<HTMLDivElement>;
}

function DesktopBundlePrice({
  user,
  bundleId,
}: {
  user: User | undefined;
  bundleId: AdvancedUpgradeBundleId;
}) {
  const price = getUpgradePrice(user, bundleId);
  const savings = BUNDLE_SAVINGS_BY_ID[bundleId] ?? 0;
  const listPrice = price + savings;

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-end gap-1">
        <p className="text-3xl leading-none tracking-tight text-zinc-900">
          +{formatMoney(price)}
        </p>
        <p className="pb-0.5 text-sm text-zinc-900/40">/one time</p>
      </div>
      {savings > 0 ? (
        <p className="text-xs leading-4 tracking-wide text-vermillion-900">
          <span className="text-zinc-900/30 line-through">
            {formatMoney(listPrice)}
          </span>{' '}
          <span className="text-vermillion-900">
            Save {formatMoney(savings)}
          </span>
        </p>
      ) : (
        <p className="text-xs leading-4 tracking-wide text-vermillion-900">
          New member price
        </p>
      )}
    </div>
  );
}

function CompactMobileBundlePrice({
  user,
  bundleId,
}: {
  user: User | undefined;
  bundleId: AdvancedUpgradeBundleId;
}) {
  const price = getUpgradePrice(user, bundleId);
  const savings = BUNDLE_SAVINGS_BY_ID[bundleId] ?? 0;
  const listPrice = price + savings;

  return (
    <div className="mt-auto space-y-0.5 pt-3">
      <div className="flex flex-wrap items-baseline gap-0.5">
        <p className="text-base font-semibold leading-tight tracking-tight text-zinc-900">
          +{formatMoney(price)}
        </p>
      </div>
      {savings > 0 ? (
        <p className="text-[11px] leading-4 tracking-wide text-vermillion-900">
          <span className="text-zinc-900/30 line-through">
            {formatMoney(listPrice)}
          </span>{' '}
          <span className="text-vermillion-900">
            Save {formatMoney(savings)}
          </span>
        </p>
      ) : (
        <p className="text-[11px] leading-4 tracking-wide text-vermillion-900">
          New member price
        </p>
      )}
    </div>
  );
}

export function BundleDesktopCards({
  user,
  productBySlug,
  bundleOrder,
  selectedId,
  disabled,
  productsPending,
  productsError,
  gender,
  onSelect,
}: BundleOptionCardsProps) {
  const cards: ReactNode[] = [];

  for (const bundleId of bundleOrder) {
    const copy = getBundleMarketingCopy(bundleId, { gender });
    const unlockCopy = getBundleUnlockCopy(bundleId);
    const selected = bundleId === selectedId;
    const price = getUpgradePrice(user, bundleId);

    cards.push(
      <div
        key={bundleId}
        data-testid={`bundle-desktop-card-${copy.cardTitle
          .toLowerCase()
          .replaceAll(' ', '-')}`}
        className={cn(
          'relative row-span-4 grid min-w-0 grid-rows-subgrid gap-y-4 rounded-2xl border border-zinc-200 bg-white p-4 px-6 shadow-sm transition-colors duration-200 ease-out hover:border-vermillion-900/40',
          selected && 'border-vermillion-900 ring-2 ring-vermillion-900/20',
        )}
      >
        {copy.recommended === true && (
          <span className="absolute right-3 top-3 rounded-md bg-vermillion-100 px-2 py-0.5 text-xs font-medium text-vermillion-900">
            Recommended
          </span>
        )}

        <div className="flex flex-col gap-3">
          <BundleHeroImages
            bundleId={bundleId}
            productBySlug={productBySlug}
            size="desktop"
          />
          <p className="text-base text-zinc-900">{copy.cardTitle}</p>
          <DesktopBundlePrice user={user} bundleId={bundleId} />
        </div>

        <div className="flex flex-col">
          <div className="mb-4 h-px w-full bg-zinc-900/10" />
          <div className="space-y-2">
            <p className="text-sm text-zinc-900/40">What you'll unlock</p>
            <p className="text-sm leading-5 text-zinc-900/55">
              <span className="font-semibold text-zinc-900">
                {unlockCopy.lead}
              </span>{' '}
              {unlockCopy.body}
            </p>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-4 h-px w-full bg-zinc-900/10" />
          <p className="text-sm text-zinc-900/50">What’s included</p>
          <div
            data-testid="bundle-desktop-included-region"
            className="mt-2 min-w-0"
          >
            <IncludedAccordion
              bundleId={bundleId}
              productBySlug={productBySlug}
              isLoading={productsPending}
              isError={productsError}
              gender={gender}
            />
          </div>
        </div>

        <Button
          type="button"
          variant={selected ? 'default' : 'outline'}
          className={cn(
            'w-full self-end transition-all duration-200 ease-out',
            selected && 'bg-zinc-900 text-white hover:bg-zinc-900/90',
          )}
          disabled={disabled}
          onClick={() => onSelect(bundleId, price)}
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              width="19"
              height="19"
              viewBox="0 0 19 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
              className={cn(
                'transition-all duration-200 ease-out',
                selected
                  ? 'size-5 text-white opacity-100'
                  : 'size-0 text-transparent opacity-0',
              )}
            >
              <path
                d="M3.80859 9.38867L7.55859 13.1387L15.8086 4.88867"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 24,
                  strokeDashoffset: selected ? 0 : 24,
                  transition:
                    'stroke-dashoffset 300ms cubic-bezier(0.65, 0, 0.35, 1)',
                }}
              />
            </svg>
            {selected ? 'Selected' : 'Select'}
          </span>
        </Button>
      </div>,
    );
  }

  return <>{cards}</>;
}

export function BundleMobileCompactSelector({
  user,
  bundleOrder,
  selectedId,
  disabled,
  gender,
  onSelect,
  selectorRef,
}: BundleMobileCompactSelectorProps) {
  const buttons: ReactNode[] = [];

  for (const bundleId of bundleOrder) {
    const copy = getBundleMarketingCopy(bundleId, { gender });
    const selected = bundleId === selectedId;
    const price = getUpgradePrice(user, bundleId);
    const showRecommendedPill = copy.recommended === true;

    buttons.push(
      <div
        key={bundleId}
        className={cn(
          'relative flex min-w-0 flex-[1_0_0] flex-col',
          showRecommendedPill ? 'min-w-[108px]' : 'min-w-[100px]',
        )}
      >
        <button
          type="button"
          data-bundle-id={bundleId}
          onClick={() => {
            if (bundleId !== selectedId) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            onSelect(bundleId, price);
          }}
          disabled={disabled}
          aria-pressed={selected}
          className={cn(
            'relative flex h-full min-h-[132px] w-full flex-col rounded-2xl border bg-white p-3 text-left transition-all duration-200 ease-out active:scale-[0.99]',
            showRecommendedPill && 'pt-5',
            selected
              ? 'border-vermillion-900 shadow-sm ring-2 ring-vermillion-900/20'
              : 'border-zinc-200 shadow-sm',
            disabled && 'cursor-not-allowed opacity-60 active:scale-100',
          )}
        >
          {showRecommendedPill ? (
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-vermillion-900 px-2.5 py-0.5 text-[10px] font-medium leading-4 text-white shadow-sm"
            >
              Recommended
            </span>
          ) : null}
          <p className="text-sm font-medium leading-5 text-zinc-900">
            {copy.cardTitle}
          </p>
          <CompactMobileBundlePrice user={user} bundleId={bundleId} />
        </button>
      </div>,
    );
  }

  return (
    <div className="w-full min-w-0">
      <div
        ref={selectorRef}
        data-testid="bundle-mobile-compact-selector"
        className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {buttons}
      </div>
    </div>
  );
}
