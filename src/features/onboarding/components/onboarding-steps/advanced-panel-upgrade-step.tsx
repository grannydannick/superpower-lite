import { ArrowRight, ChevronDown } from 'lucide-react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { SplitScreenLayout } from '@/components/layouts';
import { AvailableBiomarkersDialog } from '@/components/shared/available-biomarkers';
import { StyledMarkdown } from '@/components/shared/styled-markdown';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { Body1, Body2, H2, H3, H4 } from '@/components/ui/typography';
import { UPGRADE_INFO } from '@/const';
import { useUpgradeOrder } from '@/features/orders/api/upgrade-order';
import * as Payment from '@/features/users/components/payment';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';
import { getUpgradePrice } from '@/utils/get-upgrade-price';

import { useOnboardingStepper } from './onboarding-stepper';

const AdvancedPanelUpgradeContent = () => {
  const { next } = useOnboardingStepper();

  const upgradeOrderMutation = useUpgradeOrder({
    mutationConfig: {
      onSuccess: () => {
        toast.success(`One-time Advanced Panel upgrade successful!`);
      },
    },
  });
  const { data: user } = useUser();

  const price = getUpgradePrice(user);

  const upgradeOrder = async (paymentMethodId: string) => {
    await upgradeOrderMutation.mutateAsync({
      data: {
        upgradeType: 'advanced',
        paymentMethodId,
      },
    });
    next();
  };

  return (
    <>
      <div className="w-full space-y-8 p-4 md:p-10">
        <SuperpowerLogo />
        <div className="space-y-2">
          <H2>Upgrade your Baseline Test</H2>
          <Body1 className="text-zinc-500">
            The Advanced Panel is a one-time upgrade that adds 30+ biomarkers on
            top of your baseline panel, providing deep insights across hormone
            balance, insulin resistance, nutrient status, and cardiovascular
            risk.
          </Body1>

          <ProductInfo price={price} className="lg:hidden" />
          <AvailableBiomarkersDialog>
            <Button
              variant="ghost"
              className="gap-1 px-0 py-2 text-sm text-zinc-500"
            >
              View all tested 130+ biomarkers
              <ArrowRight size={16} />
            </Button>
          </AvailableBiomarkersDialog>
        </div>
        {UPGRADE_INFO.map(({ title, preview, markdown }) => (
          <div key={title} className="space-y-2">
            <H4 className="m-0 text-zinc-900">{title}</H4>
            <Collapsible className="space-y-2 ">
              <Body1 className="text-zinc-500">{preview}</Body1>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="group gap-3 p-0">
                  Read more
                  <ChevronDown className="size-5 text-zinc-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <StyledMarkdown className="space-y-4 text-zinc-500">
                  {markdown}
                </StyledMarkdown>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
        <Payment.PaymentGroup>
          <Payment.PaymentDetails />
          <Payment.CurrentPaymentMethodCard className="!bg-white" />
          <Payment.SubmitPayment
            onSubmit={upgradeOrder}
            onCancel={next}
            submitLabel="Upgrade to Advanced"
            isPending={upgradeOrderMutation.isPending}
            isSuccess={upgradeOrderMutation.isSuccess}
            enabled
          />
        </Payment.PaymentGroup>
      </div>
      <div className="hidden w-full flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-10 lg:sticky lg:top-8 lg:flex lg:h-[calc(100svh-4rem)] lg:max-h-[calc(100svh-4rem)] lg:overflow-auto">
        <Body1 className="text-zinc-500">One-time upgrade</Body1>
        <ProductInfo price={price} />
        <TotalInfo price={price} />
      </div>
    </>
  );
};

const ProductInfo = ({
  price,
  className,
}: {
  price: number;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'space-y-2 lg:space-y-4 rounded-[20px] border p-4 shadow-sm bg-white',
        className,
      )}
    >
      <img
        src="/services/advanced-panel-v2.png"
        alt="advanced"
        className="pointer-events-none mx-auto h-[180px] w-full object-contain pt-4"
      />
      <div className="hidden lg:block">
        <H4>Advanced Panel</H4>
        <Body2 className="text-zinc-500">
          20+ biomarkers for deep insights across health optimization,
          prevention, and complex symptoms
        </Body2>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 lg:hidden">
        <div className="flex items-center gap-2">
          <Body1 className="text-zinc-500">Advanced Panel</Body1>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="3"
            height="4"
            viewBox="0 0 3 4"
            fill="none"
          >
            <circle cx="1.5" cy="2" r="1.5" fill="#71717A" />
          </svg>
          <Body1 className="text-zinc-500">One time Upgrade</Body1>
        </div>
        <H3>{formatMoney(price)}</H3>
        <Collapsible className="w-full space-y-2">
          <div className="flex items-center justify-center">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="group gap-3 p-0">
                View details
                <ChevronDown className="size-5 text-zinc-500 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-2">
            <Body1 className="text-zinc-500">
              120+ biomarkers for deep insights across health optimization,
              prevention, and complex symptoms
            </Body1>
            <TotalInfo price={price} />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

const TotalInfo = ({ price }: { price: number }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Body1 className="text-zinc-500">Subtotal</Body1>
        <Body1>+{formatMoney(price)}</Body1>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <Body1 className="text-zinc-500">Total</Body1>
        <Body1>+{formatMoney(price)}</Body1>
      </div>
    </div>
  );
};

export const AdvancedPanelUpgradeStep = () => (
  <SplitScreenLayout title="Upgrade" className="bg-zinc-50">
    <AdvancedPanelUpgradeContent />
  </SplitScreenLayout>
);
