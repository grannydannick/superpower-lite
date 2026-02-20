import NumberFlow from '@number-flow/react';
import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Head } from '@/components/seo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, H2 } from '@/components/ui/typography';
import { useUpgradeCredit } from '@/features/orders/api';
import { usePaymentMethods } from '@/features/settings/api';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';

import { useOnboardingAnalytics } from '../../../hooks/use-onboarding-analytics';
import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';

import { getPricingForUser, BUNDLED_DISCOUNTS } from './discounts';

interface TestingFrequency {
  id: string;
  title: string;
  badge?: string;
  quantity: number;
  image: string;
}

const TESTING_FREQUENCIES: TestingFrequency[] = [
  {
    id: 'annual',
    title: 'Annual test',
    quantity: 0,
    image: '/onboarding/bundled-discount/annual-test.webp',
  },
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
    description: 'Confirm which markers improved and which didn\u0027t.',
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
  onSelect,
  priceLabel,
  originalPriceLabel,
}: {
  frequency: TestingFrequency;
  selected: boolean;
  onSelect: (frequency: TestingFrequency) => void;
  priceLabel: string;
  originalPriceLabel?: string;
}) => {
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
          onClick={() => onSelect(frequency)}
          className={cn(
            'relative flex h-full min-h-32 w-full flex-col items-start justify-end rounded-2xl border bg-white p-4 outline-0 outline-transparent transition-all',
            selected
              ? 'border-vermillion-900 bg-vermillion-50 outline outline-2 outline-vermillion-900/20'
              : 'border-zinc-200 hover:bg-zinc-50',
          )}
        >
          {/* Selection indicator */}
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

          {/* Test tube image */}
          <img
            src={frequency.image}
            alt={frequency.title}
            className="-ml-2 -mt-4 mb-2 size-14 h-full object-contain pt-4 rounded-mask"
          />

          {/* Title */}
          <div className="text-sm font-medium text-zinc-900">
            {frequency.title}
          </div>

          {/* Price info */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
            {originalPriceLabel && (
              <span className="text-zinc-400 line-through">
                {originalPriceLabel}
              </span>
            )}
            <span className="text-zinc-500">{priceLabel}</span>
          </div>
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

const BundledDiscountContent = () => {
  const { next } = useOnboardingNavigation();
  const { data: user } = useUser();
  const { data: paymentMethodsData } = usePaymentMethods();
  const { trackOnboardingCreditPurchase } = useOnboardingAnalytics();
  const upgradeOrderMutation = useUpgradeCredit();

  const defaultFrequency =
    TESTING_FREQUENCIES.find((frequency) => frequency.quantity > 0) ??
    TESTING_FREQUENCIES[0] ??
    null;
  const [selectedFrequency, setSelectedFrequency] =
    useState<TestingFrequency | null>(defaultFrequency);

  const firstPaymentMethod = paymentMethodsData?.paymentMethods?.[0];
  const isPending =
    upgradeOrderMutation.isPending || upgradeOrderMutation.isSuccess;
  const hasEligibleSelection = (selectedFrequency?.quantity ?? 0) > 0;

  const getDiscountForFrequency = (frequency: TestingFrequency) => {
    return BUNDLED_DISCOUNTS.find((d) => d.quantity === frequency.quantity);
  };

  const getPriceLabel = (frequency: TestingFrequency) => {
    if (frequency.quantity === 0) return 'Included';
    const discount = getDiscountForFrequency(frequency);
    if (!discount) return '';
    const pricing = getPricingForUser(discount, user);
    return `+${formatMoney(pricing.price)}/yr`;
  };

  const selectedPrice = useMemo(() => {
    if (!selectedFrequency || selectedFrequency.quantity === 0) {
      return null;
    }
    const discount = getDiscountForFrequency(selectedFrequency);
    if (!discount) return null;
    const pricing = getPricingForUser(discount, user);
    return pricing.price;
  }, [selectedFrequency, user]);

  const buttonContent = useMemo(() => {
    if (selectedPrice === null) {
      return 'Update testing plan';
    }

    return (
      <>
        Update testing plan{' '}
        <span className="text-white/80">
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
      </>
    );
  }, [selectedPrice]);

  const getOriginalPriceLabel = (frequency: TestingFrequency) => {
    if (frequency.quantity === 0) return undefined;
    const discount = getDiscountForFrequency(frequency);
    if (!discount) return undefined;
    const pricing = getPricingForUser(discount, user);
    return formatMoney(pricing.originalPrice);
  };

  const handleUpdatePlan = async () => {
    if (!selectedFrequency) return;

    // Do not allow skipping with included option
    if (selectedFrequency.quantity === 0) return;

    if (!firstPaymentMethod?.externalPaymentMethodId) {
      toast.error('No payment method available');
      return;
    }

    const discount = getDiscountForFrequency(selectedFrequency);
    if (!discount) {
      toast.error('Invalid selection');
      return;
    }

    try {
      await upgradeOrderMutation.mutateAsync({
        data: {
          upgradeType: 'baseline-bundle',
          paymentMethodId: firstPaymentMethod.externalPaymentMethodId,
          quantity: selectedFrequency.quantity,
        },
      });

      const pricing = getPricingForUser(discount, user);
      trackOnboardingCreditPurchase({
        credits: [
          {
            id: `baseline-bundle-${selectedFrequency.quantity}`,
            price: pricing.price,
          },
        ],
        totalValue: pricing.price,
        paymentProvider: firstPaymentMethod?.paymentProvider ?? 'unknown',
      });

      toast.success(
        `Purchase of ${selectedFrequency.quantity} additional test${selectedFrequency.quantity > 1 ? 's' : ''} successful!`,
      );
      next();
    } catch {
      toast.error('Purchase failed. Please try again later.');
    }
  };

  const handleNotInterested = () => {
    next();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50">
      <Head title="Testing Frequency" />

      {/* Header */}
      <div className="flex items-center justify-start p-6">
        <SuperpowerLogo />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-xl">
          {/* Heading */}
          <div className="mb-8">
            <H2>Keep your twin up-to-date</H2>
            <Body1 className="mt-2 text-secondary">
              Choose a testing frequency that&apos;s right for you.
            </Body1>
          </div>

          {/* Testing frequency cards */}
          <div className="mb-6 grid grid-cols-3 items-end gap-3">
            {TESTING_FREQUENCIES.map((frequency) => (
              <TestingFrequencyCard
                key={frequency.id}
                frequency={frequency}
                selected={selectedFrequency?.id === frequency.id}
                onSelect={setSelectedFrequency}
                priceLabel={getPriceLabel(frequency)}
                originalPriceLabel={getOriginalPriceLabel(frequency)}
              />
            ))}
          </div>

          {/* Update button */}
          <Button
            variant="vermillion"
            className="mb-8 w-full gap-1.5"
            onClick={handleUpdatePlan}
            disabled={isPending || !hasEligibleSelection}
          >
            {isPending ? <TransactionSpinner /> : buttonContent}
          </Button>

          {/* Why re-test section */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-medium text-zinc-900">
              Why re-test?
            </h3>
            <div className="space-y-4">
              {WHY_RETEST_ITEMS.map((item, index) => (
                <WhyRetestItem
                  key={index}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </div>

          {/* Not interested button */}
          <Button
            variant="outline"
            className="w-full bg-white"
            onClick={handleNotInterested}
            disabled={isPending}
          >
            I&apos;m not interested in re-testing progress
          </Button>
        </div>
      </div>
    </div>
  );
};

export const BundledDiscountStep = () => <BundledDiscountContent />;
