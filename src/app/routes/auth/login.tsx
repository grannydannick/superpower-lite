import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AuthLayout } from '@/components/layouts';
import { LoginForm } from '@/features/auth/components/login-form';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';

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

  return (
    <AuthLayout title="Log in">
      <LoginForm
        onSuccess={(user) => {
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
        }}
      />
    </AuthLayout>
  );
};
