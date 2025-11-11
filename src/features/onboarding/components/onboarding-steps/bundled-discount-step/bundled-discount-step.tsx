import { Check } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { SplitScreenLayout } from '@/components/layouts';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { Body1, H2, H3, H4 } from '@/components/ui/typography';
import { useUpgradeOrder } from '@/features/orders/api/upgrade-order';
import * as Payment from '@/features/users/components/payment';
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
      <div className="flex items-center">
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
  const { next } = useOnboardingStepper();
  const upgradeOrderMutation = useUpgradeOrder({
    mutationConfig: {
      onSuccess: () => {
        toast.success(
          `Purchase of ${selectedBundledDiscount.quantity} additional test${selectedBundledDiscount.quantity > 1 ? 's' : ''} successful!`,
        );
      },
    },
  });
  const { data: user } = useUser();
  const [selectedBundledDiscount, setSelectedBundledDiscount] =
    useState<BundledDiscount>(BUNDLED_DISCOUNTS[0]);

  const upgradeOrder = async (paymentMethodId: string) => {
    await upgradeOrderMutation.mutateAsync({
      data: {
        upgradeType: 'baseline-bundle',
        paymentMethodId,
        quantity: selectedBundledDiscount.quantity,
      },
    });
    next();
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
      <div className="order-1 w-full space-y-8 p-4 md:order-2 md:rounded-3xl md:border md:bg-white md:px-8 md:shadow-sm">
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
      <div className="order-2 w-full flex-col gap-4 p-4 md:order-1 md:p-10 lg:sticky lg:top-8 lg:flex lg:h-[calc(100svh-4rem)] lg:max-h-[calc(100svh-4rem)] lg:overflow-auto">
        <ProgressHeader className="hidden md:flex" />
        <Payment.PaymentGroup>
          <H3 className="hidden text-zinc-900 md:block">Payment details</H3>
          <Payment.PaymentDetails titleSm="Payment details" titleMd="Card" />
          <Payment.CurrentPaymentMethodCard className="!bg-white" />
          <Payment.SubmitPayment
            onSubmit={upgradeOrder}
            onCancel={next}
            submitLabel="Purchase"
            isPending={upgradeOrderMutation.isPending}
            isSuccess={upgradeOrderMutation.isSuccess}
            enabled={selectedBundledDiscount.quantity > 0}
          />
        </Payment.PaymentGroup>
      </div>
    </React.Fragment>
  );
};

export const BundledDiscountStep = () => (
  <SplitScreenLayout title="Bundled Discount" className="bg-zinc-50">
    <BundledDiscountContent />
  </SplitScreenLayout>
);
