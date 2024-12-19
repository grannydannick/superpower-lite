import { useNavigate, useSearchParams } from 'react-router-dom';

import { AuthLayout } from '@/components/layouts/auth-layout';
import { LoginForm } from '@/features/auth/components/login-form';

const RESTRICTED_REDIRECT_ROUTES = ['/users'];

export const LoginRoute = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  // when we sign in from users (as admin) we don't want to be redirected to the same page
  const shouldRedirect =
    redirectTo !== null && !RESTRICTED_REDIRECT_ROUTES.includes(redirectTo);

  return (
    <AuthLayout title="Log in">
      <LoginForm
        onSuccess={() => {
          navigate(`${shouldRedirect ? `${redirectTo}` : '/'}`, {
            replace: true,
          });
        }}
      />
    </AuthLayout>
  );
};
