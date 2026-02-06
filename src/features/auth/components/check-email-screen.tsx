import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { Body1, H1, H3 } from '@/components/ui/typography';
import { useSendMagicLink } from '@/features/auth/api/send-magic-link';
import { useVerifyEmailOTP } from '@/features/auth/api/verify-email-otp';
import { VerifyEmailOTPResponse } from '@/types/api';

interface CheckEmailScreenProps {
  email: string;
  origin?: 'login' | 'registration' | 'expired-link';
  onOtpSuccess: (response: VerifyEmailOTPResponse) => void;
  isLoading?: boolean;
}

export const CheckEmailScreen = ({
  email,
  origin,
  onOtpSuccess,
  isLoading = false,
}: CheckEmailScreenProps) => {
  const [cooldownSeconds, setCooldownSeconds] = useState(
    origin === 'expired-link' ? 0 : 20,
  );
  const [otpCode, setOtpCode] = useState('');
  const lastSubmittedCodeRef = useRef<string | null>(null);
  const otpInputRef = useRef<React.ElementRef<typeof InputOTP>>(null);

  const sendMagicLinkMutation = useSendMagicLink({
    mutationConfig: {
      onSuccess: () => {
        setCooldownSeconds(60);
      },
    },
  });

  const verifyOTPMutation = useVerifyEmailOTP({
    mutationConfig: {
      onSuccess: (response) => {
        // Keep the code visible during auth processing
        onOtpSuccess(response);
        // Reset tracking to allow new attempts if needed
        lastSubmittedCodeRef.current = null;
      },
      onError: () => {
        // Clear code on error so user can try again
        lastSubmittedCodeRef.current = null;
        startTransition(() => {
          setOtpCode('');
          // Focus the input after clearing to allow immediate typing
          setTimeout(() => {
            otpInputRef.current?.focus();
          }, 0);
        });
      },
    },
  });

  // Countdown timer for resend button cooldown
  // This prevents users from spamming the resend email button by enforcing
  // a 60-second wait period between requests
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  const handleResend = useCallback(() => {
    if (cooldownSeconds > 0) {
      return;
    }

    sendMagicLinkMutation.mutate({
      data: { email, origin },
    });
  }, [cooldownSeconds, sendMagicLinkMutation, email, origin]);

  const handleOTPChange = useCallback(
    (value: string) => {
      const cleanValue = value.replace(/\D/g, '').slice(0, 6);
      setOtpCode(cleanValue);

      if (
        cleanValue.length === 6 &&
        cleanValue !== lastSubmittedCodeRef.current &&
        !verifyOTPMutation.isPending &&
        !isLoading
      ) {
        lastSubmittedCodeRef.current = cleanValue;
        verifyOTPMutation.mutate({ data: { email, code: cleanValue } });
      }
    },
    [verifyOTPMutation, email, isLoading],
  );

  const canResend =
    cooldownSeconds === 0 &&
    !sendMagicLinkMutation.isPending &&
    !verifyOTPMutation.isPending &&
    !isLoading;

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0">
        <img
          src="/onboarding/shared/backgrounds/bright-woman.webp"
          alt="background"
          className="size-full object-cover"
        />
      </div>

      <div className="absolute left-10 top-10 z-10">
        <SuperpowerLogo fill="#fff" />
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="space-y-8 px-6 text-center">
          <H1 className="text-4xl text-white md:text-6xl">
            <div className="opacity-100">Welcome to</div>
            <div className="opacity-65">Superpower</div>
          </H1>

          <div className="space-y-4">
            <Body1 className="text-white">
              {origin === 'expired-link'
                ? `That link expired. Click the button below to send a new link to ${email}.`
                : `We've sent a link to ${email}.`}
            </Body1>

            <Body1 className="text-white">
              Follow the link in your email or input the code here.
            </Body1>

            {process.env.NODE_ENV === 'development' ? (
              <H3 className="text-white">
                DEBUG: Use 000000 to bypass OTP verification
              </H3>
            ) : null}
          </div>

          {/* OTP Input */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP
                ref={otpInputRef}
                maxLength={6}
                value={otpCode}
                onChange={(val) => handleOTPChange(val)}
                disabled={
                  verifyOTPMutation.isPending ||
                  sendMagicLinkMutation.isPending ||
                  isLoading
                }
              >
                <InputOTPGroup>
                  <InputOTPSlot key="slot-0" index={0} />
                  <InputOTPSlot key="slot-1" index={1} />
                  <InputOTPSlot key="slot-2" index={2} />
                  <InputOTPSlot key="slot-3" index={3} />
                  <InputOTPSlot key="slot-4" index={4} />
                  <InputOTPSlot key="slot-5" index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div>
            <button
              onClick={handleResend}
              disabled={!canResend}
              className="min-h-8 disabled:opacity-50"
            >
              <Body1 className="text-white opacity-65">
                {sendMagicLinkMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" />
                    Sending...
                  </span>
                ) : verifyOTPMutation.isPending || isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" />
                  </span>
                ) : cooldownSeconds > 0 ? (
                  `Resend email (${cooldownSeconds}s)`
                ) : (
                  'Resend email'
                )}
              </Body1>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
