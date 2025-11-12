import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { ProgressiveImage } from '@/components/ui/progressive-image';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
// eslint-disable-next-line import/no-restricted-paths
import { useMarketplace } from '@/features/marketplace/api/get-marketplace';
import { Rx } from '@/types/api';

import { getPrescriptionImage } from '../../../utils/prescription';

export const ConsentPaymentSummary = () => {
  const { prescription, isLoading } = useConsentPaymentPrescription();

  const formattedPrice = prescription
    ? formatCurrency(prescription.price)
    : null;

  const showSkeleton = isLoading || !formattedPrice || !prescription;

  if (!isLoading && (!formattedPrice || !prescription)) {
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
                  <span className="text-sm text-zinc-500">/month</span>
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
                  <span className="text-sm text-zinc-500">/month</span>
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

const useConsentPaymentPrescription = (): {
  prescription?: Rx;
  isLoading: boolean;
} => {
  // type = questionnaire name
  const { type } = useParams<{
    type?: string;
  }>();
  const marketplaceQuery = useMarketplace();

  const prescription = useMemo(() => {
    if (!type || !marketplaceQuery.data?.prescriptions?.length) {
      return undefined;
    }

    return marketplaceQuery.data.prescriptions.find((rx) => {
      // '/questionnaire/{name'
      return rx.url?.includes(type) ?? false;
    });
  }, [marketplaceQuery.data?.prescriptions, type]);

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
