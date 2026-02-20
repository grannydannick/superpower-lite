import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';

import { AuthLayout, SplitScreenLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Body1, Body2, H1 } from '@/components/ui/typography';
import { useCheckoutContext } from '@/features/auth/stores';
import { useAvailableSubscriptions } from '@/features/settings/api';
import { useAnalytics } from '@/hooks/use-analytics';
import { useLogout, useUser } from '@/lib/auth';
import { registerInputSchema } from '@/lib/auth-schemas';
import type { RegisterInput } from '@/lib/auth-schemas';
import { getState } from '@/utils/verify-state-from-postal';

import { BaselineSummary } from './configurator/baseline-summary';
import { ConfiguratorSections } from './configurator/configurator-sections';

const REGISTER_FEATURES = [
  '100+ biomarkers tested',
  'A personalized plan that evolves with you',
  '17 health scores and your biological age',
  'A medical team in your pocket you can message 24/7',
  'An ecosystem of the best diagnostics, supplements, Rx’s and more',
];

export const RegisterForm = () => {
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<RegisterInput>({
    shouldUnregister: false,
    resolver: zodResolver(
      step === 1
        ? registerInputSchema.pick({
            email: true,
          })
        : registerInputSchema,
    ),
    mode: 'onChange',
    defaultValues: {
      postalCode: '',
    },
  });

  const postalCode = form.watch('postalCode');

  const handleNext = () => setStep(2);
  const handlePrev = () => setStep(1);

  return (
    <>
      <Form {...form}>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <form
          className="space-y-1"
          onSubmit={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
        >
          {step === 1 ? (
            <AuthLayout title="Email" progress={{ current: step, total: 2 }}>
              <Step1 onNext={handleNext} />
            </AuthLayout>
          ) : (
            <SplitScreenLayout title="Configurator" className="bg-zinc-50">
              <>
                <Configurator onPrev={handlePrev} />
                <BaselineSummary postalCode={postalCode} />
              </>
            </SplitScreenLayout>
          )}
        </form>
      </Form>
    </>
  );
};

const Step1 = ({ onNext }: { onNext: () => void }) => {
  const form = useFormContext<RegisterInput>();
  const { track } = useAnalytics();

  const userQuery = useUser();
  const logout = useLogout();

  const handleNext = async () => {
    const isStepValid = await form.trigger();

    if (isStepValid) {
      const email = form.getValues('email');

      if (userQuery.data && userQuery.data.email !== email) {
        console.log('Logging out user with different email');
        // If the user is logged in and the email is different, log them out
        await logout.mutateAsync({});
      }

      // Track registration started
      track('registration_started', {
        $set: {
          email,
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
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <Input
                  variant={fieldState.error ? 'error' : 'default'}
                  placeholder="Your email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void handleNext();
                    }
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="button" onClick={handleNext} className="w-full">
          Get Started
        </Button>
      </div>

      <div>
        <Card className="space-y-4 border border-zinc-200 bg-white p-6 shadow-md">
          {REGISTER_FEATURES.map((feature, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Check
                size={20}
                strokeWidth={2}
                className="shrink-0 text-vermillion-900"
              />
              <Body2 className="text-zinc-700">{feature}</Body2>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

export const Configurator = ({ onPrev }: { onPrev: () => void }) => {
  const updateMembership = useCheckoutContext((s) => s.updateMembership);
  const coupon = useCheckoutContext((s) => s.coupon);
  const form = useFormContext<RegisterInput>();

  const postalCode = form.watch('postalCode');

  const availableSubscriptionsQuery = useAvailableSubscriptions({
    coupon: coupon ?? undefined,
    state: getState(postalCode)?.state,
  });

  const availableSubscriptions = availableSubscriptionsQuery.data ?? [];

  useEffect(() => {
    if (availableSubscriptions.length > 0) {
      updateMembership(availableSubscriptions[0]);
    } else {
      updateMembership(null);
    }
  }, [availableSubscriptions]);

  return <ConfiguratorSections onPrev={onPrev} />;
};
