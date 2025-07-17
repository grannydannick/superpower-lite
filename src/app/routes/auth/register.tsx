import { useNavigate } from 'react-router-dom';

import { RegisterForm } from '@/features/auth/components/register';

export const RegisterRoute = () => {
  const navigate = useNavigate();

  return (
    <RegisterForm
      onSuccess={() =>
        navigate('/onboarding', {
          replace: true,
        })
      }
    />
  );
};
