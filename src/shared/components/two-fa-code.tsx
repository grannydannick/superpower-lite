import { zodResolver } from '@hookform/resolvers/zod';
import { Check, PhoneIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { Body1, H1 } from '@/components/ui/typography';
import { OnboardingInput } from '@/features/onboarding/components/onboarding-input';
import { cn } from '@/lib/utils';
import {
  useSendOtp,
  useVerifyOtp,
  VerifyOtpInput,
  verifyOtpInputSchema,
} from '@/shared/api';

const TwoFaCode = ({
  phone,
  closeOPT,
  successHandler,
}: {
  phone: string;
  closeOPT: () => void;
  successHandler: () => void;
}) => {
  const verifyOTPMutation = useVerifyOtp({
    mutationConfig: {
      onSuccess: () => {
        // timeout to show user that code worked
        setTimeout(() => {
          successHandler();
        }, 2000); // 2000 milliseconds = 2 seconds
      },
      onError: () => {
        form.setError('code', {
          type: 'custom',
          message: `Incorrect code, please try again`,
        });
      },
    },
  });

  const sendOTPMutation = useSendOtp({
    mutationConfig: {
      onSuccess: () => {},
    },
  });

  const form = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpInputSchema),
    defaultValues: {
      phone: phone,
      code: '',
    },
  });

  const currentOTP = form.watch('code');
  const currentOTPError = form.formState.errors.code;

  useEffect(() => {
    if (currentOTP.length === 5) {
      form.handleSubmit((data) => verifyOTPMutation.mutate({ data }))();
    }
  }, [currentOTP]);

  return (
    <section
      id="main"
      className="mx-auto flex max-w-md flex-col gap-y-12 text-center"
    >
      <div className="space-y-12">
        <div className="space-y-3">
          <H1 className="text-white">
            We sent you <br className="hidden md:block" />a code!
          </H1>
          <p className="text-sm text-white opacity-80 md:text-base">
            We&apos;ll need this to contact you for booking at-home
            <br /> appointments.
          </p>
        </div>
        <div>
          <Form {...form}>
            <form className="mx-auto max-w-md space-y-12">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <OnboardingInput
                        disabled
                        placeholder="Phone number"
                        icon={<PhoneIcon className="size-4" />}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex w-full justify-center">
                        <InputOTP maxLength={5} {...field}>
                          <InputOTPGroup>
                            {[0, 1, 2, 3, 4].map((index) => (
                              <InputOTPSlot
                                key={index}
                                index={index}
                                className={cn(
                                  'bg-white/5 w-14 sm:w-20',
                                  currentOTPError && 'border border-[#E8FC00]',
                                )}
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormMessage className="text-start text-xs text-[#E8FC00]" />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        {verifyOTPMutation.isSuccess ? (
          <div className="flex items-center justify-center gap-2.5 px-8 py-4">
            <Check className="size-4 text-white" />
            <Body1 className="text-white">Verified!</Body1>
          </div>
        ) : (
          <div className="flex flex-col">
            <Button
              variant="outline"
              className="group text-white group-hover:text-black"
              onClick={() => {
                sendOTPMutation.mutate({
                  data: { phone: form.getValues().phone, toc: true },
                });
              }}
            >
              {sendOTPMutation.isPending ? (
                <Spinner
                  variant="light"
                  className="group size-6 group-hover:text-black"
                />
              ) : (
                'Resend code'
              )}
            </Button>
            <Button
              variant="ghost"
              className="text-base font-normal text-white hover:text-white/90"
              onClick={closeOPT}
            >
              Try another phone number
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export { TwoFaCode };
