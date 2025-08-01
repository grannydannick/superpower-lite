// ConsentModal.tsx
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useGetConsent } from '@/features/consent/api';
import { InformedConsentStep } from '@/features/home/components/modals/consent-modal-informed-consent-step';
import { ConsentNoticeStep } from '@/features/home/components/modals/consent-modal-notice-step';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { useUser } from '@/lib/auth';
import { useAuthorization } from '@/lib/authorization';
import { StepItem, StepperStoreProvider, useStepper } from '@/lib/stepper';

const steps: StepItem[] = [
  {
    id: 'consent_notice',
    content: <ConsentNoticeStep />,
  },
  {
    id: 'informed-consent',
    content: <InformedConsentStep />,
  },
];

interface ConsentModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialStep?: 'consent_notice' | 'informed-consent';
}

export const ConsentModal = ({
  open,
  onOpenChange,
  initialStep,
}: ConsentModalProps = {}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const { data: user } = useUser();
  const { checkAdminActorAccess } = useAuthorization();
  const isAdminActor = checkAdminActorAccess();
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;

  const consentQuery = useGetConsent({
    userId: user?.id || '',
  });

  const isOpen = open !== undefined ? open : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;

  // Handle modal opening logic - check URL parameters and server state
  useEffect(() => {
    if (open === undefined && user && !consentQuery.isLoading) {
      const hasConsent = consentQuery.data?.exists;

      // Check URL parameters first
      const urlParams = new URLSearchParams(window.location.search);
      const showConsentFromUrl = urlParams.get('consent') === 'true';

      if (showConsentFromUrl && !hasConsent) {
        setInternalIsOpen(true);
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }

      // If no consent exists, show modal (for page refreshes and direct access)
      if (!hasConsent) {
        setInternalIsOpen(true);
      }
    }
  }, [user, open, consentQuery.data, consentQuery.isLoading]);

  if (!user || isAdminActor) return null;

  const stepId = initialStep || 'consent_notice';
  const initialStepIndex = steps.findIndex((s) => s.id === stepId);

  const Step = () => {
    const { steps, activeStep } = useStepper((s) => s);
    const currentStep = steps[activeStep];

    return currentStep?.content ?? null;
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          className="overflow-hidden rounded-2xl px-5 pt-20 max-md:pb-24"
          onPointerDownOutside={(e) => e.preventDefault()}
          data-testid="consent-modal"
        >
          <AnimatePresence>
            <StepperStoreProvider steps={steps} initialStep={initialStepIndex}>
              <Step />
            </StepperStoreProvider>
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="overflow-hidden px-16 pt-20"
        onPointerDownOutside={(e) => e.preventDefault()}
        data-testid="consent-modal"
      >
        <AnimatePresence>
          <StepperStoreProvider steps={steps} initialStep={initialStepIndex}>
            <Step />
          </StepperStoreProvider>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
