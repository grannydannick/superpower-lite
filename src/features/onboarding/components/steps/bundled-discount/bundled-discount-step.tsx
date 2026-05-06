import NumberFlow from '@number-flow/react';
import { Check } from 'lucide-react';
import { useState } from 'react';

import { Head } from '@/components/seo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, H1 } from '@/components/ui/typography';
import {
  getOnboardingStepTitle,
  ONBOARDING_STEP_IDS,
} from '@/features/onboarding/components/flow/onboarding-step-manifest';
import { useUpgradeCredit } from '@/features/orders/api';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { CurrentPaymentMethodCard } from '@/features/users/components/payment';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';

import { useOnboardingAnalytics } from '../../../hooks/use-onboarding-analytics';
import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';
import { Sequence } from '../../sequence';

import {
  BUNDLED_DISCOUNTS,
  getPricingForUser,
  type BundledDiscountPricing,
} from './discounts';

interface TestingFrequency {
  id: string;
  title: string;
  badge?: string;
  quantity: number;
  image: string;
}

const INCLUDED_TESTING_FREQUENCY: TestingFrequency = {
  id: 'annual',
  title: 'Annual test',
  quantity: 0,
  image: '/onboarding/bundled-discount/annual-test.webp',
};

const TESTING_UPGRADE_FREQUENCIES: TestingFrequency[] = [
  {
    id: 'twice-per-year',
    title: 'Twice per year',
    quantity: 1,
    badge: 'Most popular',
    image: '/onboarding/bundled-discount/twice-per-year.webp',
  },
  {
    id: 'quarterly',
    title: 'Quarterly',
    quantity: 3,
    badge: 'Best results',
    image: '/onboarding/bundled-discount/quarterly.webp',
  },
];

const WHY_RETEST_ITEMS = [
  {
    title: 'See what actually changed.',
    description: "Confirm which markers improved and which didn't.",
  },
  {
    title: 'Catch new issues early.',
    description: 'Health shifts over time, even when you feel fine.',
  },
  {
    title: '36% of Superpower members',
    description: 'reduced their biological age between tests.',
  },
];

const TestingFrequencyCard = ({
  frequency,
  selected,
  disabled = false,
  onSelect,
  priceLabel,
  originalPriceLabel,
}: {
  frequency: TestingFrequency;
  selected: boolean;
  disabled?: boolean;
  onSelect?: (frequency: TestingFrequency) => void;
  priceLabel: string;
  originalPriceLabel?: string;
}) => {
  const hasPriceDetails = originalPriceLabel != null || priceLabel !== '';

  return (
    <div className="relative">
      {frequency.badge && (
        <div
          className={cn(
            'flex w-full items-center justify-center rounded-t-xl bg-zinc-200 pt-1',
            selected && 'bg-vermillion-900',
          )}
        >
          <Badge
            variant="secondary"
            className={cn(
              'whitespace-nowrap bg-transparent text-xs text-zinc-500',
              selected && 'text-white',
            )}
          >
            {frequency.badge}
          </Badge>
        </div>
      )}
      <div
        className={cn(
          'rounded-b-2xl',
          frequency.badge && 'bg-zinc-200',
          selected && frequency.badge && 'bg-vermillion-900',
        )}
      >
        <button
          type="button"
          onClick={() => onSelect?.(frequency)}
          disabled={disabled}
          className={cn(
            'relative flex h-full min-h-32 w-full flex-col items-start justify-end rounded-2xl border bg-white p-4 outline-0 outline-transparent transition-all',
            selected
              ? 'border-vermillion-900 bg-vermillion-50 outline outline-2 outline-vermillion-900/20'
              : 'border-zinc-200 hover:bg-zinc-50',
            disabled && 'cursor-default hover:bg-white',
          )}
        >
          <div
            className={cn(
              'absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border',
              selected
                ? 'border-vermillion-900 bg-vermillion-900'
                : 'border-zinc-300 bg-white',
            )}
          >
            {selected && <Check className="size-3 text-white" />}
          </div>

          <img
            src={frequency.image}
            alt={frequency.title}
            className="-ml-2 -mt-4 mb-2 size-14 h-full object-contain pt-4 rounded-mask"
          />

          <div className="text-sm font-medium text-zinc-900">
            {frequency.title}
          </div>

          {hasPriceDetails && (
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
              {originalPriceLabel && (
                <span className="text-zinc-400 line-through">
                  {originalPriceLabel}
                </span>
              )}
              {priceLabel !== '' && (
                <span className="text-zinc-500">{priceLabel}</span>
              )}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

const WhyRetestItem = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="flex items-start gap-3">
      <div className="-mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-vermillion-900 outline outline-4 outline-vermillion-900/10">
        <Check className="size-3 text-white" />
      </div>
      <p className="text-sm text-zinc-600">
        <span className="font-medium text-zinc-900">{title}</span> {description}
      </p>
    </div>
  );
};

const BundledDiscountStep = () => {
  const { next } = useOnboardingNavigation();
  const userQuery = useUser();
  const user = userQuery.data;
  const hasResolvedUser = userQuery.isFetched;
  const { activePaymentMethod, isFlexSelected, isSelectingPaymentMethod } =
    usePaymentMethodSelection();
  const { trackOnboardingCreditPurchase } = useOnboardingAnalytics();
  const upgradeOrderMutation = useUpgradeCredit();

  const [selectedFrequency, setSelectedFrequency] =
    useState<TestingFrequency | null>(null);

  const handleSelectFrequency = (frequency: TestingFrequency) => {
    setSelectedFrequency((current) =>
      current?.id === frequency.id ? null : frequency,
    );
  };

  const isPending =
    upgradeOrderMutation.isPending || upgradeOrderMutation.isSuccess;
  const hasEligibleSelection = selectedFrequency != null;

  const getDiscountForFrequency = (frequency: TestingFrequency) => {
    return BUNDLED_DISCOUNTS.find((d) => d.quantity === frequency.quantity);
  };

  const getPriceLabel = (frequency: TestingFrequency) => {
    if (!hasResolvedUser) return '';
    const discount = getDiscountForFrequency(frequency);
    if (!discount) return '';
    const pricing = getPricingForUser(discount, user);
    return `+${formatMoney(pricing.price)}/yr`;
  };

  let selectedPricing: BundledDiscountPricing | null = null;
  if (hasResolvedUser && selectedFrequency != null) {
    const discount = getDiscountForFrequency(selectedFrequency);
    if (discount != null) {
      selectedPricing = getPricingForUser(discount, user);
    }
  }

  const selectedPrice = selectedPricing?.price ?? null;

  const getOriginalPriceLabel = (frequency: TestingFrequency) => {
    if (!hasResolvedUser) return undefined;
    const discount = getDiscountForFrequency(frequency);
    if (!discount) return undefined;
    const pricing = getPricingForUser(discount, user);
    return formatMoney(pricing.originalPrice);
  };

  const handleUpdatePlan = async () => {
    if (!hasResolvedUser) {
      return;
    }

    if (selectedFrequency == null) return;

    const paymentMethodId = activePaymentMethod?.externalPaymentMethodId;
    if (paymentMethodId == null) {
      toast.error('No payment method available');
      return;
    }

    const discount = getDiscountForFrequency(selectedFrequency);
    if (!discount) {
      toast.error('Invalid selection');
      return;
    }
    if (selectedPricing == null) {
      return;
    }

    const paymentProvider = activePaymentMethod?.paymentProvider ?? 'unknown';
    const plural = selectedFrequency.quantity > 1 ? 's' : '';

    try {
      await upgradeOrderMutation.mutateAsync({
        data: {
          upgradeType: 'baseline-bundle',
          paymentMethodId,
          quantity: selectedFrequency.quantity,
        },
      });

      trackOnboardingCreditPurchase({
        credits: [
          {
            id: `baseline-bundle-${selectedFrequency.quantity}`,
            price: selectedPricing.price,
          },
        ],
        totalValue: selectedPricing.price,
        paymentProvider,
        flowContext: 'onboarding',
      });

      toast.success(
        `Purchase of ${selectedFrequency.quantity} additional test${plural} successful!`,
      );
      next();
    } catch {
      toast.error('Purchase failed. Please try again later.');
    }
  };

  return (
    <>
      <Head
        title={getOnboardingStepTitle(ONBOARDING_STEP_IDS.BUNDLED_DISCOUNT)}
      />
      <Sequence.StepLayout className="bg-zinc-50">
        <div className="flex flex-1 flex-col items-center px-4 pb-8 pt-5 md:pt-8">
          <div className="w-full max-w-xl">
            <header className="mb-8 flex flex-col gap-3 md:items-center md:text-center">
              <H1 className="text-3xl leading-9 tracking-tight md:text-3xl">
                Track your progress
              </H1>
              <Body1 className="max-w-md text-base leading-relaxed text-zinc-500">
                Choose a testing frequency that&apos;s right for you.
              </Body1>
            </header>

            <div className="mb-6 grid grid-cols-3 items-end gap-3">
              <TestingFrequencyCard
                frequency={INCLUDED_TESTING_FREQUENCY}
                selected
                disabled
                priceLabel="Included"
              />
              {TESTING_UPGRADE_FREQUENCIES.map((frequency) => (
                <TestingFrequencyCard
                  key={frequency.id}
                  frequency={frequency}
                  selected={selectedFrequency?.id === frequency.id}
                  onSelect={handleSelectFrequency}
                  priceLabel={getPriceLabel(frequency)}
                  originalPriceLabel={getOriginalPriceLabel(frequency)}
                />
              ))}
            </div>

            <div className="mb-6">
              <h3 className="mb-4 text-lg font-medium text-zinc-900">
                Why re-test?
              </h3>
              <div className="space-y-4">
                {WHY_RETEST_ITEMS.map((item) => (
                  <WhyRetestItem
                    key={item.title}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
            </div>

            {hasEligibleSelection && (
              <div className="pb-4">
                <CurrentPaymentMethodCard />
              </div>
            )}

            <Button
              variant="vermillion"
              className="mb-4 w-full gap-1.5"
              onClick={handleUpdatePlan}
              disabled={
                isPending ||
                !hasResolvedUser ||
                isSelectingPaymentMethod ||
                !hasEligibleSelection ||
                activePaymentMethod?.externalPaymentMethodId == null
              }
            >
              {isPending ? (
                <TransactionSpinner />
              ) : (
                <>
                  Buy additional testing now
                  {isFlexSelected ? ' with HSA/FSA' : ''}
                  {selectedPrice !== null && (
                    <span className="ml-1 text-white/80">
                      <NumberFlow
                        value={selectedPrice / 100}
                        format={{
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }}
                      />
                    </span>
                  )}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full bg-white"
              onClick={next}
              disabled={isPending}
            >
              I&apos;m not interested in re-testing progress
            </Button>
          </div>
        </div>
      </Sequence.StepLayout>
    </>
  );
};

export default BundledDiscountStep;
