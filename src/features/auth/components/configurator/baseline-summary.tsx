import { CheckCircle, ChevronDown } from 'lucide-react';

import { AtHomeNoticeSection } from '@/components/shared/at-home-notice-section';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2, H3, H4 } from '@/components/ui/typography';
import { ADVANCED_BLOOD_PANEL, COLLECTION_METHODS } from '@/const';
import { useCheckoutContext } from '@/features/auth/stores';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';

export const BaselineSummary = ({ postalCode }: { postalCode: string }) => {
  const { couponMetadata } = useCheckoutContext();
  const atHomeDrawCredit =
    couponMetadata?.event_type === 'at_home_draw_credit' ||
    couponMetadata?.blood_draw_method === COLLECTION_METHODS.AT_HOME.value;

  return (
    <div className="hidden w-full flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-10 lg:sticky lg:top-8 lg:flex lg:h-[calc(100svh-4rem)] lg:max-h-[calc(100svh-4rem)] lg:overflow-auto">
      <Body1 className="text-zinc-500">Order summary</Body1>
      <CardInfo />
      <TotalInfo />
      <AtHomeDrawCreditSection />
      <AtHomeNoticeSection
        postalCode={postalCode}
        atHomeDrawCredit={atHomeDrawCredit}
      />
    </div>
  );
};

export const CardInfo = ({ className }: { className?: string }) => {
  const { membership, couponMetadata } = useCheckoutContext();

  const hasAdvancedDrawCredit =
    couponMetadata?.blood_draw_service === ADVANCED_BLOOD_PANEL;

  const image = hasAdvancedDrawCredit
    ? '/services/upgrade/advanced-panel.png'
    : '/services/upgrade/baseline-panel.png';

  const title = hasAdvancedDrawCredit
    ? 'Superpower Membership'
    : 'Superpower Membership';

  const description = hasAdvancedDrawCredit
    ? '120+ lab tests, results tracked over time and a private medical team.'
    : '100+ lab tests, results tracked over time and a private medical team.';

  return (
    <div
      className={cn(
        'space-y-2 lg:space-y-4 rounded-[20px] border p-4 shadow-sm bg-white w-full',
        className,
      )}
    >
      <img
        src={image}
        alt="advanced"
        className="pointer-events-none mx-auto h-[180px] w-full select-none object-contain pt-4"
      />
      <div className="hidden lg:block">
        <H4>{title}</H4>
        <Body2 className="text-zinc-500">{description}</Body2>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 lg:hidden">
        <div className="flex items-center gap-2">
          <Body1 className="text-zinc-500">{title}</Body1>
        </div>
        {membership ? (
          <H3>{formatMoney(membership.total)}</H3>
        ) : (
          <Skeleton className="h-8 w-full rounded-md" />
        )}
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
              {description}
              team.
            </Body1>
            <TotalInfo />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export const TotalInfo = () => {
  const { membership, couponMetadata } = useCheckoutContext();

  if (!membership) {
    return Array(3)
      .fill(0)
      .map((_, i) => <Skeleton key={i} className="h-6 w-full rounded-md" />);
  }

  return (
    <div className="space-y-4">
      {membership?.meta
        .filter((m) => {
          // HACK: We don't have advanced subscription, so the Subtotal will be for baseline
          // Filter out "subtotal" items when there is couponMetadata
          if (couponMetadata && m.title.toLowerCase() === 'subtotal') {
            return false;
          }
          return true;
        })
        .map((m) => (
          <div className="flex items-center justify-between" key={m.title}>
            <Body1
              className={cn(
                m.title === 'Applied discount'
                  ? 'text-vermillion-900'
                  : 'text-zinc-500',
              )}
            >
              {m.title}
            </Body1>
            <Body1
              className={cn(
                m.title === 'Applied discount' ? 'text-vermillion-900' : null,
              )}
            >
              {m.amount}
            </Body1>
          </div>
        ))}
      <Separator />
      <div className="flex items-center justify-between">
        <Body1 className="text-zinc-500">Total</Body1>
        {membership ? (
          <Body1>{formatMoney(membership.total)}</Body1>
        ) : (
          <Body1>Unavailable</Body1>
        )}
      </div>
    </div>
  );
};

export const AtHomeDrawCreditSection = ({
  className,
}: {
  className?: string;
}) => {
  const { couponMetadata } = useCheckoutContext();
  const atHomeDrawCredit =
    couponMetadata?.event_type === 'at_home_draw_credit' ||
    couponMetadata?.blood_draw_method === COLLECTION_METHODS.AT_HOME.value;

  if (!atHomeDrawCredit) {
    return null;
  }

  return (
    <div
      className={cn(
        'w-full rounded-xl border border-zinc-200 bg-white p-3',
        className,
      )}
    >
      <div className="mb-1 flex items-center gap-2">
        <CheckCircle className="size-4 text-vermillion-900" />
        <Body2>Your access code has been applied</Body2>
      </div>
      <Body2 className="ml-6 text-zinc-500">
        You&apos;ll schedule your free at-home blood draw after you&apos;ve
        activated your membership.
      </Body2>
    </div>
  );
};
