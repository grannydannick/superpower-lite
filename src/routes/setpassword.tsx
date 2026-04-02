import { createFileRoute } from '@tanstack/react-router';

import { AuthLayout } from '@/components/layouts';
import { SetPasswordForm } from '@/features/auth/components/set-password-form';

export const Route = createFileRoute('/setpassword')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : '',
  }),
  component: SetPasswordComponent,
});

function SetPasswordComponent() {
  const { token } = Route.useSearch();

  return (
    <AuthLayout title="Set password">
      <SetPasswordForm token={token} />
    </AuthLayout>
  );
}
