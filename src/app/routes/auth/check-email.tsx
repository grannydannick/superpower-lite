import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { CheckEmailScreen } from '@/features/auth/components/check-email-screen';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';
import { setActiveLogin } from '@/lib/utils';
import { User, VerifyEmailOTPResponse } from '@/types/api';

export const CheckEmailRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { track, identify } = useAnalytics();
  const { data: user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const email = location.state?.email;
  const origin = location.state?.origin as
    | 'login'
    | 'registration'
    | 'expired-link'
    | undefined;

  useEffect(() => {
    if (email === undefined) {
      if (user) {
        // User is authenticated, but there is no email - redirect to /
        navigate('/', { replace: true });
      } else {
        // User is not authenticated and there is no email - redirect to signin
        navigate('/signin', { replace: true });
      }
    }
  }, [email, user, navigate]);

  if (email === undefined) {
    // While redirect is in-flight render nothing to avoid flicker
    return null;
  }

  const handleSuccessfulOtpAuthentication = (
    response: VerifyEmailOTPResponse,
  ) => {
    setIsLoading(true);

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
      origin === 'registration' ? 'user_confirmed' : 'logged_in';
    track(eventName);

    identify(response.user.id, {
      $set: {
        email: response.user.email,
        first_name: response.user.firstName,
        last_name: response.user.lastName,
        phone: response.user.phone,
      },
    });

    setIsLoading(false);

    // This ensures React Query has processed the cache update
    // before navigation
    setTimeout(() => {
      navigate(response.redirectTo ?? '/', { replace: true });
    }, 0);
  };

  return (
    <CheckEmailScreen
      email={email}
      origin={origin}
      onOtpSuccess={handleSuccessfulOtpAuthentication}
      isLoading={isLoading}
    />
  );
};
