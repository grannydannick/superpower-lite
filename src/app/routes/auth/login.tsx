import { useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AuthLayout } from '@/components/layouts';
import { LoginForm } from '@/features/auth/components/login-form';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';
import { User } from '@/types/api';

const RESTRICTED_REDIRECT_ROUTES = ['/users'];

export const LoginRoute = () => {
  const user = useUser();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const { identify, track } = useAnalytics();

  // when we sign in from users (as admin) we don't want to be redirected to the same page
  const shouldRedirect =
    redirectTo !== null && !RESTRICTED_REDIRECT_ROUTES.includes(redirectTo);

  useEffect(() => {
    if (user.data) {
      navigate(shouldRedirect ? redirectTo : '/', {
        replace: true,
      });
    }
  }, [user.data, navigate, shouldRedirect, redirectTo]);

  // Handles login success using password
  const handleLoginWithPasswordSuccess = useCallback(
    (user: User) => {
      // Password path completes entirely client-side after token exchange
      track('logged_in');
      navigate(`${shouldRedirect ? `${redirectTo}` : '/'}`, {
        replace: true,
      });
      identify(user.id, {
        $set: {
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          phone: user.phone,
        },
      });
    },
    [track, navigate, shouldRedirect, redirectTo, identify],
  );

  // Handles login success using magic link
  const handleLoginWithMagicLinkSuccess = useCallback(
    (email: string) => {
      // Magic link path moves user into the OTP/magic-link flow. We pass email
      // and origin via route state so the check-email screen can auto-resend on
      // expired links and verify OTP. Any redirect target is sent to the backend
      // and sanitized server-side.
      navigate('/check-email', {
        state: {
          email,
          origin: 'login',
        },
      });
    },
    [navigate],
  );

  return (
    <AuthLayout title="Log in">
      <LoginForm
        redirectTo={redirectTo || undefined}
        onSuccessWithPassword={handleLoginWithPasswordSuccess}
        onSuccessWithMagicLink={handleLoginWithMagicLinkSuccess}
      />
    </AuthLayout>
  );
};
