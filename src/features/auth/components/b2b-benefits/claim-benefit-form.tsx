import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { useForm, useFormContext } from 'react-hook-form';

import { AuthLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/dialog/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H1 } from '@/components/ui/typography';
import { useCheckoutContext } from '@/features/auth/stores';
import {
  type VerifyB2bEligibilityOtpResult,
  useBenefits,
  useSendB2bEligibilityOtp,
  useVerifyB2bEligibilityOtp,
} from '@/features/b2b/api';
import { useAnalytics } from '@/hooks/use-analytics';
import { api } from '@/lib/api-client';
import { useLogout, useUser } from '@/lib/auth';
import { registerInputSchema } from '@/lib/auth-schemas';
import type { RegisterInput } from '@/lib/auth-schemas';

import { useB2BCheckout } from '../../hooks/use-b2b-checkout';

import { MemberDetails } from './member-details';

export const ClaimBenefitForm = () => {
  const navigate = useNavigate();
  const { track } = useAnalytics();
  const { data: currentUser } = useUser();
  const logout = useLogout();
  const processing = useCheckoutContext((s) => s.processing);

  const [step, setStep] = useState<1 | 2>(1);
  const [claimGrantToken, setClaimGrantToken] = useState<string | null>(null);
  const [benefitEmail, setBenefitEmail] = useState<string | null>(null);
  const [accountChoiceDialogState, setAccountChoiceDialogState] = useState<{
    verifiedEmail: string;
    claimGrantToken: string;
  } | null>(null);

  const organizationId =
    useSearch({ from: '/claim-benefit', select: (s) => s.id }) ?? '';
  const {
    data: benefits,
    isLoading: isBenefitsLoading,
    isError: isBenefitsError,
  } = useBenefits(organizationId);

  const trackRegistrationStarted = useCallback(
    (email: string) => {
      track('b2b_registration_started', {
        $set: { email },
        organization_id: organizationId,
      });
    },
    [organizationId, track],
  );

  const form = useForm<RegisterInput>({
    shouldUnregister: false,
    resolver: zodResolver(registerInputSchema),
    mode: 'onChange',
    defaultValues: {
      postalCode: '',
    },
  });

  const { submitBenefitClaim } = useB2BCheckout({
    organizationId,
    onSuccess: async (loginEmail, options) => {
      if (options?.hasExistingAccount) {
        toast.success('Success! Benefits have been added to your account.');
      }

      if (!loginEmail) {
        // For new users with verified email, wait until onboarding task exists
        // so we don't route into app guards before onboarding setup finishes.
        if (!options?.hasExistingAccount) {
          const onboardingReady = await waitForOnboardingTaskReady();
          if (!onboardingReady) {
            toast.error(
              'We are still setting up your onboarding. Please try again in a moment.',
            );
            return;
          }
        }
        void navigate({ to: '/', replace: true });
        return;
      }

      void navigate({
        to: '/check-email',
        state: {
          email: loginEmail,
          origin: 'registration',
        },
      });
    },
  });

  const handleContinueToNewAccountSignup = useCallback(
    (verifiedEmail: string, token: string) => {
      setClaimGrantToken(token);
      setBenefitEmail(verifiedEmail);
      trackRegistrationStarted(verifiedEmail);
      setStep(2);
    },
    [trackRegistrationStarted],
  );

  const handleContinueWithCurrentAccount = useCallback(
    async (verifiedEmail: string, token: string) => {
      setClaimGrantToken(token);
      setBenefitEmail(verifiedEmail);
      trackRegistrationStarted(verifiedEmail);
      await submitBenefitClaim(undefined, {
        claimGrantToken: token,
        benefitEmail: verifiedEmail,
        loginEmail: currentUser?.email ?? verifiedEmail,
        hasExistingAccount: true,
      });
    },
    [currentUser?.email, submitBenefitClaim, trackRegistrationStarted],
  );

  const handleChooseBetweenCurrentOrNewAccount = useCallback(
    (verifiedEmail: string, token: string) => {
      setClaimGrantToken(token);
      setBenefitEmail(verifiedEmail);
      setAccountChoiceDialogState({ verifiedEmail, claimGrantToken: token });
    },
    [],
  );

  const handleUseCurrentAccount = useCallback(async () => {
    const dialog = accountChoiceDialogState;
    setAccountChoiceDialogState(null);
    if (dialog === null) {
      return;
    }

    trackRegistrationStarted(currentUser?.email ?? '');
    await submitBenefitClaim(undefined, {
      claimGrantToken: dialog.claimGrantToken,
      benefitEmail: dialog.verifiedEmail,
      loginEmail: currentUser?.email ?? dialog.verifiedEmail,
      hasExistingAccount: true,
    });
  }, [
    accountChoiceDialogState,
    currentUser?.email,
    submitBenefitClaim,
    trackRegistrationStarted,
  ]);

  const handleCreateNewAccount = useCallback(async () => {
    const verifiedEmail = accountChoiceDialogState?.verifiedEmail;
    setAccountChoiceDialogState(null);
    if (verifiedEmail) {
      trackRegistrationStarted(verifiedEmail);
    }
    await logout.mutateAsync({});
    setStep(2);
  }, [
    accountChoiceDialogState?.verifiedEmail,
    logout,
    trackRegistrationStarted,
  ]);

  const onPrevCallback = () => {
    setStep(1);
    setClaimGrantToken(null);
    setBenefitEmail(null);
  };

  const onSubmitCallback = async (data: RegisterInput) => {
    await submitBenefitClaim(data, {
      claimGrantToken: claimGrantToken ?? '',
      benefitEmail: (benefitEmail ?? '').trim(),
      loginEmail: data.email.trim(),
      hasExistingAccount: false,
    });
  };

  useEffect(() => {
    if (!organizationId) {
      toast.error('Invalid benefit link. Please contact your organization.');
      void navigate({ to: '/register' });
      return;
    }

    if (!isBenefitsLoading && (isBenefitsError || !benefits)) {
      toast.error('Unable to load benefits. Please contact your organization.');
      void navigate({ to: '/register' });
    }
  }, [organizationId, navigate, isBenefitsLoading, isBenefitsError, benefits]);

  return (
    <>
      <AddBenefitToAccountDialog
        open={accountChoiceDialogState !== null}
        currentUserEmail={currentUser?.email}
        onOpenChange={(open) => {
          if (!open) {
            setAccountChoiceDialogState(null);
          }
        }}
        onCreateNewAccount={handleCreateNewAccount}
        onUseCurrentAccount={handleUseCurrentAccount}
      />

      <Form {...form}>
        <div className="relative space-y-1">
          {processing ? (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-black/50 p-6 backdrop-blur-sm sm:flex-row">
              <Spinner variant="light" size="sm" />
              <Body1 className="text-center text-white">
                Processing your benefit claim. Do not refresh this tab.
              </Body1>
            </div>
          ) : null}
          {step === 1 ? (
            <AuthLayout title="Email" progress={{ current: step, total: 2 }}>
              <VerifyEligibilityStep
                organizationId={organizationId}
                onContinueToNewAccountSignup={handleContinueToNewAccountSignup}
                onContinueWithCurrentAccount={handleContinueWithCurrentAccount}
                onChooseBetweenCurrentOrNewAccount={
                  handleChooseBetweenCurrentOrNewAccount
                }
              />
            </AuthLayout>
          ) : (
            <MemberDetails
              onPrev={onPrevCallback}
              onSubmit={onSubmitCallback}
            />
          )}
        </div>
      </Form>
    </>
  );
};

type AddBenefitToAccountDialogProps = {
  open: boolean;
  currentUserEmail?: string;
  onOpenChange: (open: boolean) => void;
  onCreateNewAccount: () => void | Promise<void>;
  onUseCurrentAccount: () => void | Promise<void>;
};

const AddBenefitToAccountDialog = ({
  open,
  currentUserEmail,
  onOpenChange,
  onCreateNewAccount,
  onUseCurrentAccount,
}: AddBenefitToAccountDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[95vw] p-8 sm:max-w-[525px]">
        <AlertDialogHeader className="mb-4">
          <AlertDialogTitle className="text-2xl font-normal tracking-[-0.64px] text-zinc-900 md:text-3xl">
            Add this benefit to your account?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-zinc-600">
            Would you like to add this benefit to your existing account,{' '}
            <span className="font-medium text-zinc-800">
              {currentUserEmail}
            </span>
            ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 gap-3">
          <AlertDialogCancel
            className="rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-700"
            onClick={() => {
              void onCreateNewAccount();
            }}
          >
            No, create a new account
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-xl bg-black text-white hover:bg-zinc-800"
            onClick={() => {
              void onUseCurrentAccount();
            }}
          >
            Yes, add to my account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const waitForOnboardingTaskReady = async () => {
  const maxAttempts = 90;
  const delayMs = 1000;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      await api.get('/tasks/onboarding', {
        headers: { 'x-hide-toast': 'true' },
      });
      return true;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, delayMs);
        });
        continue;
      }
      throw error;
    }
  }

  return false;
};

type VerifyEligibilityStepProps = {
  organizationId: string;
  onContinueToNewAccountSignup: (
    verifiedEmail: string,
    claimGrantToken: string,
  ) => void;
  onContinueWithCurrentAccount: (
    verifiedEmail: string,
    claimGrantToken: string,
  ) => void | Promise<void>;
  onChooseBetweenCurrentOrNewAccount: (
    verifiedEmail: string,
    claimGrantToken: string,
  ) => void;
};

function parseClaimGrantToken(token: string | undefined | null): string | null {
  if (typeof token !== 'string') return null;
  const trimmed = token.trim();
  return trimmed.split('.').length === 3 ? trimmed : null;
}

const VerifyEligibilityStep = ({
  organizationId,
  onContinueToNewAccountSignup,
  onContinueWithCurrentAccount,
  onChooseBetweenCurrentOrNewAccount,
}: VerifyEligibilityStepProps) => {
  const [phase, setPhase] = useState<'email' | 'code'>('email');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [otpCode, setOtpCode] = useState('');
  const lastSubmittedCodeRef = useRef<string | null>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const userQuery = useUser();
  const sendOtp = useSendB2bEligibilityOtp();
  const verifyOtp = useVerifyB2bEligibilityOtp();
  const form = useFormContext<RegisterInput>();
  const emailWatch = form.watch('email');

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setTimeout(
      () => setCooldownSeconds((seconds) => seconds - 1),
      1000,
    );
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (phase !== 'code') return;
    const id = requestAnimationFrame(() => otpInputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [phase]);

  const finishVerification = useCallback(
    (
      verifiedEmail: string,
      grantToken: string | undefined | null,
      authStatus: 'logged_in' | 'no_existing_account',
    ) => {
      const parsed = parseClaimGrantToken(grantToken);
      if (parsed === null) {
        toast.error(
          'Missing claim authorization. Please verify your benefit email again.',
        );
        return;
      }

      const normalizedVerified = verifiedEmail.trim().toLowerCase();
      const loggedIn = userQuery.data;

      if (loggedIn) {
        if (loggedIn.email.trim().toLowerCase() === normalizedVerified) {
          void onContinueWithCurrentAccount(verifiedEmail, parsed);
          return;
        }
        onChooseBetweenCurrentOrNewAccount(verifiedEmail, parsed);
        return;
      }

      if (authStatus === 'logged_in') {
        void onContinueWithCurrentAccount(verifiedEmail, parsed);
        return;
      }

      onContinueToNewAccountSignup(verifiedEmail, parsed);
    },
    [
      onChooseBetweenCurrentOrNewAccount,
      onContinueToNewAccountSignup,
      onContinueWithCurrentAccount,
      userQuery.data,
    ],
  );

  const handleSendCode = useCallback(async () => {
    const isStepValid = await form.trigger('email');
    if (!isStepValid || organizationId.length === 0) return;

    const email = form.getValues('email');
    try {
      await sendOtp.mutateAsync({ organizationId, email });
      setPhase('code');
      setCooldownSeconds(60);
      setOtpCode('');
      lastSubmittedCodeRef.current = null;
    } catch {
      // API client handles toast.
    }
  }, [form, organizationId, sendOtp]);

  const handleResend = useCallback(() => {
    if (cooldownSeconds > 0) return;
    void handleSendCode();
  }, [cooldownSeconds, handleSendCode]);

  const submitOtpCode = useCallback(() => {
    const cleanValue = otpCode.replace(/\D/g, '').slice(0, 6);
    if (
      cleanValue.length !== 6 ||
      cleanValue === lastSubmittedCodeRef.current ||
      verifyOtp.isPending ||
      organizationId.length === 0
    ) {
      return;
    }

    lastSubmittedCodeRef.current = cleanValue;
    const email = form.getValues('email');
    verifyOtp.mutate(
      { organizationId, email, code: cleanValue },
      {
        onSuccess: (result: VerifyB2bEligibilityOtpResult) =>
          finishVerification(email, result.claimGrantToken, result.authStatus),
        onError: () => {
          lastSubmittedCodeRef.current = null;
          startTransition(() => {
            setOtpCode('');
            setTimeout(() => otpInputRef.current?.focus(), 0);
          });
        },
      },
    );
  }, [finishVerification, form, organizationId, otpCode, verifyOtp]);

  const handleOtpInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
    },
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      {phase === 'email' ? (
        <>
          <div className="space-y-3">
            <H1 className="text-3xl md:text-5xl">Claim your benefit</H1>
            <Body1 className="whitespace-pre-line text-zinc-500">
              Enter the email associated with your benefit.
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
                      placeholder="Email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void handleSendCode();
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
              onClick={handleSendCode}
              className="w-full"
              disabled={sendOtp.isPending}
            >
              {sendOtp.isPending ? 'Sending...' : 'Claim'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-3">
            <H1 className="text-3xl md:text-5xl">Enter code</H1>
            <Body1 className="whitespace-pre-line text-zinc-500">
              We sent a 6-digit code to {emailWatch}.
            </Body1>
          </div>
          <div className="space-y-4">
            <Input
              ref={otpInputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoCorrect="off"
              spellCheck={false}
              maxLength={6}
              aria-label="6-digit verification code"
              value={otpCode}
              onChange={handleOtpInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submitOtpCode();
                }
              }}
              disabled={verifyOtp.isPending}
            />
            <Button
              type="button"
              onClick={submitOtpCode}
              className="w-full"
              disabled={
                otpCode.replace(/\D/g, '').length !== 6 || verifyOtp.isPending
              }
            >
              {verifyOtp.isPending ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  Verifying...
                </span>
              ) : (
                'Continue'
              )}
            </Button>
            <div className="flex flex-col items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPhase('email');
                  setOtpCode('');
                  lastSubmittedCodeRef.current = null;
                }}
                className="text-center"
              >
                <Body2 className="text-zinc-500">Back</Body2>
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={
                  cooldownSeconds > 0 ||
                  sendOtp.isPending ||
                  verifyOtp.isPending
                }
                className="text-center disabled:opacity-50"
              >
                <Body2 className="text-zinc-500">
                  {sendOtp.isPending ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      Sending...
                    </span>
                  ) : cooldownSeconds > 0 ? (
                    `Resend code (${cooldownSeconds}s)`
                  ) : (
                    'Resend code'
                  )}
                </Body2>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
