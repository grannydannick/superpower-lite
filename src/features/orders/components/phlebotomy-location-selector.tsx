import { useMemo } from 'react';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Body1, H3 } from '@/components/ui/typography';
import { useOrder } from '@/features/orders/stores/order-store';
import { getCollectionMethods } from '@/features/orders/utils/get-collection-methods';
import { cn } from '@/lib/utils';
import { CollectionMethodType } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

export const CreateOrderPhlebotomyLocationSelector = () => {
  const {
    collectionMethod,
    service,
    updateCollectionMethod,
    updateLocation,
    updateSlot,
  } = useOrder((s) => s);

  const handleOptionClick = (optionValue: CollectionMethodType) => {
    updateCollectionMethod(optionValue);
    updateLocation(null);
    updateSlot(null);
  };

  const options = useMemo(() => getCollectionMethods(service), [service]);

  return (
    <RadioGroup
      defaultValue={collectionMethod ?? 'AT_HOME'}
      className="flex flex-col sm:flex-row"
    >
      {options.map((option) => (
        <div
          key={option.value}
          className={cn(
            'flex space-x-4 border-2 rounded-3xl p-6 flex-1 bg-white',
            collectionMethod === option.value
              ? 'border-zinc-500 bg-zinc-50'
              : 'border-zinc-200 hover:bg-zinc-50',
          )}
          role="presentation"
          onClick={() => handleOptionClick(option.value)}
        >
          <RadioGroupItem
            value={option.value}
            checked={collectionMethod === option.value}
            className="mt-0.5 min-w-5"
          />
          <Label htmlFor={option.value} className="w-full">
            <div className="flex h-[140px] flex-col justify-between sm:h-[172px]">
              <div className="space-y-2 sm:space-y-3">
                <H3>{option.name}</H3>
                <Body1 className="text-sm text-zinc-500 sm:text-base">
                  {option.description}&nbsp;
                  {option.cancelationText}
                </Body1>
              </div>
              <Body1 className="text-sm  text-zinc-500 sm:text-base">
                {option.price === 0
                  ? 'Included'
                  : `+${formatMoney(option.price)}`}
              </Body1>
            </div>
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};
