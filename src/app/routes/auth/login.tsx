import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ImageWithWithBlockLayout } from '@/components/layouts/image-with-block-layout';
import { LoginForm } from '@/features/auth/components/login-form';
import { useUser } from '@/lib/auth';

const RESTRICTED_REDIRECT_ROUTES = ['/users'];

export const LoginRoute = () => {
  const user = useUser();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

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
    <ImageWithWithBlockLayout title="Log in">
      <LoginForm
        onSuccess={() => {
          navigate(`${shouldRedirect ? `${redirectTo}` : '/'}`, {
            replace: true,
          });
        }}
      />
    </ImageWithWithBlockLayout>
  );
};
