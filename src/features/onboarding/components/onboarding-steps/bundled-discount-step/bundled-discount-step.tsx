import { Check, CircleCheckBig } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { SplitScreenLayout } from '@/components/layouts';
import { PaymentDetails } from '@/components/shared/payment-details';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, H2, H3, H4 } from '@/components/ui/typography';
import { useUpgradeOrder } from '@/features/orders/api/upgrade-order';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { CurrentPaymentMethodCard } from '@/features/users/components/current-payment-method-card';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';

import { useOnboardingStepper } from '../onboarding-stepper';

import {
  BundledDiscount,
  BUNDLED_DISCOUNTS,
  getPricingForUser,
} from './discounts';

const ProgressHeader = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex-col', className)}>
      <div className="flex items-center justify-start md:justify-end">
        <SuperpowerLogo />
      </div>
      <H2 className="mt-8 text-zinc-900">Track your progress</H2>
      <Body1 className="mt-2 text-zinc-500">
        Your Baseline test is just the starting point. See how your numbers
        evolve, celebrate real progress, and stay in control of your long-term
        health.
      </Body1>
    </div>
  );
};

const BundledDiscountCard = ({
  bundledDiscount,
  selected,
  onToggle,
}: {
  bundledDiscount: BundledDiscount;
  selected: boolean;
  onToggle: (bundledDiscount: BundledDiscount) => void;
}) => {
  const { data: user } = useUser();
  const pricing = getPricingForUser(bundledDiscount, user);

  return (
    <div className="space-y-4 rounded-3xl bg-zinc-50 shadow-sm">
      {/* Main Card with Orange Border */}
      <div
        role="button"
        tabIndex={0}
        className={cn(
          'relative rounded-3xl border border-zinc-200 bg-white p-6 cursor-pointer transition-colors hover:bg-zinc-50',
          selected && 'border-vermillion-900',
        )}
        onClick={() => onToggle(bundledDiscount)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onToggle(bundledDiscount);
          }
        }}
      >
        <div className="flex items-center gap-6">
          {/* Radio Button */}
          <RadioGroup>
            <RadioGroupItem
              id={bundledDiscount.title}
              value={bundledDiscount.title}
              variant="vermillion"
              className="size-5"
              onClick={(e) => e.stopPropagation()}
              checked={selected}
            />
          </RadioGroup>

          {/* Test Tube Image */}
          <div className="shrink-0">
            <img
              src={bundledDiscount.image}
              alt="Supplement Blood Test"
              className="h-12 w-auto"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <div className="text-lg font-semibold text-black">
              {bundledDiscount.title}
            </div>
            <Badge className="md:hidden" variant="vermillion">
              {formatMoney(pricing.originalPrice - pricing.price)} saved
            </Badge>
            <Body1 className="hidden text-zinc-500 md:block">
              <span className="text-vermillion-900">
                Save {formatMoney(pricing.originalPrice - pricing.price)}
              </span>
              &nbsp;when you plan your next test in advance.
            </Body1>
          </div>

          {/* Pricing */}
          <div className="text-right">
            <div className="text-lg font-bold text-black">
              {formatMoney(pricing.price)}
            </div>
            <div className="text-sm text-zinc-500 line-through">
              {formatMoney(pricing.originalPrice)}
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="p-4">
        <div className="space-y-3">
          {bundledDiscount.descriptionItems.map((item) => (
            <div className="flex items-start gap-3" key={item}>
              <Check className="size-4 text-vermillion-900" />
              <p className="text-sm text-zinc-600">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BundledDiscountContent = () => {
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    string | undefined
  >();
  const [isSelectingPaymentMethod, setIsSelectingPaymentMethod] =
    useState(false);
  const { isFlexSelected, hasFlexPaymentMethod, activePaymentMethod } =
    usePaymentMethodSelection(selectedPaymentMethodId);

  const handlePaymentMethodSelect = (id: string) => {
    setSelectedPaymentMethodId(id);
    setIsSelectingPaymentMethod(false);
  };

  const { next } = useOnboardingStepper();
  const upgradeOrderMutation = useUpgradeOrder();
  const { data: user } = useUser();
  const [selectedBundledDiscount, setSelectedBundledDiscount] =
    useState<BundledDiscount>(BUNDLED_DISCOUNTS[0]);

  const upgradeOrder = async () => {
    await upgradeOrderMutation.mutateAsync({
      data: {
        upgradeType: 'baseline-bundle',
        paymentMethodId: activePaymentMethod?.externalPaymentMethodId,
        quantity: selectedBundledDiscount.quantity,
      },
    });
    toast.success(
      `Purchase of ${selectedBundledDiscount.quantity} additional test${selectedBundledDiscount.quantity > 1 ? 's' : ''} successful!`,
    );
    setTimeout(() => {
      next();
    }, 3000);
  };

  const onToggleDiscount = (bundledDiscount: BundledDiscount) => {
    setSelectedBundledDiscount(bundledDiscount);
  };

  const selectedDiscountPricing = useMemo(() => {
    return getPricingForUser(selectedBundledDiscount, user);
  }, [selectedBundledDiscount, user]);

  return (
    <React.Fragment>
      {/* Bundled Discounts Panel */}
      <div className="w-full space-y-6 p-4 md:space-y-8 md:rounded-3xl md:border md:bg-white md:px-8 md:shadow-sm">
        <ProgressHeader className="flex md:hidden" />
        <div>
          <H4>Stay on top of your health</H4>
          <H4 className="text-zinc-500">And save when you plan ahead</H4>
        </div>
        {BUNDLED_DISCOUNTS.map((bundledDiscount) => (
          <BundledDiscountCard
            key={bundledDiscount.title}
            bundledDiscount={bundledDiscount}
            selected={selectedBundledDiscount?.id === bundledDiscount.id}
            onToggle={onToggleDiscount}
          />
        ))}
        <Body1 className="text-zinc-500">
          You can always purchase {selectedBundledDiscount.quantity} test
          {selectedBundledDiscount.quantity > 1 ? 's' : ''} later {''}
          for {formatMoney(selectedDiscountPricing.originalPrice)}
        </Body1>
        <Separator />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Body1 className="text-zinc-500">New total</Body1>
            <Body1>+{formatMoney(selectedDiscountPricing.price)}</Body1>
          </div>
          <div className="flex items-center justify-between">
            <Body1 className="text-zinc-500">Total savings</Body1>
            <Body1 className="text-zinc-400">
              {formatMoney(
                selectedDiscountPricing.originalPrice -
                  selectedDiscountPricing.price,
              )}
            </Body1>
          </div>
        </div>
      </div>

      {/* Payment Details Panel */}
      <div className="w-full flex-col gap-4 p-4 md:p-10 lg:sticky lg:top-8 lg:flex lg:h-[calc(100svh-4rem)] lg:max-h-[calc(100svh-4rem)] lg:overflow-auto">
        <ProgressHeader className="hidden md:flex" />
        <div className="mt-8 space-y-4">
          <H3 className="hidden text-zinc-900 md:block">Payment details</H3>
          <PaymentDetails titleSm="Payment details" titleMd="Card" />
          <CurrentPaymentMethodCard
            className="!bg-white"
            selectedPaymentMethodId={selectedPaymentMethodId}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            isEditing={isSelectingPaymentMethod}
            setIsEditing={setIsSelectingPaymentMethod}
          />
        </div>
        <div className="my-6 flex flex-col gap-2">
          <Button
            disabled={
              upgradeOrderMutation.isPending || upgradeOrderMutation.isSuccess
            }
            onClick={upgradeOrder}
          >
            {upgradeOrderMutation.isPending ? (
              <TransactionSpinner className="flex justify-center" />
            ) : (
              <>
                {isFlexSelected && (
                  <CircleCheckBig className="mr-2 size-[20px]" />
                )}
                Purchase {selectedBundledDiscount.quantity} additional test
                {selectedBundledDiscount.quantity > 1 ? 's' : ''} {''}
                for {formatMoney(selectedDiscountPricing.price)} {''}
                {isFlexSelected ? ' with HSA/FSA' : ''}
              </>
            )}
          </Button>
          {hasFlexPaymentMethod && !selectedPaymentMethodId && (
            <Button
              variant="outline"
              className="bg-white"
              onClick={() => setIsSelectingPaymentMethod(true)}
            >
              <CircleCheckBig className="mr-2 size-[20px] text-zinc-700" />
              Select HSA/FSA card
            </Button>
          )}
          <Button
            variant="outline"
            className="bg-white"
            onClick={next}
            disabled={upgradeOrderMutation.isPending}
          >
            No thanks
          </Button>
        </div>
        <div className="flex justify-center gap-6 text-xs text-zinc-400 md:justify-start">
          <a
            href="https://www.superpower.com/privacy"
            target="_blank"
            rel="noreferrer"
            className="transition-colors duration-150 hover:text-zinc-500"
          >
            Privacy Policy
          </a>
          <a
            href="https://www.superpower.com/terms"
            target="_blank"
            rel="noreferrer"
            className="transition-colors duration-150 hover:text-zinc-500"
          >
            Terms of services
          </a>
        </div>
      </div>
    </React.Fragment>
  );
};

export const BundledDiscountStep = () => (
  <SplitScreenLayout title="Bundled Discount" className="bg-zinc-50">
    <BundledDiscountContent />
  </SplitScreenLayout>
);
