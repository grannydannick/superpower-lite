import { createFileRoute, redirect } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { useCallback } from 'react';
import * as z from 'zod';

import { AuthLayout } from '@/components/layouts';
import { LoginForm } from '@/features/auth/components/login-form';
import { useAnalytics } from '@/hooks/use-analytics';
import { authenticatedUserQueryOptions } from '@/lib/auth';
import { getActiveLogin } from '@/lib/utils';
import { User } from '@/types/api';

const signinSearchSchema = z.object({
  redirectTo: z.string().optional(),
  email: z.string().optional(),
});

const RESTRICTED_REDIRECT_ROUTES = ['/users'];

export const Route = createFileRoute('/signin')({
  validateSearch: zodValidator(signinSearchSchema),
  beforeLoad: async ({ search, context: { queryClient } }) => {
    const redirectTo = search.redirectTo;

    if (getActiveLogin() === null) {
      return;
    }

    const user = await queryClient
      .ensureQueryData(authenticatedUserQueryOptions())
      .catch(() => null);
    if (user === null) {
      return;
    }

    // when we sign in from users (as admin) we don't want to be redirected to the same page
    if (
      redirectTo != null &&
      !RESTRICTED_REDIRECT_ROUTES.includes(redirectTo)
    ) {
      throw redirect({
        href: redirectTo,
        replace: true,
      });
    }

    throw redirect({
      to: '/',
      replace: true,
    });
  },
  component: SigninComponent,
});

function SigninComponent() {
  const navigate = Route.useNavigate();
  const redirectTo = Route.useSearch({ select: (s) => s.redirectTo });
  const { identify, track } = useAnalytics();

  const shouldRedirect =
    redirectTo != null && !RESTRICTED_REDIRECT_ROUTES.includes(redirectTo);

  const handleLoginWithPasswordSuccess = useCallback(
    (user: User) => {
      track('logged_in', {
        method: 'password',
      });
      if (shouldRedirect && redirectTo != null) {
        void navigate({ href: redirectTo, replace: true });
      } else {
        void navigate({ to: '/', replace: true });
      }
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

  const handleLoginWithMagicLinkSuccess = useCallback(
    (email: string) => {
      void navigate({
        to: '/check-email',
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
        redirectTo={redirectTo}
        onSuccessWithPassword={handleLoginWithPasswordSuccess}
        onSuccessWithMagicLink={handleLoginWithMagicLinkSuccess}
      />
    </AuthLayout>
  );
}
