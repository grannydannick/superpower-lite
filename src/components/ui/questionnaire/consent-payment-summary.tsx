import { useMemo } from 'react';

import { ProgressiveImage } from '@/components/ui/progressive-image';
import { isGLP1FrontDoorExperiment } from '@/components/ui/questionnaire/utils/questionnaire-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { useMarketplace } from '@/features/marketplace/api/get-marketplace';
import { Rx, RxPrice } from '@/types/api';

import { getPrescriptionImage } from '../../../utils/prescription';

import { RX_BILLING_PERIOD_LINKID } from './const/special-linkids';
import { useQuestionnaireStore } from './stores/questionnaire-store';

type ResponseItem = {
  linkId: string;
  answer?: { valueString?: string }[];
  item?: ResponseItem[];
};

function getBillingCodeFromResponse(
  items: ResponseItem[] | undefined,
): string | undefined {
  if (!items) return undefined;
  for (const item of items) {
    if (item.linkId === RX_BILLING_PERIOD_LINKID) {
      return item.answer?.[0]?.valueString;
    }
    if (item.item) {
      const found = getBillingCodeFromResponse(item.item);
      if (found) return found;
    }
  }
  return undefined;
}

function getIntervalLabel(intervalCount: number): string {
  if (intervalCount <= 30) return '/month';
  if (intervalCount <= 90) return '/quarter';
  return '/6 months';
}

export const ConsentPaymentSummary = () => {
  const questionnaireName = useQuestionnaireStore((s) => s.questionnaire?.name);
  const questionnaireResponse = useQuestionnaireStore((s) => s.response);
  const isFrontdoorExperiment = isGLP1FrontDoorExperiment(
    questionnaireResponse,
  );
  const { prescription, isLoading } =
    useConsentPaymentPrescription(questionnaireName);

  const billingCode = getBillingCodeFromResponse(questionnaireResponse?.item);

  const matchedPrice: RxPrice | undefined = useMemo(() => {
    if (!billingCode || !prescription?.prices) return undefined;
    return prescription.prices.find((p) => p.billing_code === billingCode);
  }, [billingCode, prescription?.prices]);

  const displayPrice = matchedPrice
    ? matchedPrice.amount / 100
    : prescription?.price;

  const intervalLabel = matchedPrice
    ? getIntervalLabel(matchedPrice.interval_count)
    : '/month';

  const formattedPrice = isFrontdoorExperiment
    ? formatCurrency(0)
    : displayPrice != null
      ? formatCurrency(displayPrice)
      : null;

  const showSkeleton = isLoading || !formattedPrice || !prescription;

  if (
    !isLoading &&
    (!formattedPrice || !prescription) &&
    !isFrontdoorExperiment
  ) {
    toast.error('Failed to fetch pricing information. Please contact support.');
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="flex h-80 w-full items-center justify-center overflow-hidden rounded-3xl bg-white">
        {showSkeleton ? (
          <Skeleton className="size-full rounded-3xl" />
        ) : (
          <ProgressiveImage
            src={getPrescriptionImage(prescription.name)}
            alt={prescription.name}
            className="size-full object-contain"
          />
        )}
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <span className="text-base text-zinc-500">Subtotal</span>
            <span className="flex items-baseline gap-1">
              {showSkeleton ? (
                <>
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </>
              ) : formattedPrice ? (
                <>
                  <span className="text-base text-black">{formattedPrice}</span>
                  <span className="text-sm text-zinc-500">{intervalLabel}</span>
                </>
              ) : (
                '—'
              )}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <span className="text-base text-zinc-500">Shipping</span>
            {showSkeleton ? (
              <Skeleton className="h-4 w-12" />
            ) : (
              <span className="text-base text-black">FREE</span>
            )}
          </div>
        </div>
        <div className="h-px bg-zinc-200" />
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <span className="text-base text-zinc-500">
              Total (after approval)
            </span>
            <span className="flex items-baseline gap-1">
              {showSkeleton ? (
                <>
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </>
              ) : formattedPrice ? (
                <>
                  <span className="text-base text-black">{formattedPrice}</span>
                  <span className="text-sm text-zinc-500">{intervalLabel}</span>
                </>
              ) : (
                '—'
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const useConsentPaymentPrescription = (
  questionnaireName?: string,
): {
  prescription?: Rx;
  isLoading: boolean;
} => {
  const marketplaceQuery = useMarketplace();
  const prescriptions = marketplaceQuery.data?.prescriptions;

  const prescription = useMemo(() => {
    if (questionnaireName == null || questionnaireName.length === 0) {
      return undefined;
    }

    if (prescriptions == null || prescriptions.length === 0) {
      return undefined;
    }

    for (const rx of prescriptions) {
      // '/questionnaire/{name}'
      const url = rx.url;
      if (url == null) continue;
      if (url.includes(questionnaireName)) {
        return rx;
      }
    }

    return undefined;
  }, [prescriptions, questionnaireName]);

  return {
    prescription,
    isLoading: marketplaceQuery.isLoading,
  };
};

//note: price is in USD dollars
const formatCurrency = (price?: number | null) => {
  if (price === undefined || price === null) {
    return null;
  }

  const hasDecimals = Math.abs(price % 1) > Number.EPSILON;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(price);
};
