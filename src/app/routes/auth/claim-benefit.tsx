import { useEffect } from 'react';

import { ClaimBenefitForm } from '@/features/auth/components/b2b-benefits/claim-benefit-form';

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

  return <ClaimBenefitForm />;
};
