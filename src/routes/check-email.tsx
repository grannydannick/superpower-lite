import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { CheckEmailScreen } from '@/features/auth/components/check-email-screen';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';
import { setActiveLogin } from '@/lib/utils';
import { User, VerifyEmailOTPResponse } from '@/types/api';

export const Route = createFileRoute('/check-email')({
  component: CheckEmailComponent,
});

function CheckEmailComponent() {
  const navigate = Route.useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { track, identify } = useAnalytics();
  const { data: user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const email = location.state.email;
  const origin = location.state.origin;

  useEffect(() => {
    if (email === undefined) {
      if (user) {
        void navigate({ to: '/', replace: true });
      } else {
        void navigate({ to: '/signin', replace: true });
      }
    }
  }, [email, user, navigate]);

  if (email === undefined) {
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

    track('logged_in', {
      method: 'otp',
    });

    identify(response.user.id, {
      $set: {
        email: response.user.email,
        first_name: response.user.firstName,
        last_name: response.user.lastName,
        phone: response.user.phone,
      },
    });

    setIsLoading(false);

    setTimeout(() => {
      void navigate({ href: response.redirectTo ?? '/', replace: true });
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
}
