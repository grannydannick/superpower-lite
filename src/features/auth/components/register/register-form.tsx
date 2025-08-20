import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronLeft, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input/input';

import { ImageWithWithBlockLayout } from '@/components/layouts';
import { BlockWithFaqLayout } from '@/components/layouts/block-with-faq-layout';
import { AtHomeNoticeSection } from '@/components/shared/at-home-notice-section';
import { LabeledCheckbox } from '@/components/shared/labeled-checkbox';
import { TestimonialCarousel } from '@/components/shared/testimonials/components/testimonial-carousel';
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
import { DatetimePicker, Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2, H1 } from '@/components/ui/typography';
import { AuthInput } from '@/features/auth/components/auth-input';
import { PrimaryAddressForm } from '@/features/auth/components/primary-address-form';
import {
  trackUserCreated,
  trackLead,
} from '@/features/auth/utils/registration-analytics';
import { useGetServiceability } from '@/features/orders/api';
import { useKlaviyoSubscribe } from '@/features/users/api';
import { NotServiceableDialog } from '@/features/users/components/dialogs/not-serviceable-dialog';
import { useAnalytics } from '@/hooks/use-analytics';
import { RegisterInput, registerInputSchema, useRegister } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { NotServiceableReason } from '@/types/api';
import { getCollectionMethodForState } from '@/utils/serviceability';

type RegisterFormProps = {
  onSuccess: () => void;
};

const REGISTER_FEATURES = [
  '100+ biomarkers tested',
  'A personalized plan that evolves with you',
  '17 health scores and your biological age',
  'A medical team in your pocket you can message 24/7',
  'An ecosystem of the best diagnostics, supplements, Rx’s and more',
];

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [reason, setReason] = useState<NotServiceableReason | undefined>(
    undefined,
  );

  const registerMutation = useRegister({ onSuccess });
  const getServiceabilityMutation = useGetServiceability();
  const klaviyoSubscribeMutation = useKlaviyoSubscribe();
  const { track, identify } = useAnalytics();

  const form = useForm<RegisterInput>({
    shouldUnregister: false,
    resolver: zodResolver(
      step === 1
        ? registerInputSchema.pick({
            email: true,
          })
        : registerInputSchema,
    ),
  });

  const handleNext = () => setStep(2);
  const handlePrev = () => setStep(1);

  const onSubmit = async (data: RegisterInput) => {
    const collectionMethod = getCollectionMethodForState(data.address.state);

    const response = await getServiceabilityMutation.mutateAsync({
      data: {
        zipCode: data.address.postalCode,
        collectionMethod,
      },
    });

    if (response.serviceable === false) {
      track('register_not_serviceable', {
        postal_code: data.address.postalCode,
        state: data.address.state,
        reason: response.reason,
      });

      await klaviyoSubscribeMutation.mutateAsync({
        data: {
          type: 'waitlist',
          firstName: data.firstName,
          phone: data.phone,
          email: data.email,
          state: data.address.state,
        },
      });
      setReason(response.reason);
      return;
    }

    const user = await registerMutation.mutateAsync(data);

    // Track user creation in GTM
    if (user) {
      trackUserCreated({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      identify(user.id, {
        $set: {
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          city: data.address.city,
          state: data.address.state,
          postal_code: data.address.postalCode,
          gender: data.gender,
          birthday: data.dateOfBirth.toISOString(),
          birthday_year: data.dateOfBirth.getFullYear(),
        },
      });

      track('user_registered');
    }
  };

  return (
    <>
      <NotServiceableDialog
        reason={reason}
        onClick={() => setReason(undefined)}
      />
      <Form {...form}>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && step === 2) {
              e.preventDefault();
              form.trigger(); // trigger validation to show errors
            }
          }}
        >
          {step === 1 ? (
            <ImageWithWithBlockLayout
              title="Email"
              progress={{ current: step, total: 3 }}
            >
              <Step1 onNext={handleNext} />
            </ImageWithWithBlockLayout>
          ) : (
            <BlockWithFaqLayout
              title="Finish registration"
              progress={{ current: step, total: 3 }}
            >
              <Step2
                isPending={
                  registerMutation.isPending ||
                  getServiceabilityMutation.isPending
                }
                onPrev={handlePrev}
              />
            </BlockWithFaqLayout>
          )}
        </form>
      </Form>
    </>
  );
};

const Step1 = ({ onNext }: { onNext: () => void }) => {
  const form = useFormContext<RegisterInput>();
  const { track } = useAnalytics();

  const klaviyoSubscribeMutation = useKlaviyoSubscribe();

  const email = form.watch('email');

  const handleNext = async () => {
    const isStepValid = await form.trigger();

    if (isStepValid) {
      const email = form.getValues('email');

      // Track Lead event with email and UTM data
      trackLead({ email });

      // Track registration started
      track('registration_started', {
        $set: {
          email,
        },
      });

      await klaviyoSubscribeMutation.mutateAsync({
        data: {
          email,
          type: 'leads',
        },
      });
      onNext();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <H1 className="text-3xl md:text-5xl">Member signup</H1>
        <Body1 className="whitespace-pre-line text-zinc-500">
          {`It all starts with 100+ lab tests.
          All for $199 per year with no hidden fees.`}
        </Body1>
      </div>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <AuthInput
                  variant="individual"
                  border="bottom"
                  placeholder="Your email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  icon={<Mail className="size-4 text-zinc-400" />}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleNext();
                    }
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <Button
        type="button"
        onClick={handleNext}
        disabled={klaviyoSubscribeMutation.isPending || !email}
      >
        {klaviyoSubscribeMutation.isPending ? (
          <TransactionSpinner className="flex justify-center" />
        ) : (
          'Get Started'
        )}
      </Button>
      <div>
        <Card className="space-y-4 border border-zinc-200 bg-white p-6 shadow-md">
          {REGISTER_FEATURES.map((feature, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Check
                size={20}
                strokeWidth={2}
                className="shrink-0 text-vermillion-900"
              />
              <Body2 className=" text-zinc-700">{feature}</Body2>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

const Step2 = ({
  isPending,
  onPrev,
}: {
  isPending: boolean;
  onPrev: () => void;
}) => {
  const form = useFormContext<RegisterInput>();
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2.5">
        <Button variant="ghost" size="icon" onClick={onPrev} className="gap-2">
          <ChevronLeft size={14} className="text-zinc-500" />
          <Body2 className="text-zinc-500">Email</Body2>
        </Button>
        <H1 className="text-3xl text-zinc-900 md:text-5xl">
          Let’s set up your Superpower account
        </H1>
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
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
              <FormLabel>Last Name</FormLabel>
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
              <FormLabel>Biological Sex</FormLabel>
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
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
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormControl>
                <AuthInput
                  variant="individual"
                  border="bottom"
                  id="password"
                  placeholder="Your password"
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
        <div className="col-span-full lg:col-span-2">
          <PrimaryAddressForm />
        </div>
      </div>
      <AtHomeNoticeSection fallbackState={form.getValues('address.state')} />
      <FormField
        control={form.control}
        name="textMessageConsent"
        render={({ field }) => (
          <FormItem>
            <LabeledCheckbox
              id="textMessageConsent"
              checked={field.value}
              onCheckedChange={field.onChange}
              label="I agree to receive text messages from Superpower for updates,
                reminders, and health insights. Message and data rates may
                apply. Message frequency varies."
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <TransactionSpinner className="flex justify-center" />
        ) : (
          'Register'
        )}
      </Button>

      <div className="lg:hidden">
        <TestimonialCarousel darkMode={false} />
      </div>
    </div>
  );
};
