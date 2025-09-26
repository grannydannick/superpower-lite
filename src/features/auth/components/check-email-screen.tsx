import { startTransition, useCallback, useEffect, useState } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { Body1, H1 } from '@/components/ui/typography';
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
  const [cooldownSeconds, setCooldownSeconds] = useState(20);
  const [otpCode, setOtpCode] = useState('');

  const sendMagicLinkMutation = useSendMagicLink({
    mutationConfig: {
      onSuccess: () => {
        setCooldownSeconds(60);
      },
    },
  });

  const verifyOTPMutation = useVerifyEmailOTP({
    mutationConfig: {
      onSuccess: onOtpSuccess,
      onSettled: () => {
        // Reset input in a transition to avoid visible flicker
        startTransition(() => setOtpCode(''));
      },
    },
  });

  useEffect(() => {
    if (origin === 'expired-link') {
      // If user arrived from an expired magic link, proactively resend a fresh
      // email (which also issues a new OTP) and start the cooldown.
      sendMagicLinkMutation.mutate({
        data: { email },
      });
    }
  }, []);

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

      if (cleanValue.length === 6) {
        setTimeout(() => {
          verifyOTPMutation.mutate({ data: { email, code: cleanValue } });
        }, 100);
      }
    },
    [verifyOTPMutation, email],
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
          src="/onboarding/bright-woman.webp"
          alt="background"
          className="size-full object-cover"
        />
      </div>

      <div className="absolute left-10 top-10 z-10">
        <SuperpowerLogo fill="#fff" />
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="text-center space-y-8 px-6">
          <H1 className="text-white text-4xl md:text-6xl">
            <div className="opacity-100">Welcome to</div>
            <div className="opacity-65">Superpower</div>
          </H1>

          <div className="space-y-4">
            <Body1 className="text-white">
              {origin === 'expired-link'
                ? `That link expired, so we've sent a fresh magic link to ${email}.`
                : `We've sent a magic link to ${email} to ${origin === 'login' ? 'log in' : 'get started'}.`}
            </Body1>

            <Body1 className="text-white">
              Follow the link in your email or input the code here.
            </Body1>
          </div>

          {/* OTP Input */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP
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
              className="disabled:opacity-50 min-h-[2rem]"
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
