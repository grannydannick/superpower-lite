import { useEffect } from 'react';

import { ClaimBenefitForm } from '@/features/auth/components/b2b-benefits/claim-benefit-form';
import { StripeProvider } from '@/lib/stripe';

export const ClaimBenefitRoute = () => {
  // this is basic hook to prevent refreshses during checkout operation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <StripeProvider>
      <ClaimBenefitForm />
    </StripeProvider>
  );
};
