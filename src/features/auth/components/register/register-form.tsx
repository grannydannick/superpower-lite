import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input/input';

import { AtHomeNoticeSection } from '@/components/shared/at-home-notice-section';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DatetimePicker, Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2, H3 } from '@/components/ui/typography';
import { AuthInput } from '@/features/auth/components/auth-input';
import { PrimaryAddressForm } from '@/features/auth/components/primary-address-form';
import { useGetServiceability } from '@/features/orders/api';
import { useAddToWaitlist } from '@/features/users/api/add-to-waitlist';
import { useGeocode } from '@/features/users/api/geocode';
import { NotServiceableDialog } from '@/features/users/components/dialogs/not-serviceable-dialog';
import { SuggestedAddressDialog } from '@/features/users/components/dialogs/suggested-address-dialog';
import { RegisterInput, registerInputSchema, useRegister } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { FormAddressInput } from '@/types/address';
import { NotServiceableReason } from '@/types/api';
import { isSameFormAddressInput } from '@/utils/format';
import { addressFromGoogleComponents } from '@/utils/google';

type RegisterFormProps = {
  onSuccess: () => void;
};

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [reason, setReason] = useState<NotServiceableReason | undefined>(
    undefined,
  );
  const [suggestedAddress, setSuggestedAddress] = useState<
    FormAddressInput | undefined
  >(undefined);

  const registerMutation = useRegister({ onSuccess });
  const getServiceabilityMutation = useGetServiceability();
  const geocodeMutation = useGeocode({
    mutationConfig: {
      onError: () => {
        toast.error('Server error during address validation.');
      },
    },
  });
  const waitlistMutation = useAddToWaitlist();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(
      step === 1
        ? registerInputSchema.pick({
            email: true,
            phone: true,
            password: true,
          })
        : registerInputSchema,
    ),
  });

  const handleNext = form.handleSubmit(() => setStep(2));

  const onSubmit = async (data: RegisterInput) => {
    const { results, status } = await geocodeMutation.mutateAsync({
      data: data.address,
    });

    if (status === 'ZERO_RESULTS') {
      toast('Invalid address provided.');
      return;
    }
    const address = addressFromGoogleComponents(
      results?.[0]?.address_components ?? [],
    );

    if (!isSameFormAddressInput(address, data.address)) {
      setSuggestedAddress(address);
      return;
    }

    const response = await getServiceabilityMutation.mutateAsync({
      data: {
        zipCode: data.address.postalCode,
        // we should ideally also check for AT_HOME
        collectionMethod: 'IN_LAB',
      },
    });

    if (response.serviceable === false) {
      setReason(response.reason);
      // create klaviyo profile
      waitlistMutation.mutate({
        data: {
          firstName: data.firstName,
          phone: data.phone,
          email: data.email,
          state: data.address.state,
        },
      });
      return;
    }

    await registerMutation.mutateAsync(data);
  };

  // we want enter to handle the next step or submit the form if typing in an input
  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      const isInputFocused = document.activeElement instanceof HTMLInputElement;

      if (event.key === 'Enter' && isInputFocused) {
        if (step === 1) {
          handleNext();
        }
      }
    };

    document.addEventListener('keydown', keyDownHandler);
    return () => document.removeEventListener('keydown', keyDownHandler);
  }, [step, handleNext]);

  return (
    <div className="mx-auto w-full space-y-6 lg:max-w-2xl">
      {suggestedAddress ? (
        <SuggestedAddressDialog
          suggestedAddress={suggestedAddress}
          onAccept={() => {
            form.setValue('address', suggestedAddress);
            setSuggestedAddress(undefined);
          }}
          onReject={() => {
            setSuggestedAddress(undefined);
          }}
        />
      ) : null}
      <NotServiceableDialog
        reason={reason}
        onClick={() => setReason(undefined)}
      />
      <div className="space-y-4">
        {step === 2 ? (
          <Button variant="ghost" size="icon" onClick={() => setStep(1)}>
            <ChevronLeft size={14} className="text-zinc-500" />
            <Body2 className="text-zinc-500">Account Details</Body2>
          </Button>
        ) : null}
        <H3 className="text-zinc-900">
          {step === 1
            ? 'Member signup'
            : 'Let’s set up your Superpower account'}
        </H3>
        {step === 1 ? (
          <Body1 className="text-zinc-500">
            It’s time to superpower your health. Get 100+ lab tests, track your
            results overtime and take control of your health.
          </Body1>
        ) : null}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          {step === 1 ? (
            <Step1 form={form} onNext={handleNext} />
          ) : (
            <Step2
              form={form}
              isPending={
                registerMutation.isPending ||
                getServiceabilityMutation.isPending
              }
            />
          )}
        </form>
      </Form>
    </div>
  );
};

const Step1 = ({
  form,
  onNext,
}: {
  form: UseFormReturn<RegisterInput>;
  onNext: () => void;
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email <span className="text-vermillion-900">*</span>
              </FormLabel>
              <FormControl>
                <AuthInput
                  variant="individual"
                  border="bottom"
                  placeholder="name@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  icon={<Mail className="size-4 text-zinc-400" />}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Phone <span className="text-vermillion-900">*</span>
              </FormLabel>
              <FormControl>
                <PhoneInput
                  {...field}
                  placeholder="(555) 123-9876"
                  defaultCountry="US"
                  // 14 because 10 + "(", ")", " " and "-"
                  maxLength={14}
                  inputComponent={Input}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="password">
                Password <span className="text-vermillion-900">*</span>
              </FormLabel>
              <FormControl>
                <AuthInput
                  variant="individual"
                  border="bottom"
                  id="password"
                  placeholder="********"
                  type="password"
                  autoCapitalize="off"
                  autoComplete="new-password"
                  autoCorrect="off"
                  aria-label="Password"
                  className="scroll-pr-12 truncate pr-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <Button type="button" onClick={onNext}>
        Continue
      </Button>
    </div>
  );
};

const Step2 = ({
  form,
  isPending,
}: {
  form: UseFormReturn<RegisterInput>;
  isPending: boolean;
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                First Name <span className="text-vermillion-900">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Legal first name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Last Name <span className="text-vermillion-900">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Legal last name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Biological Sex <span className="text-vermillion-900">*</span>
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    className={cn(
                      `bg-white px-6 py-4`,
                      field.value ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    <SelectValue placeholder="Select biological sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE" data-testid="gender-option-male">
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
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Date of Birth <span className="text-vermillion-900">*</span>
              </FormLabel>
              <FormControl>
                <DatetimePicker
                  {...field}
                  format={[['months', 'days', 'years'], []]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="col-span-full lg:col-span-2">
          <PrimaryAddressForm form={form} />
        </div>
      </div>
      <AtHomeNoticeSection fallbackState={form.getValues('address.state')} />
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <TransactionSpinner className="flex justify-center" />
        ) : (
          'Register'
        )}
      </Button>
    </div>
  );
};
