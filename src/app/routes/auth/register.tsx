import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { RegisterLayout } from '@/components/layouts/register-layout';
import { env } from '@/config/env';
import { CouponCodeAccessForm } from '@/features/auth/components/coupon-code-access-form';
import { RegisterForm } from '@/features/auth/components/register';

export const RegisterRoute = () => {
  const navigate = useNavigate();

  const [couponValidated, setCouponValidated] = useState(!env.ENABLE_WAITLIST);

  return (
    <RegisterLayout>
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
    </RegisterLayout>
  );
};
