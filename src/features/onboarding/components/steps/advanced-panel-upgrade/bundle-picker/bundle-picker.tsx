import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { toast } from '@/components/ui/sonner';
import {
  ADVANCED_UPGRADE_BUNDLE_IDS,
  type AdvancedUpgradeBundleId,
} from '@/const';
import {
  BUNDLE_PICKER_PRODUCT_SLUGS,
  type OnboardingProduct,
  useOnboardingProducts,
} from '@/features/onboarding/api/onboarding-products';
import { useUpgradeCredit } from '@/features/orders/api';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { useAnalytics } from '@/hooks/use-analytics';
import { useGender } from '@/hooks/use-gender';
import { useUser } from '@/lib/auth';
import { getUpgradePrice } from '@/utils/get-upgrade-price';

import { useOnboardingAnalytics } from '../../../../hooks/use-onboarding-analytics';
import { useOnboardingNavigation } from '../../../../hooks/use-onboarding-navigation';
import { Sequence } from '../../../sequence';

import { BundlePickerDesktopFooter } from './bundle-picker-desktop-footer';
import { BundlePickerHeader } from './bundle-picker-header';
import { BundleHeroImages } from './bundle-picker-hero-images';
import { IncludedAccordion } from './bundle-picker-included';
import { BundlePickerMobileFooter } from './bundle-picker-mobile-footer';
import { BundleDesktopCards } from './bundle-picker-options';
import {
  getAvailableBundleOrder,
  getBundleMarketingCopy,
  getBundleUnlockCopy,
  productsResponseToMap,
} from './bundle-picker-products';
import type { BundlePickerPurchaseInteraction } from './bundle-picker-purchase-interaction';

const DEFAULT_BUNDLE_ID = ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_UPGRADE;
const MOBILE_DEFAULT_BUNDLE_ID =
  ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_MICROBIOME_BUNDLE;

function getInitialBundleId() {
  if (typeof window === 'undefined') {
    return DEFAULT_BUNDLE_ID;
  }

  if (window.matchMedia('(max-width: 767px)').matches) {
    return MOBILE_DEFAULT_BUNDLE_ID;
  }

  return DEFAULT_BUNDLE_ID;
}

export const BundlePicker = ({ variant }: { variant: string }) => {
  const { data: user } = useUser();
  const { next } = useOnboardingNavigation();
  const { trackOnboardingCreditPurchase } = useOnboardingAnalytics();
  const { track } = useAnalytics();
  const { gender } = useGender();
  const { activePaymentMethod, isFlexSelected, isSelectingPaymentMethod } =
    usePaymentMethodSelection();
  const upgradeOrderMutation = useUpgradeCredit();
  const mobileSelectorRef = useRef<HTMLDivElement>(null);

  const [selectedId, setSelectedId] =
    useState<AdvancedUpgradeBundleId>(getInitialBundleId);
  const [isConfirmingPurchase, setIsConfirmingPurchase] = useState(false);

  const productsQuery = useOnboardingProducts({
    slugs: BUNDLE_PICKER_PRODUCT_SLUGS,
  });

  const productBySlug = useMemo(() => {
    if (productsQuery.data?.products == null) {
      return new Map<string, OnboardingProduct>();
    }
    return productsResponseToMap(productsQuery.data.products);
  }, [productsQuery.data]);

  const marketing = getBundleMarketingCopy(selectedId, { gender });
  const unlockCopy = getBundleUnlockCopy(selectedId);
  const selectedPrice = getUpgradePrice(user, selectedId);
  const bundleOrder = useMemo(() => getAvailableBundleOrder(user), [user]);

  const isPending =
    upgradeOrderMutation.isPending || upgradeOrderMutation.isSuccess;

  const externalPaymentMethodId = activePaymentMethod?.externalPaymentMethodId;
  const hasPaymentMethod =
    externalPaymentMethodId !== undefined && externalPaymentMethodId !== null;

  useEffect(() => {
    track('advanced_upgrade_picker_viewed', { variant, bundle_id: null });
  }, [track, variant]);

  useLayoutEffect(() => {
    const selectedCard = mobileSelectorRef.current?.querySelector(
      `[data-bundle-id="${selectedId}"]`,
    );
    selectedCard?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [selectedId]);

  const handleSelect = useCallback(
    (id: AdvancedUpgradeBundleId, price: number) => {
      if (isPending) return;
      if (id === selectedId) return;
      setIsConfirmingPurchase(false);
      setSelectedId(id);
      track('advanced_upgrade_bundle_selected', {
        variant,
        bundle_id: id,
        price,
      });
    },
    [isPending, selectedId, track, variant],
  );

  const upgradeOrder = async () => {
    const paymentMethodId = activePaymentMethod?.externalPaymentMethodId;
    if (paymentMethodId == null) {
      toast.error('No payment method available');
      return;
    }

    await upgradeOrderMutation.mutateAsync({
      data: {
        upgradeType: 'advanced',
        paymentMethodId,
        bundleId: selectedId,
      },
    });

    trackOnboardingCreditPurchase({
      credits: [
        { id: selectedId, price: selectedPrice, name: marketing.cardTitle },
      ],
      totalValue: selectedPrice,
      paymentProvider: activePaymentMethod?.paymentProvider ?? 'unknown',
      flowContext: 'onboarding',
      variant,
      bundleId: selectedId,
    });
    toast.success('Upgrade successful!');
    next();
  };

  const handleUpgradeCta = async () => {
    if (!isConfirmingPurchase) {
      setIsConfirmingPurchase(true);
      return;
    }

    await upgradeOrder();
  };

  const handleCancelConfirm = () => {
    setIsConfirmingPurchase(false);
  };

  const purchaseInteraction: BundlePickerPurchaseInteraction = {
    isPending,
    isConfirmingPurchase,
    isSelectingPaymentMethod,
    hasPaymentMethod,
    isFlexSelected,
    onSkip: next,
    onCancelConfirm: handleCancelConfirm,
    onUpgradeCta: handleUpgradeCta,
  };

  const bundleSelectorDisabled = isPending;

  return (
    <Sequence.StepLayout className="bg-zinc-50 md:bg-[#fafafa]">
      <BundlePickerHeader>
        <div
          data-testid="bundle-desktop-grid"
          className="mt-6 hidden min-w-0 items-start gap-4 px-4 md:grid md:grid-cols-3 md:grid-rows-[auto_auto_auto_auto] md:px-8"
        >
          <BundleDesktopCards
            user={user}
            productBySlug={productBySlug}
            bundleOrder={bundleOrder}
            selectedId={selectedId}
            disabled={isPending}
            productsPending={productsQuery.isPending}
            productsError={productsQuery.isError}
            gender={gender}
            onSelect={handleSelect}
          />
        </div>

        <div className="mt-6 space-y-6 px-4 md:hidden">
          <BundleHeroImages
            bundleId={selectedId}
            productBySlug={productBySlug}
          />
          <p className="text-lg font-semibold leading-7 text-zinc-900">
            {marketing.cardTitle}
          </p>
          <p className="text-base leading-6 text-zinc-900/55">
            <span className="font-semibold text-zinc-900">
              {unlockCopy.lead}
            </span>{' '}
            {unlockCopy.body}
          </p>
          <section>
            <p className="text-sm text-zinc-900/50">What’s included</p>
            <div className="mt-2">
              <IncludedAccordion
                bundleId={selectedId}
                productBySlug={productBySlug}
                isLoading={productsQuery.isPending}
                isError={productsQuery.isError}
                gender={gender}
              />
            </div>
          </section>
        </div>
      </BundlePickerHeader>

      <BundlePickerDesktopFooter
        footerLabel={marketing.footerLabel}
        selectedPrice={selectedPrice}
        interaction={purchaseInteraction}
      />

      <BundlePickerMobileFooter
        selectedPrice={selectedPrice}
        interaction={purchaseInteraction}
        user={user}
        bundleOrder={bundleOrder}
        selectedId={selectedId}
        gender={gender}
        onSelect={handleSelect}
        selectorRef={mobileSelectorRef}
        bundleSelectorDisabled={bundleSelectorDisabled}
      />
    </Sequence.StepLayout>
  );
};
