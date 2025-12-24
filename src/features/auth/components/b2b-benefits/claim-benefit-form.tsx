import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AuthLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Body1, H1 } from '@/components/ui/typography';
import { useBenefits, useVerifyEligibility } from '@/features/b2b/api';
import { useAnalytics } from '@/hooks/use-analytics';
import {
  RegisterInput,
  registerInputSchema,
  useLogout,
  useUser,
} from '@/lib/auth';

import { useB2BCheckout } from '../../hooks/use-b2b-checkout';

import { MemberDetails } from './member-details';

export const ClaimBenefitForm = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [benefitIds, setBenefitIds] = useState<string[]>([]);

  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('id') ?? '';
  const {
    data: benefits,
    isLoading: isBenefitsLoading,
    isError: isBenefitsError,
  } = useBenefits(organizationId);

  const form = useForm<RegisterInput>({
    shouldUnregister: false,
    resolver: zodResolver(registerInputSchema),
    mode: 'onChange',
    defaultValues: {
      postalCode: '',
    },
  });

  const { processB2BCheckout } = useB2BCheckout({
    organizationId,
    benefitIds,
    onSuccess: async (email) => {
      navigate('/check-email', {
        state: {
          email,
          origin: 'registration',
        },
      });
    },
  });

  const onNextCallback = (newBenefitIds: string[]) => {
    setBenefitIds(newBenefitIds);
    setStep(2);
  };

  const onPrevCallback = () => setStep(1);

  const onSubmitCallback = async (data: RegisterInput) => {
    await processB2BCheckout(data);
  };

  useEffect(() => {
    if (!organizationId) {
      toast.error('Invalid benefit link. Please contact your organization.');
      navigate('/register');
      return;
    }

    if (!isBenefitsLoading && (isBenefitsError || !benefits)) {
      toast.error('Unable to load benefits. Please contact your organization.');
      navigate('/register');
    }
  }, [organizationId, navigate, isBenefitsLoading, isBenefitsError, benefits]);

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
              <VerifyEligibilityStep onNext={onNextCallback} />
            </AuthLayout>
          ) : (
            <MemberDetails
              onPrev={onPrevCallback}
              onSubmit={onSubmitCallback}
            />
          )}
        </form>
      </Form>
    </>
  );
};

const VerifyEligibilityStep = ({
  onNext,
}: {
  onNext: (benefitIds: string[]) => void;
}) => {
  const { track } = useAnalytics();

  const userQuery = useUser();

  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('id');

  const logout = useLogout();
  const verifyEligibility = useVerifyEligibility();

  const form = useFormContext<RegisterInput>();

  const handleNext = async () => {
    const isStepValid = await form.trigger('email');

    if (!isStepValid || !organizationId) return;

    const email = form.getValues('email');

    try {
      const result = await verifyEligibility.mutateAsync({
        params: {
          path: { organizationId },
        },
        body: { email },
      });

      if (!result.isEligible) {
        form.setError('email', {
          type: 'manual',
          message: 'This email is not eligible for this benefit',
        });
        return;
      }

      toast.success('Eligibility verified successfully');

      if (userQuery.data && userQuery.data.email !== email) {
        await logout.mutateAsync({});
      }

      const benefitIds = result.benefits.map((benefit) => benefit.id);

      // Track registration started
      track('b2b_registration_started', {
        $set: {
          email,
        },
        organization_id: organizationId,
        benefit_ids: benefitIds,
      });
      onNext(benefitIds);
    } catch (error: any) {
      toast.error(
        error?.message ?? 'Failed to verify eligibility. Please try again.',
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <H1 className="text-3xl md:text-5xl">Claim your benefit</H1>
        <Body1 className="whitespace-pre-line text-zinc-500">
          {`Enter your work email to claim your benefit.
          You can register with your personal email in the next step.`}
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
                  placeholder="Work email"
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
        <Button
          type="button"
          onClick={handleNext}
          className="w-full"
          disabled={verifyEligibility.isPending}
        >
          {verifyEligibility.isPending ? 'Verifying...' : 'Verify eligibility'}
        </Button>
      </div>
    </div>
  );
};
