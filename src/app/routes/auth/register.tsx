import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthLayout } from '@/components/layouts/auth-layout';
import { CouponCodeAccessForm } from '@/features/auth/components/coupon-code-access-form';
import { RegisterForm } from '@/features/auth/components/register-form';

export const RegisterRoute = () => {
  const navigate = useNavigate();

  const [couponValidated, setCouponValidated] = useState(false);

  return (
    <AuthLayout title="Register your account">
      {couponValidated ? (
        <RegisterForm
          onSuccess={() =>
            navigate('/onboarding', {
              replace: true,
            })
          }
        />
      ) : (
        <CouponCodeAccessForm codeValidated={() => setCouponValidated(true)} />
      )}
    </AuthLayout>
  );
};
