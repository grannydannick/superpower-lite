import { PhoneIcon } from 'lucide-react';
import { useState } from 'react';
import validator from 'validator';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, Input } from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

const OnboardingContentCode = (props: {
  nextStep: (() => void) | undefined;
  phone: string;
}) => {
  const schema = z.object({
    phone: z.string().min(1, 'Required'),
  });

  const onChange = (input: string) => {
    if (input.length === 5) {
      // TODO: Validate Code
      props.nextStep && props.nextStep();
    }
  };

  const onSubmit = () => {
    props.nextStep && props.nextStep();
  };

  return (
    <section
      id="main"
      className="mx-auto flex max-w-md flex-col gap-y-12 text-center"
    >
      <div className="space-y-12">
        <div className="space-y-3">
          <h1 className="text-3xl text-white md:text-6xl">
            We sent you <br className="hidden md:block" />a code!
          </h1>
          <p className="text-sm text-white opacity-80 md:text-base">
            We&apos;ll need this to contact you for booking at-home
            <br /> appointments.
          </p>
        </div>
        <div>
          <Form
            onSubmit={() => {
              onSubmit();
            }}
            schema={schema}
            className="mx-auto max-w-md space-y-12"
          >
            {({ register, formState }) => (
              <>
                <Input
                  type="phone"
                  placeholder="Phone number"
                  error={formState.errors['phone']}
                  registration={register('phone')}
                  defaultValue={props.phone}
                  disabled
                  className="h-14 rounded-xl border-white/20 bg-white/5 p-4 text-[16px] font-normal text-white caret-white placeholder:text-white placeholder:opacity-50 focus:border-white"
                  icon={<PhoneIcon className="size-4" />}
                />
                <div className="flex justify-center">
                  <InputOTP maxLength={5} onChange={onChange}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="bg-white/5" />
                      <InputOTPSlot index={1} className="bg-white/5" />
                      <InputOTPSlot index={2} className="bg-white/5" />
                      <InputOTPSlot index={3} className="bg-white/5" />
                      <InputOTPSlot index={4} className="bg-white/5" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </>
            )}
          </Form>
        </div>
        <div className="flex flex-col">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              props.nextStep && props.nextStep();
            }}
          >
            Resend code
          </Button>
          <Button variant="ghost" size="lg">
            Try another phone number
          </Button>
        </div>
      </div>
    </section>
  );
};

export const Onboarding2faAuth = (props: {
  nextStep: (() => void) | undefined;
}) => {
  const [phone, setPhone] = useState<string | undefined>();

  const schema = z.object({
    phone: z.string().refine(validator.isMobilePhone),
    toc: z.literal<boolean>(true),
  });

  if (phone) {
    return <OnboardingContentCode phone={phone} {...props} />;
  }

  return (
    <section
      id="main"
      className="mx-auto flex max-w-lg flex-col gap-y-12 text-center"
    >
      <div className="space-y-12">
        <div className="space-y-3">
          <h1 className="text-3xl text-white md:text-6xl">
            What&apos;s your primary
            <br />
            phone number?
          </h1>
          <p className="text-sm text-white opacity-80 md:text-base">
            We&apos;ll need this to contact you for booking
            <br />
            at-home appointments.
          </p>
        </div>
        <Form
          onSubmit={(values) => {
            setPhone(values.phone);
          }}
          schema={schema}
          className="mx-auto max-w-md space-y-12"
        >
          {({ register, formState }) => (
            <>
              <Input
                type="phone"
                placeholder="Phone number"
                autoComplete="off"
                error={formState.errors['phone']}
                registration={register('phone')}
                className="h-14 rounded-xl border-white/20 bg-white/5 p-4 text-[16px] font-normal text-white caret-white placeholder:text-white placeholder:opacity-50 focus:border-white"
                icon={<PhoneIcon className="size-4" />}
              />
              <div>
                <label className="flex flex-row text-left text-xs text-white opacity-80 md:text-base">
                  <div className="mr-4 mt-0.5">
                    <Input
                      id="terms"
                      type="checkbox"
                      registration={register('toc')}
                      className="border-white/80 data-[state=checked]:bg-white data-[state=checked]:text-orange-900"
                    />
                  </div>
                  <p>
                    {
                      'I agree to the terms & conditions and to receive SMS messages. I give Superpower permission to send  me my health information via SMS. I understand that I may opt out at any time and that carrier data & messaging fees might apply.'
                    }
                  </p>
                </label>
              </div>
              <div>
                <Button
                  // isLoading={schema.isPending}
                  type="submit"
                  className="w-full text-base md:text-lg"
                  variant="white"
                  size="lg"
                >
                  Send code
                </Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </section>
  );
};
