import { useParams } from 'react-router';

import { AuthLayout } from '@/components/layouts';
import { SetPasswordForm } from '@/features/auth/components/set-password-form';

export const SetPasswordRoute = () => {
  const params = useParams();
  const id = params.id as string;
  const secret = params.secret as string;

  return (
    <AuthLayout title="Set password">
      <SetPasswordForm id={id} secret={secret} />
    </AuthLayout>
  );
};
