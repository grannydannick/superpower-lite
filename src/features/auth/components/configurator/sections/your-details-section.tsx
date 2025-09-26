import { Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input/input';

import { AtHomeNoticeAlert } from '@/components/shared/at-home-notice-section';
import { ConsentInfo } from '@/components/shared/consent-info';
import { AnimatedCheckbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DatetimePicker, Input } from '@/components/ui/input';
import { H3 } from '@/components/ui/typography';
import { useCheckoutContext } from '@/features/auth/stores';
import { useGetServiceability } from '@/features/orders/api';
import { NotServiceableDialog } from '@/features/users/components/dialogs/not-serviceable-dialog';
import { useAnalytics } from '@/hooks/use-analytics';
import { RegisterInput } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { NotServiceableReason } from '@/types/api';
import { getState } from '@/utils/verify-state-from-postal';

export const YourDetailsSection = () => {
  const [nonServiceabilityReason, setNonServiceabilityReason] = useState<
    NotServiceableReason | undefined
  >(undefined);

  const getServiceabilityMutation = useGetServiceability();
  const { track } = useAnalytics();

  const form = useFormContext<RegisterInput>();
  const processing = useCheckoutContext((s) => s.processing);
  const postalCode = form.watch('postalCode');

  const handleZipCodeCheck = async (): Promise<boolean> => {
    const response = await getServiceabilityMutation.mutateAsync({
      data: {
        zipCode: postalCode,
        collectionMethod: ['NY', 'NJ', 'AZ'].includes(
          getState(postalCode)?.state ?? '',
        )
          ? 'AT_HOME'
          : 'IN_LAB',
      },
    });

    if (response.serviceable === false) {
      track('register_not_serviceable', {
        postal_code: postalCode,
        state: getState(postalCode),
        reason: response.reason,
      });

      setNonServiceabilityReason(response.reason);
      return false;
    }

    return true;
  };

  const handleNonServiceableClose = () => {
    setNonServiceabilityReason(undefined);
    form.setValue('postalCode', '');
  };

  useEffect(() => {
    if (postalCode.length !== 5) return;

    handleZipCodeCheck();
  }, [postalCode]);

  return (
    <>
      <NotServiceableDialog
        reason={nonServiceabilityReason}
        onClick={handleNonServiceableClose}
      />
      <div className="space-y-6">
        <div className="space-y-2">
          <H3 className="text-[#1E1E1E]">Your Details</H3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        variant={fieldState.error ? 'error' : 'default'}
                        placeholder="Your email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled
                        {...field}
                      />
                      <Lock className="absolute right-5 top-1/2 size-4 -translate-y-1/2 cursor-not-allowed text-zinc-300" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input
                        variant={fieldState.error ? 'error' : 'default'}
                        autoComplete="off"
                        placeholder="ZIP Code"
                        type="text"
                        inputMode="numeric"
                        maxLength={5}
                        {...field}
                        onInput={(e) => {
                          const input = e.currentTarget;
                          input.value = input.value
                            .replace(/\D/g, '')
                            .slice(0, 5);
                          field.onChange(input.value); // keep RHF in sync
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                          }
                        }}
                        {...field}
                      />
                    </FormControl>
                    {fieldState.error ? (
                      <FormMessage />
                    ) : (
                      <AtHomeNoticeAlert postalCode={field.value} />
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <DatetimePicker
                        {...field}
                        variant={fieldState.error ? 'error' : 'default'}
                        className={cn(
                          processing ? 'pointer-events-none opacity-50' : null,
                        )}
                        format={[['months', 'days', 'years'], []]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <PhoneInput
                      {...field}
                      placeholder="Your phone number"
                      defaultCountry="US"
                      variant={fieldState.error ? 'error' : 'default'}
                      // 14 because 10 + "(", ")", " " and "-"
                      maxLength={14}
                      inputComponent={Input}
                      disabled={processing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consent"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="group flex items-start space-x-2">
                    <div
                      className={cn(
                        'flex aspect-square size-5 items-center justify-center rounded-md border',
                        fieldState.error
                          ? 'border-pink-700 bg-pink-50 focus-within:ring-1 focus-within:ring-pink-700 transition-none duration-0'
                          : 'transition-all duration-150',
                        !fieldState.error &&
                          (field.value === true
                            ? 'border-zinc-900 bg-black'
                            : 'border-zinc-200 group-hover:border-zinc-300 group-hover:bg-zinc-100'),
                      )}
                    >
                      <AnimatedCheckbox
                        id="terms"
                        className="data-[state=checked]:text-white"
                        variant={fieldState.error ? 'error' : 'default'}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={processing}
                      />
                    </div>

                    <ConsentInfo htmlFor="terms" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </>
  );
};
