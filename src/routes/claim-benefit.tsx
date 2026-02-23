import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { Suspense, useEffect } from 'react';
import * as z from 'zod';

import { SuperpowerLoadingLogo } from '@/components/icons/superpower-logo';
import { ClaimBenefitForm } from '@/features/auth/components/b2b-benefits/claim-benefit-form';
import { LazyStripeProvider } from '@/lib/lazy-stripe-provider';

const claimBenefitSearchSchema = z.object({
  id: z.string().optional(),
});

export const Route = createFileRoute('/claim-benefit')({
  validateSearch: zodValidator(claimBenefitSearchSchema),
  component: ClaimBenefitComponent,
});

function ClaimBenefitComponent() {
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
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <SuperpowerLoadingLogo />
          <span className="sr-only">Loading</span>
        </div>
      }
    >
      <LazyStripeProvider>
        <ClaimBenefitForm />
      </LazyStripeProvider>
    </Suspense>
  );
}
