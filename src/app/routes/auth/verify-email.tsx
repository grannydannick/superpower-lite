import { useQueryClient } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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

function decodeJwtPayload(token: string): { email?: string } | null {
  try {
    const decoded = jwtDecode<{ email?: string; sub?: string }>(token);
    return { email: decoded?.email ?? decoded?.sub };
  } catch {
    return null;
  }
}

export const VerifyEmailRoute = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { track, identify } = useAnalytics();
  const queryClient = useQueryClient();

  const token = searchParams.get('token');
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

    // Track analytics
    const eventName =
      response.origin === 'registration' ? 'user_confirmed' : 'logged_in';
    track(eventName);

    identify(response.user.id, {
      $set: {
        email: response.user.email,
        first_name: response.user.firstName,
        last_name: response.user.lastName,
        phone: response.user.phone,
      },
    });

    // This ensures React Query has processed the cache update
    // before navigation
    setTimeout(() => {
      navigate(response.redirectTo ?? '/', { replace: true });
    }, 0);
  };

  const handleEmailVerificationError = (error: Error) => {
    const errorData = (error as any)?.response?.data;
    const errorText =
      errorData?.issue?.[0]?.details?.text ||
      errorData?.message ||
      errorData?.error;
    const isInvalidToken = errorText === 'invalid_token';

    if (isInvalidToken && token) {
      // If the user is already authenticated, but the API call resulted in an invalid token
      // we can still redirect them as they are likely in the registration flow and already
      // verified their email
      if (getActiveLogin()?.accessToken) {
        navigate('/', { replace: true });
        return;
      }

      // User not authenticated - try to decode email from token for better UX
      const payload = decodeJwtPayload(token ?? '');
      if (payload?.email) {
        navigate('/check-email', {
          state: {
            email: payload.email,
            origin: 'expired-link',
          },
          replace: true,
        });
        return;
      } else {
        navigate('/signin', { replace: true });
        return;
      }
    }

    // Default error handling: redirect to signin
    navigate('/signin', { replace: true });
    return;
  };

  const verifyMagicLinkMutation = useVerifyMagicLink({
    mutationConfig: {
      onSuccess: handleSuccessfulEmailVerification,
      onError: handleEmailVerificationError,
    },
  });

  useEffect(() => {
    if (!token) {
      navigate('/signin', { replace: true });
      return;
    }

    // Only trigger mutation once using ref guard
    if (!hasRunVerifyMagicLink.current) {
      hasRunVerifyMagicLink.current = true;
      verifyMagicLinkMutation.mutate({ data: { token } });
    }
  }, [token, navigate, verifyMagicLinkMutation]);

  // Don't render anything if there's no token: redirect to signin
  if (!token) {
    return null;
  }

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
        <div className="text-center space-y-8">
          <H1 className="text-white text-4xl md:text-6xl">
            <div className="opacity-100">Verifying email</div>
          </H1>

          <div className="flex justify-center">
            <Spinner size="lg" variant="light" />
          </div>
        </div>
      </div>
    </div>
  );
};
