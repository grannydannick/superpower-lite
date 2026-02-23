import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useRef } from 'react';
import * as z from 'zod';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { Spinner } from '@/components/ui/spinner/spinner';
import { H1 } from '@/components/ui/typography';
import {
  useVerifyMagicLink,
  type VerifyMagicLinkResponse,
} from '@/features/auth/api/verify-magic-link';
import { useAnalytics } from '@/hooks/use-analytics';
import { getActiveLogin, setActiveLogin } from '@/lib/utils';
import { User } from '@/types/api';

const verifyEmailSearchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute('/verify-email')({
  validateSearch: zodValidator(verifyEmailSearchSchema),
  component: VerifyEmailComponent,
});

function decodeJwtPayload(token: string): { email?: string } | null {
  try {
    const decoded = jwtDecode<{ email?: string; sub?: string }>(token);
    return { email: decoded?.email ?? decoded?.sub };
  } catch {
    return null;
  }
}

function VerifyEmailComponent() {
  const navigate = Route.useNavigate();
  const { track, identify } = useAnalytics();
  const queryClient = useQueryClient();

  const token = Route.useSearch({ select: (s) => s.token });
  const hasRunVerifyMagicLink = useRef(false);

  const handleSuccessfulEmailVerification = (
    response: VerifyMagicLinkResponse,
  ) => {
    queryClient.setQueryData<User | undefined>(
      ['authenticated-user'],
      response.user,
    );

    setActiveLogin({
      accessToken: response.authTokens.accessToken,
      refreshToken: response.authTokens.refreshToken || '',
      profile: {
        userId: response.user.id,
      },
    });

    track('logged_in', {
      method: 'magic_link',
    });

    identify(response.user.id, {
      $set: {
        email: response.user.email,
        first_name: response.user.firstName,
        last_name: response.user.lastName,
        phone: response.user.phone,
      },
    });

    setTimeout(() => {
      void navigate({ href: response.redirectTo ?? '/', replace: true });
    }, 0);
  };

  const handleEmailVerificationError = (error: Error) => {
    const errorData = (error as any)?.response?.data;
    const errorText =
      errorData?.issue?.[0]?.details?.text ||
      errorData?.message ||
      errorData?.error;
    const isInvalidToken = errorText === 'invalid_token';

    if (isInvalidToken && token != null && token.length > 0) {
      if (getActiveLogin()?.accessToken) {
        void navigate({ to: '/', replace: true });
        return;
      }

      const payload = decodeJwtPayload(token);
      if (payload?.email) {
        void navigate({
          to: '/check-email',
          state: {
            email: payload.email,
            origin: 'expired-link',
          },
          replace: true,
        });
        return;
      } else {
        void navigate({ to: '/signin', replace: true });
        return;
      }
    }

    void navigate({ to: '/signin', replace: true });
    return;
  };

  const verifyMagicLinkMutation = useVerifyMagicLink({
    mutationConfig: {
      onSuccess: handleSuccessfulEmailVerification,
      onError: handleEmailVerificationError,
    },
  });

  useEffect(() => {
    if (token == null || token.length === 0) {
      void navigate({ to: '/signin', replace: true });
      return;
    }

    if (!hasRunVerifyMagicLink.current) {
      hasRunVerifyMagicLink.current = true;
      verifyMagicLinkMutation.mutate({ data: { token } });
    }
  }, [token, navigate, verifyMagicLinkMutation]);

  if (token == null || token.length === 0) {
    return null;
  }

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
        <div className="space-y-8 text-center">
          <H1 className="text-4xl text-white md:text-6xl">
            <div className="opacity-100">Verifying email</div>
          </H1>

          <div className="flex justify-center">
            <Spinner size="lg" variant="light" />
          </div>
        </div>
      </div>
    </div>
  );
}
