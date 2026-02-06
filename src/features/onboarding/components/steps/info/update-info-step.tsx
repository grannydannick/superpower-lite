import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { SplitScreenLayout } from '@/components/layouts';
import { AvailableBiomarkersDialog } from '@/components/shared/available-biomarkers';
import {
  BackupPaymentMethod,
  useNeedsBackupPaymentMethod,
} from '@/components/shared/backup-payment-method';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input, NumericInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body2, H3, H4 } from '@/components/ui/typography';
import { US_STATES } from '@/const';
import { useCheckout } from '@/features/auth/hooks/use-checkout';
import { useHasClaimedBenefits } from '@/features/b2b/api';
import { useCreateAddress, useEditAddress } from '@/features/users/api';
import { useUpdateUser } from '@/features/users/api/update-user';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { AddressInput, formAddressInputSchema } from '@/types/address';

import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';

import { OnboardingCard } from './onboarding-membership-card';

const FEATURES = [
  '100+ biomarkers',
  'A personalized plan that evolves with you',
  'Insights across core areas of health',
  'Unlock your biological age',
  'A medical team in your pocket to message 24/7',
  'An ecosystem of the best diagnostics, supplements, Rx’s and more',
];

const checklistContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
} as const;

const checklistItem = {
  hidden: { opacity: 0, y: 6, filter: 'blur(1px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.35, ease: 'easeOut' },
  },
} as const;

// forcing all fields to be present here
const REQUIRED_MSG = 'This is required.';
// Regex taken from Junction API docs - https://docs.junction.com/lab/workflow/order-requirements#patient-name-validation
const NAME_REGEX =
  /^([a-zA-Z0-9]{1})([a-zA-Z0-9-.,']*(\s[a-zA-Z0-9-.,']+)*[a-zA-Z0-9-.,']?)$/;
export const updateUserInputSchema = z.object({
  firstName: z
    .string({ required_error: REQUIRED_MSG })
    .min(1, REQUIRED_MSG)
    .min(2, 'Please enter your full first name.')
    .regex(NAME_REGEX, 'Must contain only English letters.'),
  lastName: z
    .string({ required_error: REQUIRED_MSG })
    .min(1, REQUIRED_MSG)
    .min(2, 'Please enter your full last name.')
    .regex(NAME_REGEX, 'Must contain only English letters.'),
  gender: z.enum(['MALE', 'FEMALE'], { required_error: REQUIRED_MSG }),
  address: formAddressInputSchema,
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

const UpdateInfoContent = () => {
  const { data: user } = useUser();
  const { next } = useOnboardingNavigation();
  const { data: claimedBenefitsData } = useHasClaimedBenefits();
  const hasClaimedBenefits = claimedBenefitsData?.hasClaimedBenefits ?? false;
  const userHasGenderSet = user?.gender === 'MALE' || user?.gender === 'FEMALE';
  const { needsBackup } = useNeedsBackupPaymentMethod();
  const {
    handleAddPaymentMethod,
    stripeError,
    setStripeError,
    isMutationPending,
  } = useCheckout({
    postalCode: user?.primaryAddress?.postalCode || '',
  });

  const form = useForm<UpdateUserInput>({
    shouldUnregister: false,
    mode: 'onChange',
    resolver: zodResolver(updateUserInputSchema),
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      gender: userHasGenderSet ? (user.gender as 'MALE' | 'FEMALE') : undefined,
      address: user?.primaryAddress
        ? {
            line1: user.primaryAddress.line?.[0] ?? undefined,
            line2: user.primaryAddress.line?.[1] ?? undefined,
            postalCode: user.primaryAddress.postalCode,
            city: user.primaryAddress.city,
            state: user.primaryAddress.state,
          }
        : undefined,
    },
  });

  useEffect(() => {
    if (userHasGenderSet) {
      form.setValue('gender', user.gender as 'MALE' | 'FEMALE');
    }
  }, [userHasGenderSet, user?.gender, form]);

  const updateUserMutation = useUpdateUser();
  const addAddressMutation = useCreateAddress();
  const editAddressMutation = useEditAddress();

  const onSubmit = async (data: UpdateUserInput) => {
    if (!data.address) return;

    // If user needs backup payment method (and hasn't claimed a B2B benefit), add it first
    if (needsBackup && !hasClaimedBenefits) {
      const paymentMethodAdded = await handleAddPaymentMethod();
      if (!paymentMethodAdded) {
        return;
      }
    }

    const line = [data.address.line1];

    if (data.address?.line2) {
      line.push(data.address.line2);
    }

    const address: AddressInput = {
      line: line,
      city: data.address.city,
      state: data.address.state,
      postalCode: data.address.postalCode,
      use: 'home',
    };

    // then update fields:
    await updateUserMutation.mutateAsync({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
      },
    });

    // first add or edit address if already exists:
    user?.primaryAddress
      ? await editAddressMutation.mutateAsync({
          id: user.primaryAddress.id,
          data: address,
        })
      : await addAddressMutation.mutateAsync({ data: address });

    next();
  };

  const isLoading =
    addAddressMutation.isPending ||
    updateUserMutation.isPending ||
    isMutationPending;

  return (
    <>
      <div className="mx-auto w-full space-y-8 px-4 md:px-8 lg:max-w-2xl">
        <SuperpowerLogo />
        <H3>Let’s set up your Superpower account</H3>

        <Form {...form}>
          <form className="space-y-1" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Legal first name"
                          variant={fieldState.error ? 'error' : 'default'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Legal last name"
                          variant={fieldState.error ? 'error' : 'default'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {!userHasGenderSet && (
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Biological Sex</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger
                            className={cn(
                              ` px-6 py-4`,
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
              <PrimaryAddressForm />
              {!hasClaimedBenefits && (
                <BackupPaymentMethod
                  isLoading={isLoading}
                  stripeError={stripeError}
                  setStripeError={setStripeError}
                />
              )}
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? <TransactionSpinner /> : 'Update'}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="hidden min-h-0 w-full flex-col overflow-auto rounded-3xl border border-zinc-200 bg-white p-10 lg:sticky lg:top-8 lg:flex lg:h-[calc(100svh-4rem)] lg:max-h-[calc(100svh-4rem)]">
        <div className="overscroll-auto">
          <div className="mx-auto my-28 flex items-center justify-center">
            <OnboardingCard />
          </div>

          <Card className="space-y-4 p-6 shadow-none">
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="show"
              variants={checklistContainer}
            >
              <motion.div variants={checklistItem}>
                <H4>Here’s what you have unlocked:</H4>
              </motion.div>
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2.5"
                  variants={checklistItem}
                >
                  <Check
                    size={20}
                    strokeWidth={2}
                    className="shrink-0 text-vermillion-900"
                  />
                  <Body2 className=" text-zinc-700">{feature}</Body2>
                </motion.div>
              ))}
              <motion.div variants={checklistItem}>
                <AvailableBiomarkersDialog>
                  <Button
                    variant="ghost"
                    className="gap-1 px-0 py-2 text-sm text-zinc-500"
                  >
                    View all tested 100+ biomarkers
                    <ArrowRight size={16} />
                  </Button>
                </AvailableBiomarkersDialog>
              </motion.div>
            </motion.div>
          </Card>
        </div>
      </div>
    </>
  );
};

const PrimaryAddressForm = () => {
  const form = useFormContext<UpdateUserInput>();

  const [input, setInput] = useState('');
  const [manualEntry, setManualEntry] = useState(false);
  const address = form.watch('address');

  if (address || manualEntry) {
    return <FullPrimaryAddressForm />;
  }

  const hasError = form.formState.errors.address;
  // User typed something but didn't select from dropdown
  const hasUnselectedInput = input.trim().length > 0 && !address;

  const errorMessage =
    hasError && hasUnselectedInput
      ? 'Please select an address from the suggestions.'
      : 'Address is required.';

  const handleManualEntry = () => {
    console.warn('User clicked manual address entry');
    setManualEntry(true);
  };

  return (
    // note: intentionally leaving some fields blank here so we display it "one time"
    <div className="mt-2 flex flex-col gap-4">
      <Label className="text-secondary" htmlFor="line1">
        Where should we provide your Superpower services?
      </Label>
      <div>
        <AddressAutocomplete
          onChange={(e) => {
            setInput(e.target.value);
          }}
          value={input}
          onBlur={() => {
            form.trigger('address');
          }}
          name="line1"
          variant={hasError ? 'error' : 'default'}
          onFormSubmit={(address) => {
            form.setValue('address', address, { shouldValidate: true });
          }}
        />
        <Button
          type="button"
          variant="ghost"
          className="w-fit px-0 text-sm"
          onClick={handleManualEntry}
        >
          Can&apos;t find your address?
        </Button>
      </div>
      {hasError ? (
        <p className="text-sm font-medium text-destructive">
          <span className="flex items-center gap-3">
            <AlertCircle className="size-4 shrink-0 text-destructive" />
            <span>{errorMessage}</span>
          </span>
        </p>
      ) : null}
    </div>
  );
};

const FullPrimaryAddressForm = () => {
  const form = useFormContext<UpdateUserInput>();

  return (
    <div className="flex flex-col gap-x-8 gap-y-4">
      <FormField
        control={form.control}
        name="address.line1"
        render={({ field, fieldState }) => {
          return (
            <FormItem>
              <FormLabel>Address Line 1</FormLabel>
              <FormControl>
                <AddressAutocomplete
                  onFormSubmit={(data) => form.setValue('address', data)}
                  placeholder="Street address"
                  {...field}
                  variant={fieldState.error ? 'error' : 'default'}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <FormField
        control={form.control}
        name="address.line2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address Line 2</FormLabel>
            <FormControl>
              <Input
                autoComplete="off"
                placeholder="Apartment, suite, etc. (optional)"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
        <FormField
          control={form.control}
          name="address.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input autoComplete="off" placeholder="City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address.state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-[58px]">
                      <SelectValue placeholder="State" asChild={false} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="text-zinc-600">
                    {US_STATES.map((state) => (
                      <SelectItem value={state.value} key={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address.postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ZIP Code</FormLabel>
              <FormControl>
                <NumericInput
                  placeholder="ZIP Code"
                  maxLength={5}
                  maxDigits={5}
                  value={field.value}
                  onBlur={field.onBlur}
                  name={field.name}
                  onChange={(value) => field.onChange(value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export const UpdateInfoStep = () => (
  <SplitScreenLayout title="Update Info" className="bg-zinc-50">
    <UpdateInfoContent />
  </SplitScreenLayout>
);
