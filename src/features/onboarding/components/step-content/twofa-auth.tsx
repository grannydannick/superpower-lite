import { zodResolver } from '@hookform/resolvers/zod';
import { AsYouType } from 'libphonenumber-js';
import { PhoneIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { OnboardingLayout } from '@/components/layouts/onboarding-layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { H1 } from '@/components/ui/typography';
import {
  SendOtpInput,
  sendOtpInputSchema,
  useSendOtp,
} from '@/features/auth/api';
import { OnboardingInput } from '@/features/onboarding/components/onboarding-input';
import { TwoFaCode } from '@/features/onboarding/components/two-fa-code';

export const TwoFaAuth = () => {
  const [showOTP, setShowOTP] = useState(false);

  const sendOTPMutation = useSendOtp({
    mutationConfig: {
      onSuccess: () => {
        setShowOTP(true);
      },
    },
  });

  const form = useForm<SendOtpInput>({
    resolver: zodResolver(sendOtpInputSchema),
    defaultValues: {
      phone: '',
      toc: false,
    },
  });

  const onSubmit = (data: SendOtpInput) => {
    sendOTPMutation.mutate({ data });
  };

  const currentPhoneInput = form.watch('phone');
  const asYouType = new AsYouType('US');
  asYouType.input(currentPhoneInput);

  const handleOnInput = (event: React.FormEvent<HTMLInputElement>) => {
    asYouType.reset();
    const value = event.currentTarget.value;
    event.currentTarget.value = asYouType.input(value);
  };

  if (showOTP) {
    return (
      <TwoFaCode phone={form.watch('phone')} close={() => setShowOTP(false)} />
    );
  }

  return (
    <section
      id="main"
      className="mx-auto flex max-w-lg flex-col gap-y-12 text-center"
    >
      <div className="space-y-12">
        <div className="space-y-3">
          <H1 className="text-white">
            What&apos;s your primary
            <br />
            phone number?
          </H1>
          <p className="text-sm text-white opacity-80 md:text-base">
            We&apos;ll need this to contact you for booking
            <br />
            at-home appointments.
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto max-w-md space-y-12"
          >
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <OnboardingInput
                      onInput={handleOnInput}
                      placeholder="Phone number"
                      icon={<PhoneIcon className="size-4" />}
                      {...field}
                    />
                  </FormControl>
                  {/*<FormMessage />*/}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="toc"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="size-5 rounded-[4px] border-white data-[state=checked]:bg-zinc-50 data-[state=checked]:text-zinc-950"
                    />
                  </FormControl>

                  <FormLabel className="!m-0 text-start text-sm text-white opacity-80">
                    I agree to the terms & conditions and to receive SMS
                    messages. I give Superpower permission to send me my health
                    information via SMS. I understand that I may opt out at any
                    time and that carrier data & messaging fees might apply.
                  </FormLabel>
                </FormItem>
              )}
            />
            <Button
              disabled={!asYouType.getNumber()?.isValid() ?? true}
              type="submit"
              className="w-full"
              variant="white"
            >
              {sendOTPMutation.isPending ? (
                <Spinner variant="primary" className="size-6" />
              ) : (
                'Send code'
              )}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
};

export const TwoFAStep = () => (
  <OnboardingLayout className="bg-female-spotlight" title="2FA">
    <TwoFaAuth />
  </OnboardingLayout>
);
