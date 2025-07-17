import { useParams } from 'react-router-dom';

import { ImageWithWithBlockLayout } from '@/components/layouts';
import { SetPasswordForm } from '@/features/auth/components/set-password-form';

export const SetPasswordRoute = () => {
  const params = useParams();
  const id = params.id as string;
  const secret = params.secret as string;

  return (
    <ImageWithWithBlockLayout title="Set password">
      <SetPasswordForm id={id} secret={secret} />
    </ImageWithWithBlockLayout>
  );
};
