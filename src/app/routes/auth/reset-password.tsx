import { ImageWithWithBlockLayout } from '@/components/layouts';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

export const ResetPasswordRoute = () => {
  return (
    <ImageWithWithBlockLayout title="Reset password">
      <ResetPasswordForm />
    </ImageWithWithBlockLayout>
  );
};
