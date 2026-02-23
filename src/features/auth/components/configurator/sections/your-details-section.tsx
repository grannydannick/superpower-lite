import { Lock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input/input';

import { AtHomeNoticeAlert } from '@/components/shared/at-home-notice-section';
import { ConsentInfo } from '@/components/shared/consent-info';
import { PhiMarketingConsentInfo } from '@/components/shared/phi-marketing-consent-info';
import { AnimatedCheckbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DatetimePicker, Input, NumericInput } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { H3 } from '@/components/ui/typography';
import { useCheckoutContext } from '@/features/auth/stores';
import { useGetServiceability } from '@/features/orders/api';
import { NotServiceableDialog } from '@/features/users/components/dialogs/not-serviceable-dialog';
import { useAnalytics } from '@/hooks/use-analytics';
import { RegisterInput } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { NotServiceableReason } from '@/types/api';
import { getState } from '@/utils/verify-state-from-postal';

export const YourDetailsSection = ({
  emailDisabled = true,
  showAtHomeNoticeAlert = true,
  showGenderField = false,
}: {
  emailDisabled?: boolean;
  showAtHomeNoticeAlert?: boolean;
  showGenderField?: boolean;
}) => {
  const [nonServiceabilityReason, setNonServiceabilityReason] = useState<
    NotServiceableReason | undefined
  >(undefined);

  const getServiceabilityMutation = useGetServiceability();
  const { track } = useAnalytics();

  const form = useFormContext<RegisterInput>();
  const processing = useCheckoutContext((s) => s.processing);

  const phoneDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pendingPhoneRef = useRef<string | undefined | null>(null);

  useEffect(() => {
    return () => clearTimeout(phoneDebounceRef.current);
  }, []);
  const handleNonServiceableClose = () => {
    setNonServiceabilityReason(undefined);
    form.setValue('postalCode', '');
  };

  const checkZipCode = async (zipCode: string) => {
    if (zipCode.length !== 5) return;

    const response = await getServiceabilityMutation.mutateAsync({
      data: {
        zipCode,
        collectionMethod: 'IN_LAB',
      },
    });

    if (response.serviceable === false) {
      track('register_not_serviceable', {
        postal_code: zipCode,
        state: getState(zipCode),
        reason: response.reason,
      });

      setNonServiceabilityReason(response.reason);
    }
  };

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
                        disabled={emailDisabled}
                        {...field}
                      />
                      {emailDisabled && (
                        <Lock className="absolute right-5 top-1/2 size-4 -translate-y-1/2 cursor-not-allowed text-zinc-300" />
                      )}
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
                      <NumericInput
                        variant={fieldState.error ? 'error' : 'default'}
                        placeholder="ZIP Code"
                        maxLength={5}
                        maxDigits={5}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        name={field.name}
                        onChange={(value) => {
                          field.onChange(value);
                          void checkZipCode(value);
                        }}
                      />
                    </FormControl>
                    {fieldState.error ? (
                      <FormMessage />
                    ) : (
                      showAtHomeNoticeAlert && (
                        <AtHomeNoticeAlert postalCode={field.value} />
                      )
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
            {showGenderField && (
              <FormField
                control={form.control}
                name="gender"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Biological Sex</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          className={cn(
                            `px-6 py-4`,
                            field.value
                              ? 'text-primary'
                              : fieldState.error
                                ? 'text-pink-700'
                                : 'text-muted-foreground',
                          )}
                          variant={fieldState.error ? 'error' : 'default'}
                        >
                          <SelectValue placeholder="Select biological sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="MALE"
                            data-testid="gender-option-male"
                          >
                            Male
                          </SelectItem>
                          <SelectItem
                            value="FEMALE"
                            data-testid="gender-option-female"
                          >
                            Female
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <PhoneInput
                      ref={field.ref}
                      name={field.name}
                      value={field.value}
                      onChange={(value) => {
                        pendingPhoneRef.current = value;
                        clearTimeout(phoneDebounceRef.current);
                        phoneDebounceRef.current = setTimeout(() => {
                          field.onChange(value);
                          pendingPhoneRef.current = null;
                        }, 100);
                      }}
                      onBlur={() => {
                        clearTimeout(phoneDebounceRef.current);
                        if (pendingPhoneRef.current !== null) {
                          field.onChange(pendingPhoneRef.current);
                          pendingPhoneRef.current = null;
                        }
                        field.onBlur();
                      }}
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
                          ? 'border-pink-700 bg-pink-50 transition-none duration-0 focus-within:ring-1 focus-within:ring-pink-700'
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
            <FormField
              control={form.control}
              name="phiMarketingConsent"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="group flex items-start space-x-2">
                    <div
                      className={cn(
                        'flex aspect-square size-5 items-center justify-center rounded-md border',
                        fieldState.error
                          ? 'border-pink-700 bg-pink-50 transition-none duration-0 focus-within:ring-1 focus-within:ring-pink-700'
                          : 'transition-all duration-150',
                        !fieldState.error &&
                          (field.value === true
                            ? 'border-zinc-900 bg-black'
                            : 'border-zinc-200 group-hover:border-zinc-300 group-hover:bg-zinc-100'),
                      )}
                    >
                      <AnimatedCheckbox
                        id="phi-marketing-consent"
                        className="data-[state=checked]:text-white"
                        variant={fieldState.error ? 'error' : 'default'}
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        disabled={processing}
                      />
                    </div>

                    <PhiMarketingConsentInfo htmlFor="phi-marketing-consent" />
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
