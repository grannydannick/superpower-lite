import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2 } from '@/components/ui/typography';
import { usePaymentMethods } from '@/features/settings/api';
import { cn } from '@/lib/utils';
import { capitalize } from '@/utils/format';

export const DefaultPaymentMethod = ({ error }: { error?: string }) => {
  const paymentMethodsQuery = usePaymentMethods();

  const defaultPaymentMethod = paymentMethodsQuery.data?.paymentMethods.find(
    (pm) => pm.default,
  );

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex flex-col gap-3 rounded-2xl border px-8 py-6 md:mt-12',
          error ? 'border-pink-700 bg-pink-50' : 'border-zinc-200',
        )}
      >
        <Body2 className={cn(error ? 'text-pink-700' : 'text-zinc-500')}>
          Payment method
        </Body2>
        {defaultPaymentMethod ? (
          <div>
            <Body1>{capitalize(defaultPaymentMethod?.card.brand ?? '')}</Body1>
            <Body1>****{defaultPaymentMethod?.card.last4}</Body1>
          </div>
        ) : paymentMethodsQuery.isPending ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <Body1 className="text-pink-700">
            Not found, please add in settings
          </Body1>
        )}
      </div>

      {error ? <Body2 className="text-pink-700">{error}</Body2> : null}
    </div>
  );
};
