import { useMemo } from 'react';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Body1, Body2 } from '@/components/ui/typography';
import { useHasCredit } from '@/features/orders/hooks';
import { useOrder } from '@/features/orders/stores/order-store';
import { getCollectionMethods } from '@/features/orders/utils/get-collection-methods';
import { CurrentAddressEditSuggestion } from '@/features/users/components/current-address-card';
import { useUser } from '@/lib/auth';
import { useAuthorization } from '@/lib/authorization';
import { cn } from '@/lib/utils';
import { CollectionMethodType } from '@/types/api';

export const CreateOrderPhlebotomyLocationSelector = () => {
  const {
    collectionMethod,
    service,
    updateCollectionMethod,
    updateLocation,
    updateSlot,
    updateTz,
  } = useOrder((s) => s);
  const { data: user } = useUser();
  const { checkAdminActorAccess } = useAuthorization();
  const { credit } = useHasCredit({
    serviceName: service.name,
  });
  const isAdmin = checkAdminActorAccess();

  const handleOptionClick = (optionValue: CollectionMethodType) => {
    updateCollectionMethod(
      collectionMethod === optionValue ? null : optionValue,
    );
    updateLocation(null);
    updateSlot(null);
    updateTz(null);
  };

  // Check if user has an AT_HOME credit from a draft order
  const options = useMemo(
    () => getCollectionMethods(service, user?.primaryAddress, credit, isAdmin),
    [service, user?.primaryAddress, isAdmin, credit],
  );

  return (
    <RadioGroup
      defaultValue={collectionMethod ?? 'AT_HOME'}
      className="flex flex-col"
    >
      {options.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-zinc-500">No primary address found.</p>
          <CurrentAddressEditSuggestion />
        </div>
      ) : null}
      {options.map((option) => (
        <div
          key={option.value}
          className={cn(
            'flex space-x-4 border rounded-2xl px-4 py-5 flex-1 bg-white',
            collectionMethod === option.value
              ? 'border-vermillion-900 shadow-lg shadow-vermillion-900/10'
              : 'border-zinc-200 hover:bg-zinc-50',
            option.disabled ? 'opacity-50' : null,
          )}
          role="presentation"
          onClick={() =>
            option.disabled ? undefined : handleOptionClick(option.value)
          }
        >
          <RadioGroupItem
            value={option.value}
            checked={collectionMethod === option.value}
            disabled={option.disabled}
            variant="vermillion"
          />
          <Label htmlFor={option.value} className="w-full">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Body1>{option.name}</Body1>
                <Body2 className="text-balance text-zinc-500 sm:text-base">
                  {option.description}
                </Body2>
              </div>
              {option.pricingText ? <Body1>{option.pricingText}</Body1> : null}
            </div>
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};
