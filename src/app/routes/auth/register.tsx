import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AuthLayout } from '@/components/layouts/auth-layout';
import { CouponCodeAccessForm } from '@/features/auth/components/coupon-code-access-form';
import { RegisterForm } from '@/features/auth/components/register-form';

export const RegisterRoute = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const [couponValidated, setCouponValidated] = useState(false);

  return (
    <AuthLayout title="Register your account">
      {couponValidated ? (
        <RegisterForm
          onSuccess={() =>
            navigate(`${redirectTo ? `${redirectTo}` : '/'}`, {
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
