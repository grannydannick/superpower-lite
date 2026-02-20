import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Body1, Body2 } from '@/components/ui/typography';
import { CurrentAddressEditSuggestion } from '@/features/users/components/current-address-card';
import { cn } from '@/lib/utils';
import { CollectionMethodType } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

import { useCollectionMethods } from '../../hooks';
import { useScheduleStore } from '../../stores/schedule-store';

export const PhlebotomyLocationSelector = () => {
  const {
    collectionMethod,
    updateCollectionMethod,
    updateLocation,
    updateSlot,
    updateTz,
    selectedCreditIds,
  } = useScheduleStore((s) => s);

  const handleOptionClick = (optionValue: CollectionMethodType) => {
    updateCollectionMethod(
      collectionMethod === optionValue ? null : optionValue,
    );
    updateLocation(null);
    updateSlot(null);
    updateTz(null);
  };

  const options = useCollectionMethods({ creditIds: [...selectedCreditIds] });

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
            'flex flex-1 space-x-4 rounded-2xl border bg-white px-4 py-5',
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
              {option.price ? (
                <Body1>+{formatMoney(option.price)}</Body1>
              ) : null}
            </div>
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};
